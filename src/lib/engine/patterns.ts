import type {
  Arena,
  PatternId,
  PatternParams,
  TargetFrame,
  TargetRole,
} from "./types";
import { createRng, type Rng } from "./random";
import {
  TAU,
  clamp,
  createPatternPathCacheState,
  curveCacheKey,
  pingPong,
  resolvePatternBounds,
  sampleClosedCurve,
  sampleClosedPolyline,
  type PatternPathCacheState,
} from "./pattern-paths";

const DEFAULT_TARGET_COLOR = "#76d900";
const DEFAULT_SECONDARY_COLOR = "#3ddbd9";
const HARD_TURN_RANDOM_OFFSET = 40_000;
const HARD_TURN_RANDOM_STRIDE = 60;
const HARD_TURN_CANDIDATE_COUNT = 24;
const HARD_TURN_MIN_DISTANCE_RATIO = 0.55;
const HARD_TURN_RETAINED_SEGMENTS = 2;
const DIAGONAL_X_RATE = 0.72;
const DIAGONAL_Y_RATE = 1;
const DIAGONAL_SPEED_SCALE = 1 / Math.hypot(DIAGONAL_X_RATE, DIAGONAL_Y_RATE);
const BOUNCE_X_RATE = 0.93;
const BOUNCE_Y_RATE = 0.67;
const BOUNCE_SPEED_SCALE = 1 / Math.hypot(BOUNCE_X_RATE, BOUNCE_Y_RATE);

type PatternSamplerState = PatternPathCacheState & {
  randomWalkState: RandomWalkState | null;
  hardTurnWaypointCache: HardTurnWaypointCache | null;
  motRandomWalkCache: MotRandomWalkCache | null;
};

const createPatternSamplerState = (): PatternSamplerState => ({
  ...createPatternPathCacheState(),
  randomWalkState: null,
  hardTurnWaypointCache: null,
  motRandomWalkCache: null,
});

let activeSamplerState = createPatternSamplerState();

const withSamplerState = <Result>(
  state: PatternSamplerState,
  sample: () => Result,
) => {
  const previousState = activeSamplerState;
  activeSamplerState = state;
  try {
    return sample();
  } finally {
    activeSamplerState = previousState;
  }
};

export type PatternSampler = {
  sampleInto: typeof samplePatternInto;
  sample: typeof samplePattern;
  run: <Result>(sample: () => Result) => Result;
  reset: () => void;
};

type RandomWalkState = {
  seed: number;
  key: string;
  x: number;
  y: number;
  heading: number;
  targetHeading: number;
  turnIndex: number;
  nextTurnTravel: number;
  lastTravelPx: number;
};

type HardTurnWaypointCache = {
  seed: number;
  key: string;
  startIndex: number;
  points: Array<[number, number]>;
  distances: number[];
};

type MotRandomWalkObject = {
  rng: Rng;
  state: RandomWalkState;
};

type MotRandomWalkCache = {
  seed: number;
  key: string;
  total: number;
  objects: MotRandomWalkObject[];
};

export const withIsolatedPatternSampling = <Result>(
  samplePreview: () => Result,
) => {
  return withSamplerState(createPatternSamplerState(), samplePreview);
};

const shortestAngleDelta = (from: number, to: number) => {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
};

const getHardTurnWaypoint = (
  rng: Rng,
  key: string,
  index: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  if (
    !activeSamplerState.hardTurnWaypointCache ||
    activeSamplerState.hardTurnWaypointCache.seed !== rng.seed ||
    activeSamplerState.hardTurnWaypointCache.key !== key
  ) {
    activeSamplerState.hardTurnWaypointCache = {
      seed: rng.seed,
      key,
      startIndex: 0,
      points: [],
      distances: [],
    };
  }

  const cache = activeSamplerState.hardTurnWaypointCache;
  if (index < cache.startIndex) {
    cache.startIndex = 0;
    cache.points = [];
    cache.distances = [];
  }

  const points = cache.points;
  const distances = cache.distances;
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const minDistance = Math.min(width, height) * HARD_TURN_MIN_DISTANCE_RATIO;

  for (
    let pointIndex = cache.startIndex + points.length;
    pointIndex <= index;
    pointIndex += 1
  ) {
    if (pointIndex === 0) {
      points.push([
        rng.rangeAt(HARD_TURN_RANDOM_OFFSET, left, right),
        rng.rangeAt(HARD_TURN_RANDOM_OFFSET + 1, top, bottom),
      ]);
      distances.push(0);
      continue;
    }

    const previous = points[pointIndex - cache.startIndex - 1];
    const previousDistance = distances[pointIndex - cache.startIndex - 1];
    let bestX = previous[0];
    let bestY = previous[1];
    let bestDistance = -1;

    for (
      let candidateIndex = 0;
      candidateIndex < HARD_TURN_CANDIDATE_COUNT;
      candidateIndex += 1
    ) {
      const randomIndex =
        HARD_TURN_RANDOM_OFFSET +
        pointIndex * HARD_TURN_RANDOM_STRIDE +
        candidateIndex * 2;
      const candidateX = rng.rangeAt(randomIndex, left, right);
      const candidateY = rng.rangeAt(randomIndex + 1, top, bottom);
      const distance = Math.hypot(
        candidateX - previous[0],
        candidateY - previous[1],
      );

      if (distance >= minDistance) {
        bestX = candidateX;
        bestY = candidateY;
        break;
      }

      if (distance > bestDistance) {
        bestX = candidateX;
        bestY = candidateY;
        bestDistance = distance;
      }
    }

    const next = [bestX, bestY] satisfies [number, number];
    const length = Math.hypot(next[0] - previous[0], next[1] - previous[1]);
    points.push(next);
    distances.push(previousDistance + length);
  }

  return points[index - cache.startIndex];
};

const trimHardTurnWaypointCache = (segmentStartIndex: number) => {
  const cache = activeSamplerState.hardTurnWaypointCache;
  if (!cache) return;

  const retainedStartIndex = Math.max(
    0,
    segmentStartIndex - HARD_TURN_RETAINED_SEGMENTS,
  );
  const trimCount = retainedStartIndex - cache.startIndex;
  if (trimCount <= 0) return;

  cache.points.splice(0, trimCount);
  cache.distances.splice(0, trimCount);
  cache.startIndex = retainedStartIndex;
};

const sampleHardTurnPath = (
  rng: Rng,
  key: string,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const distancePx = Math.max(0, travelPx);
  if (
    !activeSamplerState.hardTurnWaypointCache ||
    activeSamplerState.hardTurnWaypointCache.seed !== rng.seed ||
    activeSamplerState.hardTurnWaypointCache.key !== key
  ) {
    getHardTurnWaypoint(rng, key, 0, left, top, right, bottom);
  }

  if (distancePx <= 0) {
    return getHardTurnWaypoint(rng, key, 0, left, top, right, bottom);
  }

  const cache = activeSamplerState.hardTurnWaypointCache;
  if (!cache) {
    return getHardTurnWaypoint(rng, key, 0, left, top, right, bottom);
  }

  if (cache.distances[0] > distancePx) {
    activeSamplerState.hardTurnWaypointCache = null;
    return sampleHardTurnPath(rng, key, travelPx, left, top, right, bottom);
  }

  while (cache.distances[cache.distances.length - 1] < distancePx) {
    getHardTurnWaypoint(
      rng,
      key,
      cache.startIndex + cache.points.length,
      left,
      top,
      right,
      bottom,
    );
  }

  let low = cache.startIndex + 1;
  let high = cache.startIndex + cache.distances.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (cache.distances[middle - cache.startIndex] < distancePx) {
      low = middle + 1;
    } else high = middle;
  }

  const endIndex = low;
  const cacheEndIndex = endIndex - cache.startIndex;
  const start = cache.points[cacheEndIndex - 1];
  const end = cache.points[cacheEndIndex];
  const startDistance = cache.distances[cacheEndIndex - 1];
  const segmentLength = cache.distances[cacheEndIndex] - startDistance;

  if (segmentLength <= 0) return start;

  const progress = (distancePx - startDistance) / segmentLength;
  trimHardTurnWaypointCache(endIndex - 1);
  return [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
  ] satisfies [number, number];
};

const createRandomWalkState = (
  rng: Rng,
  key: string,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const heading = rng.rangeAt(90_001, 0, TAU);
  return {
    seed: rng.seed,
    key,
    x: rng.rangeAt(90_002, left, right),
    y: rng.rangeAt(90_003, top, bottom),
    heading,
    targetHeading: heading,
    turnIndex: 0,
    nextTurnTravel: travelPx + rng.rangeAt(90_004, 150, 340),
    lastTravelPx: travelPx,
  } satisfies RandomWalkState;
};

const initializeRandomWalk = (
  rng: Rng,
  key: string,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const state = createRandomWalkState(
    rng,
    key,
    travelPx,
    left,
    top,
    right,
    bottom,
  );
  activeSamplerState.randomWalkState = state;
  return state;
};

const advanceRandomWalk = (
  state: RandomWalkState,
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  let remainingPx = Math.min(260, Math.max(0, travelPx - state.lastTravelPx));
  state.lastTravelPx = travelPx;

  while (remainingPx > 0) {
    const stepPx = Math.min(remainingPx, 5);
    remainingPx -= stepPx;

    if (travelPx >= state.nextTurnTravel) {
      state.turnIndex += 1;
      const wander =
        Math.sin((travelPx + rng.seed * 0.17) / 180) * 0.28 +
        Math.sin((travelPx + rng.seed * 0.31) / 310) * 0.18;
      const randomHeading =
        state.heading +
        wander +
        rng.rangeAt(91_000 + state.turnIndex, -1.85, 1.85);
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      const offsetX = (state.x - centerX) / Math.max(1, (right - left) / 2);
      const offsetY = (state.y - centerY) / Math.max(1, (bottom - top) / 2);
      const centerBias =
        clamp((Math.hypot(offsetX, offsetY) - 0.35) / 0.65, 0, 1) * 0.75;
      const centerHeading = Math.atan2(centerY - state.y, centerX - state.x);
      state.targetHeading =
        randomHeading +
        shortestAngleDelta(randomHeading, centerHeading) * centerBias;
      state.nextTurnTravel =
        travelPx + rng.rangeAt(92_000 + state.turnIndex, 160, 360);
    }

    const drift =
      Math.sin((travelPx + rng.seed * 0.41) / 220) * 0.0018 +
      Math.sin((travelPx + rng.seed * 0.73) / 380) * 0.0012;
    state.heading +=
      shortestAngleDelta(state.heading, state.targetHeading) *
        Math.min(1, stepPx / 150) +
      drift * stepPx;
    state.x += Math.cos(state.heading) * stepPx;
    state.y += Math.sin(state.heading) * stepPx;

    let nextX = state.x;
    let nextY = state.y;
    let reflectedX = false;
    let reflectedY = false;

    if (right <= left) {
      nextX = left;
    } else {
      while (nextX < left || nextX > right) {
        if (nextX < left) {
          nextX = left + (left - nextX);
        } else {
          nextX = right - (nextX - right);
        }
        reflectedX = !reflectedX;
      }
    }

    if (bottom <= top) {
      nextY = top;
    } else {
      while (nextY < top || nextY > bottom) {
        if (nextY < top) {
          nextY = top + (top - nextY);
        } else {
          nextY = bottom - (nextY - bottom);
        }
        reflectedY = !reflectedY;
      }
    }

    state.x = nextX;
    state.y = nextY;

    if (reflectedX) {
      state.heading = Math.PI - state.heading;
      state.targetHeading = state.heading;
    }
    if (reflectedY) {
      state.heading = -state.heading;
      state.targetHeading = state.heading;
    }
  }
};

const writeTarget = (
  frames: TargetFrame[],
  index: number,
  x: number,
  y: number,
  params: PatternParams,
  radiusPx = params.radiusPx,
  color = params.colorA ?? DEFAULT_TARGET_COLOR,
  alpha = 1,
  visible = true,
  role: TargetRole = "target",
) => {
  let frame = frames[index];
  if (!frame) {
    frame = {
      x,
      y,
      radiusPx,
      color,
      alpha,
      visible,
      role,
    };
    frames[index] = frame;
    return index + 1;
  }

  frame.x = x;
  frame.y = y;
  frame.radiusPx = radiusPx;
  frame.color = color;
  frame.alpha = alpha;
  frame.visible = visible;
  frame.role = role;
  return index + 1;
};

const getMotRandomWalkObjects = (
  rng: Rng,
  total: number,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const key = `${Math.round(left)}:${Math.round(top)}:${Math.round(right)}:${Math.round(bottom)}`;
  const cache = activeSamplerState.motRandomWalkCache;
  if (
    cache &&
    cache.seed === rng.seed &&
    cache.key === key &&
    cache.total === total &&
    cache.objects.every((object) => travelPx >= object.state.lastTravelPx)
  ) {
    return cache.objects;
  }

  const objects: MotRandomWalkObject[] = [];
  for (let index = 0; index < total; index += 1) {
    const objectRng = createRng(rng.seed + 120_000 + index * 9_973);
    objects.push({
      rng: objectRng,
      state: createRandomWalkState(
        objectRng,
        `${key}:${index}`,
        travelPx,
        left,
        top,
        right,
        bottom,
      ),
    });
  }

  activeSamplerState.motRandomWalkCache = {
    seed: rng.seed,
    key,
    total,
    objects,
  };
  return objects;
};

export const getTeleportJumpDistancePx = (
  arena: Arena,
  radiusPx: number,
  pathMarginPx = 16,
) => {
  const { width, height } = resolvePatternBounds(arena, radiusPx, pathMarginPx);
  return clamp(Math.min(width, height) * 0.55, 420, 820);
};

export const samplePatternInto = (
  frames: TargetFrame[],
  id: PatternId,
  elapsedSec: number,
  arena: Arena,
  params: PatternParams,
  rng: Rng,
): number => {
  const radiusPx = Math.max(1, params.radiusPx);
  const {
    left,
    top,
    right,
    bottom,
    width,
    height,
    centerX: cx,
    centerY: cy,
    radiusX: rx,
    radiusY: ry,
  } = resolvePatternBounds(arena, radiusPx, params.pathMarginPx);
  const speedPxPerSec = Math.max(1, params.speedPxPerSec);
  const travelPx = Number.isFinite(params.travelPx)
    ? params.travelPx
    : elapsedSec * speedPxPerSec;
  const primaryColor = params.colorA ?? DEFAULT_TARGET_COLOR;
  const secondaryColor = params.colorB ?? DEFAULT_SECONDARY_COLOR;

  if (id === "circle") {
    const radius = Math.max(1, Math.min(rx, ry));
    const angle = travelPx / radius;
    return writeTarget(
      frames,
      0,
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "ellipse") {
    const [x, y] = sampleClosedCurve(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 160),
      travelPx,
      160,
      (phase) => {
        const angle = phase * TAU;
        return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "figureEight") {
    const [x, y] = sampleClosedCurve(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 180),
      travelPx,
      180,
      (phase) => {
        const angle = phase * TAU;
        return [
          cx + Math.sin(angle) * rx,
          cy + Math.sin(angle * 2) * ry * 0.72,
        ];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "wave") {
    const [x, y] = sampleClosedCurve(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 120),
      travelPx,
      120,
      (phase) => {
        const angle = phase * TAU;
        return [
          cx + Math.cos(angle) * rx,
          cy + Math.sin(angle * 3) * ry * 0.42,
        ];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "diagonal") {
    return writeTarget(
      frames,
      0,
      left + pingPong(travelPx * DIAGONAL_X_RATE * DIAGONAL_SPEED_SCALE, width),
      top + pingPong(travelPx * DIAGONAL_Y_RATE * DIAGONAL_SPEED_SCALE, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "bounce") {
    return writeTarget(
      frames,
      0,
      left +
        pingPong(
          travelPx * BOUNCE_X_RATE * BOUNCE_SPEED_SCALE + width * 0.18,
          width,
        ),
      top +
        pingPong(
          travelPx * BOUNCE_Y_RATE * BOUNCE_SPEED_SCALE + height * 0.41,
          height,
        ),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "randomWalk") {
    const stateKey = `${Math.round(arena.width)}:${Math.round(arena.height)}`;
    let state = activeSamplerState.randomWalkState;
    if (
      !state ||
      state.seed !== rng.seed ||
      state.key !== stateKey ||
      travelPx < state.lastTravelPx
    ) {
      state = initializeRandomWalk(
        rng,
        stateKey,
        travelPx,
        left,
        top,
        right,
        bottom,
      );
    }
    advanceRandomWalk(state, rng, travelPx, left, top, right, bottom);

    return writeTarget(
      frames,
      0,
      state.x,
      state.y,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "directionChange") {
    const waypointKey = `${Math.round(left)}:${Math.round(top)}:${Math.round(right)}:${Math.round(bottom)}`;
    const [x, y] = sampleHardTurnPath(
      rng,
      waypointKey,
      travelPx,
      left,
      top,
      right,
      bottom,
    );

    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "teleport") {
    const jumpDistancePx = getTeleportJumpDistancePx(
      arena,
      radiusPx,
      params.pathMarginPx,
    );
    const bucket = Math.floor(travelPx / jumpDistancePx);
    const phase = (travelPx - bucket * jumpDistancePx) / jumpDistancePx;
    return writeTarget(
      frames,
      0,
      rng.rangeAt(bucket * 2, left, right),
      rng.rangeAt(bucket * 2 + 1, top, bottom),
      params,
      radiusPx,
      primaryColor,
      phase < 0.08 ? 0.35 : 1,
    );
  }

  if (id === "horizontalSweep") {
    return writeTarget(
      frames,
      0,
      left + pingPong(travelPx, width),
      cy,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "verticalSweep") {
    return writeTarget(
      frames,
      0,
      cx,
      top + pingPong(travelPx, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "downRightSweep") {
    const diagonalLength = Math.max(1, Math.hypot(width, height));
    const progress = pingPong(travelPx, diagonalLength) / diagonalLength;
    return writeTarget(
      frames,
      0,
      left + width * progress,
      top + height * progress,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "downLeftSweep") {
    const diagonalLength = Math.max(1, Math.hypot(width, height));
    const progress = pingPong(travelPx, diagonalLength) / diagonalLength;
    return writeTarget(
      frames,
      0,
      right - width * progress,
      top + height * progress,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "perimeterLoop") {
    const [x, y] = sampleClosedPolyline(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 4),
      travelPx,
      4,
      (index) => {
        if (index === 0) return [left, top];
        if (index === 1) return [right, top];
        if (index === 2) return [right, bottom];
        return [left, bottom];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "diamondLoop") {
    const [x, y] = sampleClosedPolyline(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 4),
      travelPx,
      4,
      (index) => {
        if (index === 0) return [cx, top];
        if (index === 1) return [right, cy];
        if (index === 2) return [cx, bottom];
        return [left, cy];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "clover") {
    const [x, y] = sampleClosedCurve(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 160),
      travelPx,
      160,
      (phase) => {
        const angle = phase * TAU;
        const petal = 0.58 + 0.3 * Math.cos(angle * 4);
        return [
          cx + Math.cos(angle) * rx * petal,
          cy + Math.sin(angle) * ry * petal,
        ];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "zigZag") {
    const lanes = 5;
    const [x, y] = sampleClosedPolyline(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, lanes),
      travelPx,
      lanes,
      (index) => [
        index % 2 === 0 ? left : right,
        top + (height * index) / (lanes - 1),
      ],
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "stairStep") {
    const rows = 4;
    const columns = 5;
    const pointCount = rows * columns;
    const [x, y] = sampleClosedPolyline(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, pointCount),
      travelPx,
      pointCount,
      (index) => {
        const row = index % rows;
        const column = Math.floor(index / rows) % columns;
        return [
          left + (column * width) / Math.max(1, columns - 1),
          top + (row * height) / Math.max(1, rows - 1),
        ];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "lissajous") {
    const [x, y] = sampleClosedCurve(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 180),
      travelPx,
      180,
      (phase) => {
        const angle = phase * TAU;
        return [
          cx + Math.sin(angle * 3 + Math.PI / 2) * rx,
          cy + Math.sin(angle * 2) * ry,
        ];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "hourglass") {
    const [x, y] = sampleClosedCurve(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 160),
      travelPx,
      160,
      (phase) => {
        const angle = phase * TAU;
        const vertical = Math.sin(angle);
        const pinch = 0.22 + 0.74 * Math.abs(vertical);
        return [cx + Math.sin(angle * 2) * rx * pinch, cy + vertical * ry];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "cornerTour") {
    const insetX = width * 0.18;
    const insetY = height * 0.18;
    const [x, y] = sampleClosedPolyline(
      activeSamplerState,
      curveCacheKey(id, left, top, right, bottom, 4),
      travelPx,
      4,
      (index) => {
        if (index === 0) return [left, top];
        if (index === 1) return [right - insetX, top + insetY];
        if (index === 2) return [right, bottom];
        return [left + insetX, bottom - insetY];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "multipleObjectTracking") {
    const targetCount = clamp(Math.round(params.targetCount ?? 3), 1, 12);
    const distractorCount = clamp(
      Math.round(params.distractorCount ?? 5),
      0,
      20,
    );
    const total = targetCount + distractorCount;
    const objects = getMotRandomWalkObjects(
      rng,
      total,
      travelPx,
      left,
      top,
      right,
      bottom,
    );
    let count = 0;

    for (let index = 0; index < total; index += 1) {
      const object = objects[index];
      const role: TargetRole = index < targetCount ? "target" : "distractor";
      advanceRandomWalk(
        object.state,
        object.rng,
        travelPx,
        left,
        top,
        right,
        bottom,
      );
      count = writeTarget(
        frames,
        count,
        object.state.x,
        object.state.y,
        params,
        radiusPx,
        role === "target" ? primaryColor : secondaryColor,
        1,
        true,
        role,
      );
    }

    return count;
  }

  return samplePatternInto(frames, "ellipse", elapsedSec, arena, params, rng);
};

export const samplePattern = (
  id: PatternId,
  elapsedSec: number,
  arena: Arena,
  params: PatternParams,
  rng: Rng,
) => {
  const frames: TargetFrame[] = [];
  const count = samplePatternInto(frames, id, elapsedSec, arena, params, rng);
  frames.length = count;
  return frames;
};

export const createPatternSampler = (): PatternSampler => {
  let state = createPatternSamplerState();

  return {
    sampleInto: (...args) =>
      withSamplerState(state, () => samplePatternInto(...args)),
    sample: (...args) => withSamplerState(state, () => samplePattern(...args)),
    run: (sample) => withSamplerState(state, sample),
    reset: () => {
      state = createPatternSamplerState();
    },
  };
};

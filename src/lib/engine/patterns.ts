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
  createScaledTravelState,
  curveCacheKey,
  pingPong,
  resolveScaledTravel,
  resolvePatternBounds,
  sampleClosedCurve,
  sampleClosedPolyline,
  type PatternPathCacheState,
  type ScaledTravelState,
} from "./pattern-paths";

const DEFAULT_TARGET_COLOR = "#76d900";
const DEFAULT_SECONDARY_COLOR = "#3ddbd9";
const HARD_TURN_RANDOM_OFFSET = 40_000;
const HARD_TURN_RANDOM_STRIDE = 60;
const HARD_TURN_CANDIDATE_COUNT = 24;
const HARD_TURN_MIN_DISTANCE_RATIO = 0.55;
const DIAGONAL_X_RATE = 0.72;
const DIAGONAL_Y_RATE = 1;
const DIAGONAL_SPEED_SCALE = 1 / Math.hypot(DIAGONAL_X_RATE, DIAGONAL_Y_RATE);
const BOUNCE_X_RATE = 0.93;
const BOUNCE_Y_RATE = 0.67;
const BOUNCE_SPEED_SCALE = 1 / Math.hypot(BOUNCE_X_RATE, BOUNCE_Y_RATE);
const RANDOM_WALK_STEP_PX = 5;

type PatternSamplerState = PatternPathCacheState & {
  primaryTravelState: ScaledTravelState;
  xTravelState: ScaledTravelState;
  yTravelState: ScaledTravelState;
  randomWalkCache: RandomWalkCache | null;
  hardTurnState: HardTurnState | null;
  motRandomWalkCache: MotRandomWalkCache | null;
};

const createPatternSamplerState = (): PatternSamplerState => ({
  ...createPatternPathCacheState(),
  primaryTravelState: createScaledTravelState(),
  xTravelState: createScaledTravelState(),
  yTravelState: createScaledTravelState(),
  randomWalkCache: null,
  hardTurnState: null,
  motRandomWalkCache: null,
});

type PatternSampler = {
  sampleInto: (
    frames: TargetFrame[],
    id: PatternId,
    elapsedSec: number,
    arena: Arena,
    params: PatternParams,
    rng: Rng,
  ) => number;
  reset: () => void;
};

type RandomWalkState = {
  seed: number;
  x: number;
  y: number;
  heading: number;
  targetHeading: number;
  turnIndex: number;
  nextTurnTravel: number;
  committedTravelPx: number;
  lastSampleTravelPx: number;
};

type HardTurnState = {
  seed: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  nextWaypointIndex: number;
  lastTravelPx: number;
};

type MotRandomWalkObject = {
  rng: Rng;
  state: RandomWalkState;
  previewState: RandomWalkState;
};

type RandomWalkCache = {
  state: RandomWalkState;
  previewState: RandomWalkState;
};

type MotRandomWalkCache = {
  seed: number;
  objects: MotRandomWalkObject[];
};

const copyRandomWalkState = (
  target: RandomWalkState,
  source: RandomWalkState,
) => {
  target.seed = source.seed;
  target.x = source.x;
  target.y = source.y;
  target.heading = source.heading;
  target.targetHeading = source.targetHeading;
  target.turnIndex = source.turnIndex;
  target.nextTurnTravel = source.nextTurnTravel;
  target.committedTravelPx = source.committedTravelPx;
  target.lastSampleTravelPx = source.lastSampleTravelPx;
};

const shortestAngleDelta = (from: number, to: number) => {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
};

const createHardTurnWaypoint = (
  rng: Rng,
  index: number,
  previousX: number,
  previousY: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const minDistance = Math.min(width, height) * HARD_TURN_MIN_DISTANCE_RATIO;
  let bestX = previousX;
  let bestY = previousY;
  let bestDistance = -1;

  for (
    let candidateIndex = 0;
    candidateIndex < HARD_TURN_CANDIDATE_COUNT;
    candidateIndex += 1
  ) {
    const randomIndex =
      HARD_TURN_RANDOM_OFFSET +
      index * HARD_TURN_RANDOM_STRIDE +
      candidateIndex * 2;
    const candidateX = rng.rangeAt(randomIndex, left, right);
    const candidateY = rng.rangeAt(randomIndex + 1, top, bottom);
    const distance = Math.hypot(candidateX - previousX, candidateY - previousY);

    if (distance >= minDistance) return [candidateX, candidateY] as const;
    if (distance <= bestDistance) continue;

    bestX = candidateX;
    bestY = candidateY;
    bestDistance = distance;
  }

  if (bestDistance <= Number.EPSILON) {
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    return [
      previousX <= centerX ? right : left,
      previousY <= centerY ? bottom : top,
    ] as const;
  }

  return [bestX, bestY] as const;
};

const createHardTurnState = (
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const x = rng.rangeAt(HARD_TURN_RANDOM_OFFSET, left, right);
  const y = rng.rangeAt(HARD_TURN_RANDOM_OFFSET + 1, top, bottom);
  const [targetX, targetY] = createHardTurnWaypoint(
    rng,
    1,
    x,
    y,
    left,
    top,
    right,
    bottom,
  );

  return {
    seed: rng.seed,
    left,
    top,
    right,
    bottom,
    x,
    y,
    targetX,
    targetY,
    nextWaypointIndex: 2,
    lastTravelPx: travelPx,
  } satisfies HardTurnState;
};

const getRayDistanceToBounds = (
  x: number,
  y: number,
  directionX: number,
  directionY: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  let distance = Number.POSITIVE_INFINITY;

  if (directionX > Number.EPSILON) {
    distance = Math.min(distance, (right - x) / directionX);
  } else if (directionX < -Number.EPSILON) {
    distance = Math.min(distance, (left - x) / directionX);
  }
  if (directionY > Number.EPSILON) {
    distance = Math.min(distance, (bottom - y) / directionY);
  } else if (directionY < -Number.EPSILON) {
    distance = Math.min(distance, (top - y) / directionY);
  }

  return Number.isFinite(distance) ? Math.max(0, distance) : 0;
};

const reconcileHardTurnBounds = (
  state: HardTurnState,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  if (
    state.left === left &&
    state.top === top &&
    state.right === right &&
    state.bottom === bottom
  ) {
    return;
  }

  const translationX = clamp(state.x, left, right) - state.x;
  const translationY = clamp(state.y, top, bottom) - state.y;
  state.x += translationX;
  state.y += translationY;
  state.targetX += translationX;
  state.targetY += translationY;
  state.left = left;
  state.top = top;
  state.right = right;
  state.bottom = bottom;
};

const setNextHardTurnWaypoint = (
  state: HardTurnState,
  rng: Rng,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  [state.targetX, state.targetY] = createHardTurnWaypoint(
    rng,
    state.nextWaypointIndex,
    state.x,
    state.y,
    left,
    top,
    right,
    bottom,
  );
  state.nextWaypointIndex += 1;
};

const sampleHardTurnPath = (
  samplerState: PatternSamplerState,
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const distancePx = Number.isFinite(travelPx) ? Math.max(0, travelPx) : 0;
  let state = samplerState.hardTurnState;
  if (!state || state.seed !== rng.seed || distancePx < state.lastTravelPx) {
    state = createHardTurnState(rng, distancePx, left, top, right, bottom);
    samplerState.hardTurnState = state;
  }

  reconcileHardTurnBounds(state, left, top, right, bottom);

  if (right - left < 1 && bottom - top < 1) {
    state.lastTravelPx = distancePx;
    return [state.x, state.y] as const;
  }

  let remainingPx = distancePx - state.lastTravelPx;
  while (remainingPx > 0) {
    const deltaX = state.targetX - state.x;
    const deltaY = state.targetY - state.y;
    const segmentLength = Math.hypot(deltaX, deltaY);

    if (segmentLength <= Number.EPSILON) {
      setNextHardTurnWaypoint(state, rng, left, top, right, bottom);
      continue;
    }

    const directionX = deltaX / segmentLength;
    const directionY = deltaY / segmentLength;
    const availableDistance = getRayDistanceToBounds(
      state.x,
      state.y,
      directionX,
      directionY,
      left,
      top,
      right,
      bottom,
    );
    if (availableDistance <= Number.EPSILON) {
      setNextHardTurnWaypoint(state, rng, left, top, right, bottom);
      continue;
    }

    const stepPx = Math.min(remainingPx, segmentLength, availableDistance);
    state.x = clamp(state.x + directionX * stepPx, left, right);
    state.y = clamp(state.y + directionY * stepPx, top, bottom);
    remainingPx -= stepPx;

    if (
      availableDistance < segmentLength &&
      stepPx >= availableDistance - Number.EPSILON
    ) {
      setNextHardTurnWaypoint(state, rng, left, top, right, bottom);
    }
  }

  state.lastTravelPx = distancePx;
  return [state.x, state.y] as const;
};

const createRandomWalkState = (
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const heading = rng.rangeAt(90_001, 0, TAU);
  return {
    seed: rng.seed,
    x: rng.rangeAt(90_002, left, right),
    y: rng.rangeAt(90_003, top, bottom),
    heading,
    targetHeading: heading,
    turnIndex: 0,
    nextTurnTravel: travelPx + rng.rangeAt(90_004, 150, 340),
    committedTravelPx: travelPx,
    lastSampleTravelPx: travelPx,
  } satisfies RandomWalkState;
};

const initializeRandomWalk = (
  samplerState: PatternSamplerState,
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const state = createRandomWalkState(rng, travelPx, left, top, right, bottom);
  const cache = { state, previewState: { ...state } };
  samplerState.randomWalkCache = cache;
  return cache;
};

const advanceRandomWalk = (
  state: RandomWalkState,
  previewState: RandomWalkState,
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  confineRandomWalkState(state, left, top, right, bottom);
  if (!Number.isFinite(travelPx) || travelPx <= state.committedTravelPx) {
    state.lastSampleTravelPx = travelPx;
    return state;
  }

  while (state.committedTravelPx + RANDOM_WALK_STEP_PX <= travelPx) {
    const nextTravelPx = state.committedTravelPx + RANDOM_WALK_STEP_PX;
    integrateRandomWalkStep(
      state,
      rng,
      nextTravelPx,
      RANDOM_WALK_STEP_PX,
      left,
      top,
      right,
      bottom,
    );
    state.committedTravelPx = nextTravelPx;
  }

  const remainderPx = travelPx - state.committedTravelPx;
  if (remainderPx <= 0) {
    state.lastSampleTravelPx = travelPx;
    return state;
  }

  copyRandomWalkState(previewState, state);
  integrateRandomWalkStep(
    previewState,
    rng,
    travelPx,
    remainderPx,
    left,
    top,
    right,
    bottom,
  );
  state.lastSampleTravelPx = travelPx;
  return previewState;
};

const integrateRandomWalkStep = (
  state: RandomWalkState,
  rng: Rng,
  sampledTravelPx: number,
  stepPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  if (sampledTravelPx >= state.nextTurnTravel) {
    state.turnIndex += 1;
    const wander =
      Math.sin((sampledTravelPx + rng.seed * 0.17) / 180) * 0.28 +
      Math.sin((sampledTravelPx + rng.seed * 0.31) / 310) * 0.18;
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
      sampledTravelPx + rng.rangeAt(92_000 + state.turnIndex, 160, 360);
  }

  const drift =
    Math.sin((sampledTravelPx + rng.seed * 0.41) / 220) * 0.0018 +
    Math.sin((sampledTravelPx + rng.seed * 0.73) / 380) * 0.0012;
  state.heading +=
    shortestAngleDelta(state.heading, state.targetHeading) *
      Math.min(1, stepPx / 150) +
    drift * stepPx;
  state.x += Math.cos(state.heading) * stepPx;
  state.y += Math.sin(state.heading) * stepPx;
  confineRandomWalkState(state, left, top, right, bottom);
};

const confineRandomWalkState = (
  state: RandomWalkState,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  let reflectedX = false;
  let reflectedY = false;

  if (right - left < 1) {
    state.x = (left + right) / 2;
  } else {
    while (state.x < left || state.x > right) {
      if (state.x < left) {
        state.x = left + (left - state.x);
      } else {
        state.x = right - (state.x - right);
      }
      reflectedX = !reflectedX;
    }
  }

  if (bottom - top < 1) {
    state.y = (top + bottom) / 2;
  } else {
    while (state.y < top || state.y > bottom) {
      if (state.y < top) {
        state.y = top + (top - state.y);
      } else {
        state.y = bottom - (state.y - bottom);
      }
      reflectedY = !reflectedY;
    }
  }

  if (reflectedX) {
    state.heading = Math.PI - state.heading;
    state.targetHeading = state.heading;
  }
  if (reflectedY) {
    state.heading = -state.heading;
    state.targetHeading = state.heading;
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
  samplerState: PatternSamplerState,
  rng: Rng,
  total: number,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  let cache = samplerState.motRandomWalkCache;
  let mustResetCache = !cache || cache.seed !== rng.seed;
  if (cache && !mustResetCache) {
    for (let index = 0; index < cache.objects.length; index += 1) {
      if (travelPx >= cache.objects[index].state.lastSampleTravelPx) continue;
      mustResetCache = true;
      break;
    }
  }
  if (mustResetCache || !cache) {
    cache = { seed: rng.seed, objects: [] };
    samplerState.motRandomWalkCache = cache;
  }

  if (cache.objects.length > total) cache.objects.length = total;

  for (let index = cache.objects.length; index < total; index += 1) {
    const objectRng = createRng(rng.seed + 120_000 + index * 9_973);
    const state = createRandomWalkState(
      objectRng,
      travelPx,
      left,
      top,
      right,
      bottom,
    );
    cache.objects.push({ rng: objectRng, state, previewState: { ...state } });
  }

  return cache.objects;
};

export const getTeleportJumpDistancePx = (
  arena: Arena,
  radiusPx: number,
  pathMarginPx = 16,
) => {
  const { width, height } = resolvePatternBounds(arena, radiusPx, pathMarginPx);
  return clamp(Math.min(width, height) * 0.55, 420, 820);
};

const samplePatternInto = (
  samplerState: PatternSamplerState,
  frames: TargetFrame[],
  id: PatternId,
  elapsedSec: number,
  arena: Arena,
  params: PatternParams,
  rng: Rng,
): number => {
  const radiusPx = Number.isFinite(params.radiusPx)
    ? Math.max(1, params.radiusPx)
    : 1;
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
  const speedPxPerSec = Number.isFinite(params.speedPxPerSec)
    ? Math.max(1, params.speedPxPerSec)
    : 1;
  const requestedTravelPx = Number.isFinite(params.travelPx)
    ? params.travelPx
    : elapsedSec * speedPxPerSec;
  const travelPx = Number.isFinite(requestedTravelPx) ? requestedTravelPx : 0;
  const primaryColor = params.colorA ?? DEFAULT_TARGET_COLOR;
  const secondaryColor = params.colorB ?? DEFAULT_SECONDARY_COLOR;

  if (id === "circle") {
    const radius = Math.min(rx, ry);
    const effectiveTravelPx = resolveScaledTravel(
      samplerState.primaryTravelState,
      id,
      `${id}:${radius}`,
      travelPx,
      Math.max(1, radius),
    );
    const angle = effectiveTravelPx / Math.max(1, radius);
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
    const xTravelPx = resolveScaledTravel(
      samplerState.xTravelState,
      `${id}:x`,
      `${id}:x:${width}`,
      travelPx * DIAGONAL_X_RATE * DIAGONAL_SPEED_SCALE,
      width,
    );
    const yTravelPx = resolveScaledTravel(
      samplerState.yTravelState,
      `${id}:y`,
      `${id}:y:${height}`,
      travelPx * DIAGONAL_Y_RATE * DIAGONAL_SPEED_SCALE,
      height,
    );
    return writeTarget(
      frames,
      0,
      left + pingPong(xTravelPx, width),
      top + pingPong(yTravelPx, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "bounce") {
    const xTravelPx = resolveScaledTravel(
      samplerState.xTravelState,
      `${id}:x`,
      `${id}:x:${width}`,
      travelPx * BOUNCE_X_RATE * BOUNCE_SPEED_SCALE,
      width,
    );
    const yTravelPx = resolveScaledTravel(
      samplerState.yTravelState,
      `${id}:y`,
      `${id}:y:${height}`,
      travelPx * BOUNCE_Y_RATE * BOUNCE_SPEED_SCALE,
      height,
    );
    return writeTarget(
      frames,
      0,
      left + pingPong(xTravelPx + width * 0.18, width),
      top + pingPong(yTravelPx + height * 0.41, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "randomWalk") {
    let cache = samplerState.randomWalkCache;
    if (
      !cache ||
      cache.state.seed !== rng.seed ||
      travelPx < cache.state.lastSampleTravelPx
    ) {
      cache = initializeRandomWalk(
        samplerState,
        rng,
        travelPx,
        left,
        top,
        right,
        bottom,
      );
    }
    const sampledState = advanceRandomWalk(
      cache.state,
      cache.previewState,
      rng,
      travelPx,
      left,
      top,
      right,
      bottom,
    );

    return writeTarget(
      frames,
      0,
      sampledState.x,
      sampledState.y,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "directionChange") {
    const [x, y] = sampleHardTurnPath(
      samplerState,
      rng,
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
    const effectiveTravelPx = resolveScaledTravel(
      samplerState.primaryTravelState,
      id,
      `${id}:${jumpDistancePx}`,
      travelPx,
      jumpDistancePx,
    );
    const bucket = Math.floor(effectiveTravelPx / jumpDistancePx);
    const phase =
      (effectiveTravelPx - bucket * jumpDistancePx) / jumpDistancePx;
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
    const effectiveTravelPx = resolveScaledTravel(
      samplerState.primaryTravelState,
      id,
      `${id}:${width}`,
      travelPx,
      width,
    );
    return writeTarget(
      frames,
      0,
      left + pingPong(effectiveTravelPx, width),
      cy,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "verticalSweep") {
    const effectiveTravelPx = resolveScaledTravel(
      samplerState.primaryTravelState,
      id,
      `${id}:${height}`,
      travelPx,
      height,
    );
    return writeTarget(
      frames,
      0,
      cx,
      top + pingPong(effectiveTravelPx, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "downRightSweep") {
    const diagonalLength = Math.max(1, Math.hypot(width, height));
    const effectiveTravelPx = resolveScaledTravel(
      samplerState.primaryTravelState,
      id,
      `${id}:${width}:${height}`,
      travelPx,
      diagonalLength,
    );
    const progress =
      pingPong(effectiveTravelPx, diagonalLength) / diagonalLength;
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
    const effectiveTravelPx = resolveScaledTravel(
      samplerState.primaryTravelState,
      id,
      `${id}:${width}:${height}`,
      travelPx,
      diagonalLength,
    );
    const progress =
      pingPong(effectiveTravelPx, diagonalLength) / diagonalLength;
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      samplerState,
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
      const sampledState = advanceRandomWalk(
        object.state,
        object.previewState,
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
        sampledState.x,
        sampledState.y,
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

  return samplePatternInto(
    samplerState,
    frames,
    "ellipse",
    elapsedSec,
    arena,
    params,
    rng,
  );
};

export const createPatternSampler = (): PatternSampler => {
  let state = createPatternSamplerState();

  return {
    sampleInto: (frames, id, elapsedSec, arena, params, rng) =>
      samplePatternInto(state, frames, id, elapsedSec, arena, params, rng),
    reset: () => {
      state = createPatternSamplerState();
    },
  };
};

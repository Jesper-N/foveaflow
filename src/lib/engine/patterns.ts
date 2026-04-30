import type {
  Arena,
  PatternId,
  PatternParams,
  TargetFrame,
  TargetRole,
} from "./types";
import type { Rng } from "./random";

const TAU = Math.PI * 2;
const DEFAULT_TARGET_COLOR = "#76d900";
const DEFAULT_SECONDARY_COLOR = "#3ddbd9";
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const pingPong = (value: number, length: number) => {
  if (length <= 0) return 0;
  const wrapped = positiveModulo(value, length * 2);
  return wrapped <= length ? wrapped : length * 2 - wrapped;
};

const smoothStep = (value: number) => {
  const progress = clamp(value, 0, 1);
  return progress * progress * (3 - 2 * progress);
};

const pointOnSegment = (
  points: Array<[number, number]>,
  distancePx: number,
  closed = true,
) => {
  if (points.length === 0) return [0, 0] satisfies [number, number];
  if (points.length === 1) return points[0];

  let totalLength = 0;
  const segmentCount = closed ? points.length : points.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    totalLength += Math.hypot(end[0] - start[0], end[1] - start[1]);
  }

  if (totalLength <= 0) return points[0];

  let remaining = positiveModulo(distancePx, totalLength);
  for (let index = 0; index < segmentCount; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    if (remaining <= length) {
      const progress = length <= 0 ? 0 : remaining / length;
      return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress,
      ] satisfies [number, number];
    }
    remaining -= length;
  }

  return points[0];
};

const waypoint = (
  rng: Rng,
  index: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) =>
  [
    rng.rangeAt(index * 2 + 40_000, left, right),
    rng.rangeAt(index * 2 + 40_001, top, bottom),
  ] satisfies [number, number];

const curveCacheKey = (
  id: PatternId,
  left: number,
  top: number,
  right: number,
  bottom: number,
  samples: number,
) =>
  `${id}:${Math.round(left)}:${Math.round(top)}:${Math.round(right)}:${Math.round(bottom)}:${samples}`;

const sampleClosedCurve = (
  key: string,
  travelPx: number,
  samples: number,
  pointAt: (phase: number) => [number, number],
) => {
  if (cachedCurve?.key !== key) {
    cachedCurve = buildClosedCurve(key, samples, pointAt);
  }

  return sampleCurvePath(cachedCurve, travelPx);
};

type CurvePath = {
  key: string;
  points: Array<[number, number]>;
  lengths: number[];
  totalLength: number;
};

let cachedCurve: CurvePath | null = null;

const buildClosedCurve = (
  key: string,
  samples: number,
  pointAt: (phase: number) => [number, number],
): CurvePath => {
  const points: Array<[number, number]> = [];
  const lengths: number[] = [];
  let totalLength = 0;

  for (let index = 0; index <= samples; index += 1) {
    points.push(pointAt(index / samples));
  }

  for (let index = 0; index < samples; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    lengths.push(length);
    totalLength += length;
  }

  return { key, points, lengths, totalLength };
};

const sampleCurvePath = (path: CurvePath, travelPx: number) => {
  if (path.totalLength <= 0) return path.points[0];

  let remaining = positiveModulo(travelPx, path.totalLength);
  for (let index = 0; index < path.lengths.length; index += 1) {
    const length = path.lengths[index];
    if (remaining <= length) {
      const start = path.points[index];
      const end = path.points[index + 1];
      const progress = length <= 0 ? 0 : remaining / length;
      return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress,
      ] satisfies [number, number];
    }
    remaining -= length;
  }

  return path.points[0];
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

let randomWalkState: RandomWalkState | null = null;

type MotObjectParams = {
  speedScaleX: number;
  speedScaleY: number;
  phaseX: number;
  phaseY: number;
};

type MotParamsCache = {
  seed: number;
  total: number;
  width: number;
  height: number;
  objects: MotObjectParams[];
};

let motParamsCache: MotParamsCache | null = null;

export const withIsolatedPatternSampling = <Result>(
  samplePreview: () => Result,
) => {
  const previousCachedCurve = cachedCurve;
  const previousRandomWalkState = randomWalkState
    ? { ...randomWalkState }
    : null;
  const previousMotParamsCache = motParamsCache;

  try {
    return samplePreview();
  } finally {
    cachedCurve = previousCachedCurve;
    randomWalkState = previousRandomWalkState;
    motParamsCache = previousMotParamsCache;
  }
};

const shortestAngleDelta = (from: number, to: number) => {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
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
  const heading = rng.rangeAt(90_001, 0, TAU);
  const state: RandomWalkState = {
    seed: rng.seed,
    key,
    x: rng.rangeAt(90_002, left, right),
    y: rng.rangeAt(90_003, top, bottom),
    heading,
    targetHeading: heading,
    turnIndex: 0,
    nextTurnTravel: travelPx + rng.rangeAt(90_004, 150, 340),
    lastTravelPx: travelPx,
  };
  randomWalkState = state;
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
      state.targetHeading =
        state.heading +
        wander +
        rng.rangeAt(91_000 + state.turnIndex, -1.85, 1.85);
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

    if (state.x < left || state.x > right) {
      state.x = clamp(state.x, left, right);
      state.heading = Math.PI - state.heading;
      state.targetHeading = state.heading;
    }
    if (state.y < top || state.y > bottom) {
      state.y = clamp(state.y, top, bottom);
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

const getMotObjectParams = (
  rng: Rng,
  total: number,
  width: number,
  height: number,
) => {
  if (
    motParamsCache &&
    motParamsCache.seed === rng.seed &&
    motParamsCache.total === total &&
    motParamsCache.width === width &&
    motParamsCache.height === height
  ) {
    return motParamsCache.objects;
  }

  const objects: MotObjectParams[] = [];
  for (let index = 0; index < total; index += 1) {
    const base = index * 10;
    objects.push({
      speedScaleX: rng.rangeAt(base, 0.52, 1.26),
      speedScaleY: rng.rangeAt(base + 1, 0.48, 1.18),
      phaseX: rng.rangeAt(base + 2, 0, width * 2),
      phaseY: rng.rangeAt(base + 3, 0, height * 2),
    });
  }

  motParamsCache = {
    seed: rng.seed,
    total,
    width,
    height,
    objects,
  };
  return objects;
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
  const requestedMargin = Math.max(params.pathMarginPx ?? 16, radiusPx + 8);
  const maxMargin = Math.max(1, Math.min(arena.width, arena.height) / 2);
  const margin = Math.min(requestedMargin, maxMargin);
  const left = margin;
  const top = margin;
  const right = Math.max(left, arena.width - margin);
  const bottom = Math.max(top, arena.height - margin);
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const cx = arena.width / 2;
  const cy = arena.height / 2;
  const rx = Math.max(1, width / 2);
  const ry = Math.max(1, height / 2);
  const speedPxPerSec = Math.max(1, params.speedPxPerSec);
  const travelPx = params.travelPx || elapsedSec * speedPxPerSec;
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
    const arcScale = Math.max(1, (rx + ry) / 2);
    const angle = travelPx / arcScale;
    return writeTarget(
      frames,
      0,
      cx + Math.cos(angle) * rx,
      cy + Math.sin(angle) * ry,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "figureEight") {
    const arcScale = Math.max(1, (rx + ry) / 2);
    const angle = travelPx / arcScale;
    return writeTarget(
      frames,
      0,
      cx + Math.sin(angle) * rx,
      cy + Math.sin(angle * 2) * ry * 0.72,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "wave") {
    const [x, y] = sampleClosedCurve(
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
      left + pingPong(travelPx * 0.72, width),
      top + pingPong(travelPx, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "bounce") {
    return writeTarget(
      frames,
      0,
      left + pingPong(travelPx * 0.93 + width * 0.18, width),
      top + pingPong(travelPx * 0.67 + height * 0.41, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "randomWalk") {
    const stateKey = `${Math.round(arena.width)}:${Math.round(arena.height)}`;
    let state = randomWalkState;
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
    const segmentPx = Math.max(420, Math.min(arena.width, arena.height) * 0.62);
    const segment = Math.floor(travelPx / segmentPx);
    const partial = smoothStep((travelPx - segment * segmentPx) / segmentPx);
    const [x1, y1] = waypoint(rng, segment, left, top, right, bottom);
    const [x2, y2] = waypoint(rng, segment + 1, left, top, right, bottom);

    return writeTarget(
      frames,
      0,
      x1 + (x2 - x1) * partial,
      y1 + (y2 - y1) * partial,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "teleport") {
    const jumpDistancePx = clamp(Math.min(width, height) * 0.55, 420, 820);
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
      left + pingPong(travelPx * 0.72, width),
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
      top + pingPong(travelPx * 0.72, height),
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "perimeterLoop") {
    const [x, y] = pointOnSegment(
      [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
      ],
      travelPx * 0.62,
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "diamondLoop") {
    const [x, y] = pointOnSegment(
      [
        [cx, top],
        [right, cy],
        [cx, bottom],
        [left, cy],
      ],
      travelPx * 0.68,
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "spiralBloom") {
    const [x, y] = sampleClosedCurve(
      curveCacheKey(id, left, top, right, bottom, 140),
      travelPx,
      140,
      (phase) => {
        const angle = phase * TAU;
        const bloom = 0.42 + 0.5 * ((1 - Math.cos(angle)) / 2);
        return [
          cx + Math.cos(angle) * rx * bloom,
          cy + Math.sin(angle) * ry * bloom,
        ];
      },
    );
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "clover") {
    const [x, y] = sampleClosedCurve(
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
    const points = Array.from({ length: lanes }, (_, index) => {
      const x = index % 2 === 0 ? left : right;
      const y = top + (height * index) / (lanes - 1);
      return [x, y] satisfies [number, number];
    });
    const [x, y] = pointOnSegment(points, travelPx * 1.08, true);
    return writeTarget(frames, 0, x, y, params, radiusPx, primaryColor);
  }

  if (id === "stairStep") {
    const rows = 4;
    const columns = 5;
    const rowHeight = height / Math.max(1, rows - 1);
    const columnWidth = width / Math.max(1, columns - 1);
    const stepDistance = Math.max(1, (rowHeight + columnWidth) * 0.75);
    const step = Math.floor((travelPx * 0.72) / stepDistance);
    const phase = smoothStep(
      (travelPx * 0.72 - step * stepDistance) / stepDistance,
    );
    const row = step % rows;
    const column = Math.floor(step / rows) % columns;
    const nextRow = (row + 1) % rows;
    const nextColumn = nextRow === 0 ? (column + 1) % columns : column;
    return writeTarget(
      frames,
      0,
      left + (column + (nextColumn - column) * phase) * columnWidth,
      top + (row + (nextRow - row) * phase) * rowHeight,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "lissajous") {
    const [x, y] = sampleClosedCurve(
      curveCacheKey(id, left, top, right, bottom, 180),
      travelPx * 0.82,
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
      curveCacheKey(id, left, top, right, bottom, 160),
      travelPx * 0.82,
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

  if (id === "orbitShift") {
    const scale = Math.max(1, (rx + ry) / 2);
    const angle = travelPx / Math.max(1, scale * 0.76);
    const drift = Math.sin(angle * 0.5) * rx * 0.38;
    return writeTarget(
      frames,
      0,
      cx + drift + Math.cos(angle) * rx * 0.42,
      cy + Math.sin(angle) * ry * 0.82,
      params,
      radiusPx,
      primaryColor,
    );
  }

  if (id === "cornerTour") {
    const insetX = width * 0.18;
    const insetY = height * 0.18;
    const [x, y] = pointOnSegment(
      [
        [left, top],
        [right - insetX, top + insetY],
        [right, bottom],
        [left + insetX, bottom - insetY],
      ],
      travelPx * 0.64,
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
    const objects = getMotObjectParams(rng, total, width, height);
    let count = 0;

    for (let index = 0; index < total; index += 1) {
      const object = objects[index];
      const role: TargetRole = index < targetCount ? "target" : "distractor";
      count = writeTarget(
        frames,
        count,
        left + pingPong(travelPx * object.speedScaleX + object.phaseX, width),
        top + pingPong(travelPx * object.speedScaleY + object.phaseY, height),
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
  return frames.slice(0, count);
};

import type { Arena, PatternId } from "./types";

export const TAU = Math.PI * 2;

export type PatternBounds = ReturnType<typeof resolvePatternBounds>;
type Point = [number, number];

export interface PathDefinition {
  kind: "curve" | "polyline";
  samples: number;
  pointAt: (position: number, bounds: PatternBounds) => Point;
}

export interface PatternPathCacheState {
  bounds: PatternBounds | null;
  path: CurvePath | null;
  offset: number;
  position: Point;
}

export interface ScaledTravelState {
  identity: string;
  geometryKey: string | number;
  unitLength: number;
  offset: number;
}

interface CurvePath {
  id: PatternId;
  key: string;
  samples: number;
  points: [number, number][];
  lengths: number[];
  cumulativeLengths: number[];
  totalLength: number;
}

export const createScaledTravelState = (): ScaledTravelState => ({
  geometryKey: "",
  identity: "",
  offset: 0,
  unitLength: 0,
});

export const createPatternPathCacheState = (): PatternPathCacheState => ({
  bounds: null,
  offset: 0,
  path: null,
  position: [0, 0],
});

export const resolveScaledTravel = (
  state: ScaledTravelState,
  identity: string,
  geometryKey: string | number,
  travelPx: number,
  unitLength: number
) => {
  const safeTravelPx = Number.isFinite(travelPx) ? travelPx : 0;
  const safeUnitLength = Number.isFinite(unitLength)
    ? Math.max(0, unitLength)
    : 0;

  if (state.identity !== identity) {
    state.identity = identity;
    state.geometryKey = geometryKey;
    state.unitLength = safeUnitLength;
    state.offset = 0;
    return safeTravelPx;
  }

  if (state.geometryKey !== geometryKey) {
    if (state.unitLength > 0 && safeUnitLength > 0) {
      const previousTravelPx = safeTravelPx + state.offset;
      state.offset =
        (previousTravelPx / state.unitLength) * safeUnitLength - safeTravelPx;
    } else {
      state.offset = 0;
    }
    state.geometryKey = geometryKey;
    state.unitLength = safeUnitLength;
  }

  return safeTravelPx + state.offset;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

export const pingPong = (value: number, length: number) => {
  if (length <= 0) {
    return 0;
  }
  const wrapped = positiveModulo(value, length * 2);
  return wrapped <= length ? wrapped : length * 2 - wrapped;
};

export const resolvePatternBounds = (
  arena: Arena,
  radiusPx: number,
  pathMarginPx = 16
) => {
  const requestedMargin = Math.max(pathMarginPx, radiusPx + 8);
  const maxMargin = Math.max(0, Math.min(arena.width, arena.height) / 2);
  const margin = Math.min(requestedMargin, maxMargin);
  const left = margin;
  const top = margin;
  const right = Math.max(left, arena.width - margin);
  const bottom = Math.max(top, arena.height - margin);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return {
    bottom,
    centerX: arena.width / 2,
    centerY: arena.height / 2,
    height,
    left,
    radiusX: width / 2,
    radiusY: height / 2,
    right,
    top,
    width,
  };
};

const buildPath = (
  id: PatternId,
  key: string,
  bounds: PatternBounds,
  definition: PathDefinition
): CurvePath => {
  const { kind, samples, pointAt } = definition;
  const points: Point[] = [];
  if (kind === "curve") {
    for (let index = 0; index <= samples; index += 1) {
      points.push(pointAt(index / samples, bounds));
    }
  } else {
    for (let index = 0; index < samples; index += 1) {
      points.push(pointAt(index, bounds));
    }
    points.push(points[0] ?? [0, 0]);
  }
  const lengths: number[] = [];
  const cumulativeLengths: number[] = [];
  let totalLength = 0;

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    lengths.push(length);
    totalLength += length;
    cumulativeLengths.push(totalLength);
  }

  return {
    cumulativeLengths,
    id,
    key,
    lengths,
    points,
    samples,
    totalLength,
  };
};

const resizeTravelOffset = (
  previous: CurvePath,
  path: CurvePath,
  travelPx: number,
  offset: number
) => {
  if (
    previous.id !== path.id ||
    previous.totalLength <= 0 ||
    path.totalLength <= 0
  ) {
    return 0;
  }
  const previousTravelPx = travelPx + offset;
  const cycleCount = Math.floor(previousTravelPx / previous.totalLength);
  let remainingPx = positiveModulo(previousTravelPx, previous.totalLength);
  let nextCycleTravelPx = 0;
  for (let index = 0; index < previous.lengths.length; index += 1) {
    const previousLength = previous.lengths[index];
    const nextLength = path.lengths[index] ?? 0;
    if (remainingPx <= previousLength) {
      const progress = previousLength <= 0 ? 0 : remainingPx / previousLength;
      nextCycleTravelPx += nextLength * progress;
      break;
    }
    remainingPx -= previousLength;
    nextCycleTravelPx += nextLength;
  }
  return cycleCount * path.totalLength + nextCycleTravelPx - travelPx;
};

const sampleCurvePath = (
  path: CurvePath,
  travelPx: number,
  position: Point
) => {
  if (path.totalLength <= 0) {
    const [point] = path.points;
    [position[0], position[1]] = point;
    return position;
  }

  const distance = positiveModulo(travelPx, path.totalLength);
  let low = 0;
  let high = path.cumulativeLengths.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (distance <= path.cumulativeLengths[middle]) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  const length = path.lengths[low];
  const segmentStart = low === 0 ? 0 : path.cumulativeLengths[low - 1];
  const progress = length <= 0 ? 0 : (distance - segmentStart) / length;
  const start = path.points[low];
  const end = path.points[low + 1];
  position[0] = start[0] + (end[0] - start[0]) * progress;
  position[1] = start[1] + (end[1] - start[1]) * progress;
  return position;
};

// The returned point is reused by the next sample.
export const samplePatternPath = (
  state: PatternPathCacheState,
  id: PatternId,
  travelPx: number,
  bounds: PatternBounds,
  definition: PathDefinition
) => {
  const safeTravelPx = Number.isFinite(travelPx) ? travelPx : 0;
  let { path } = state;
  if (
    state.bounds !== bounds ||
    path?.id !== id ||
    path.samples !== definition.samples
  ) {
    const key = `${id}:${Math.round(bounds.left)}:${Math.round(bounds.top)}:${Math.round(bounds.right)}:${Math.round(bounds.bottom)}:${definition.samples}`;
    if (path?.key !== key) {
      const nextPath = buildPath(id, key, bounds, definition);
      state.offset = path
        ? resizeTravelOffset(path, nextPath, safeTravelPx, state.offset)
        : 0;
      path = nextPath;
      state.path = path;
    }
    state.bounds = bounds;
  }
  return sampleCurvePath(path, safeTravelPx + state.offset, state.position);
};

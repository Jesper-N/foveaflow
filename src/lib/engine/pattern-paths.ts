import type { Arena, PatternId } from "./types";

export const TAU = Math.PI * 2;

export interface PatternPathCacheState {
  keyCache: {
    id: PatternId;
    left: number;
    top: number;
    right: number;
    bottom: number;
    samples: number;
    key: string;
  } | null;
  cachedCurve: CurvePath | null;
  cachedPolyline: CurvePath | null;
  curveTravelState: ScaledTravelState;
  polylineTravelState: ScaledTravelState;
}

export interface ScaledTravelState {
  identity: string;
  geometryKey: string | number;
  unitLength: number;
  offset: number;
}

interface CurvePath {
  identity: string;
  key: string;
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
  cachedCurve: null,
  cachedPolyline: null,
  curveTravelState: createScaledTravelState(),
  keyCache: null,
  polylineTravelState: createScaledTravelState(),
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

export const curveCacheKey = (
  state: PatternPathCacheState,
  id: PatternId,
  left: number,
  top: number,
  right: number,
  bottom: number,
  samples: number
) => {
  let cache = state.keyCache;
  if (
    !cache ||
    cache.id !== id ||
    cache.left !== left ||
    cache.top !== top ||
    cache.right !== right ||
    cache.bottom !== bottom ||
    cache.samples !== samples
  ) {
    cache = {
      bottom,
      id,
      key: `${id}:${Math.round(left)}:${Math.round(top)}:${Math.round(right)}:${Math.round(bottom)}:${samples}`,
      left,
      right,
      samples,
      top,
    };
    state.keyCache = cache;
  }
  return cache.key;
};

const getPathIdentity = (key: string) => {
  const separatorIndex = key.indexOf(":");
  return separatorIndex === -1 ? key : key.slice(0, separatorIndex);
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

const buildClosedCurve = (
  key: string,
  samples: number,
  pointAt: (phase: number) => [number, number]
): CurvePath => {
  const points: [number, number][] = [];
  const lengths: number[] = [];
  const cumulativeLengths: number[] = [];
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
    cumulativeLengths.push(totalLength);
  }

  return {
    cumulativeLengths,
    identity: getPathIdentity(key),
    key,
    lengths,
    points,
    totalLength,
  };
};

const resolveCurveTravel = (
  state: ScaledTravelState,
  identity: string,
  geometryKey: string,
  travelPx: number,
  previousPath: CurvePath | null,
  path: CurvePath
) => {
  const safeTravelPx = Number.isFinite(travelPx) ? travelPx : 0;
  if (state.identity !== identity) {
    state.identity = identity;
    state.geometryKey = geometryKey;
    state.unitLength = path.totalLength;
    state.offset = 0;
    return safeTravelPx;
  }
  if (state.geometryKey === geometryKey) {
    return safeTravelPx + state.offset;
  }

  if (previousPath && previousPath.totalLength > 0 && path.totalLength > 0) {
    const previousTravelPx = safeTravelPx + state.offset;
    const cycleCount = Math.floor(previousTravelPx / previousPath.totalLength);
    let remainingPx = positiveModulo(
      previousTravelPx,
      previousPath.totalLength
    );
    let nextCycleTravelPx = 0;

    for (let index = 0; index < previousPath.lengths.length; index += 1) {
      const previousLength = previousPath.lengths[index];
      const nextLength = path.lengths[index] ?? 0;
      if (remainingPx <= previousLength) {
        const progress = previousLength <= 0 ? 0 : remainingPx / previousLength;
        nextCycleTravelPx += nextLength * progress;
        break;
      }
      remainingPx -= previousLength;
      nextCycleTravelPx += nextLength;
    }

    state.offset =
      cycleCount * path.totalLength + nextCycleTravelPx - safeTravelPx;
  } else {
    state.offset = 0;
  }
  state.geometryKey = geometryKey;
  state.unitLength = path.totalLength;
  return safeTravelPx + state.offset;
};

const sampleCurvePath = (path: CurvePath, travelPx: number) => {
  if (path.totalLength <= 0) {
    return path.points[0];
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
  return [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
  ] satisfies [number, number];
};

export const sampleClosedCurve = (
  state: PatternPathCacheState,
  key: string,
  travelPx: number,
  samples: number,
  pointAt: (phase: number) => [number, number]
) => {
  const previousPath = state.cachedCurve;
  const path =
    previousPath?.key === key
      ? previousPath
      : buildClosedCurve(key, samples, pointAt);
  const effectiveTravelPx = resolveCurveTravel(
    state.curveTravelState,
    path.identity,
    key,
    travelPx,
    previousPath,
    path
  );
  state.cachedCurve = path;
  return sampleCurvePath(path, effectiveTravelPx);
};

const buildClosedPolyline = (
  key: string,
  pointCount: number,
  pointAt: (index: number) => [number, number]
): CurvePath => {
  const points: [number, number][] = [];
  const lengths: number[] = [];
  const cumulativeLengths: number[] = [];
  let totalLength = 0;

  for (let index = 0; index < pointCount; index += 1) {
    points.push(pointAt(index));
  }

  if (points.length === 0) {
    points.push([0, 0]);
    return {
      cumulativeLengths,
      identity: getPathIdentity(key),
      key,
      lengths,
      points,
      totalLength,
    };
  }

  points.push(points[0]);

  for (let index = 0; index < pointCount; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    lengths.push(length);
    totalLength += length;
    cumulativeLengths.push(totalLength);
  }

  return {
    cumulativeLengths,
    identity: getPathIdentity(key),
    key,
    lengths,
    points,
    totalLength,
  };
};

export const sampleClosedPolyline = (
  state: PatternPathCacheState,
  key: string,
  travelPx: number,
  pointCount: number,
  pointAt: (index: number) => [number, number]
) => {
  const previousPath = state.cachedPolyline;
  const path =
    previousPath?.key === key
      ? previousPath
      : buildClosedPolyline(key, pointCount, pointAt);
  const effectiveTravelPx = resolveCurveTravel(
    state.polylineTravelState,
    path.identity,
    key,
    travelPx,
    previousPath,
    path
  );
  state.cachedPolyline = path;
  return sampleCurvePath(path, effectiveTravelPx);
};

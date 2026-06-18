import type { Arena, PatternId } from "./types";

export const TAU = Math.PI * 2;

export type PatternPathCacheState = {
  cachedCurve: CurvePath | null;
  cachedPolyline: CurvePath | null;
};

type CurvePath = {
  key: string;
  points: Array<[number, number]>;
  lengths: number[];
  totalLength: number;
};

export const createPatternPathCacheState = (): PatternPathCacheState => ({
  cachedCurve: null,
  cachedPolyline: null,
});

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const pingPong = (value: number, length: number) => {
  if (length <= 0) return 0;
  const wrapped = positiveModulo(value, length * 2);
  return wrapped <= length ? wrapped : length * 2 - wrapped;
};

export const curveCacheKey = (
  id: PatternId,
  left: number,
  top: number,
  right: number,
  bottom: number,
  samples: number,
) =>
  `${id}:${Math.round(left)}:${Math.round(top)}:${Math.round(right)}:${Math.round(bottom)}:${samples}`;

export const resolvePatternBounds = (
  arena: Arena,
  radiusPx: number,
  pathMarginPx = 16,
) => {
  const requestedMargin = Math.max(pathMarginPx, radiusPx + 8);
  const maxMargin = Math.max(1, Math.min(arena.width, arena.height) / 2);
  const margin = Math.min(requestedMargin, maxMargin);
  const left = margin;
  const top = margin;
  const right = Math.max(left, arena.width - margin);
  const bottom = Math.max(top, arena.height - margin);
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);

  return {
    left,
    top,
    right,
    bottom,
    width,
    height,
    centerX: arena.width / 2,
    centerY: arena.height / 2,
    radiusX: Math.max(1, width / 2),
    radiusY: Math.max(1, height / 2),
  };
};

export const sampleClosedCurve = (
  state: PatternPathCacheState,
  key: string,
  travelPx: number,
  samples: number,
  pointAt: (phase: number) => [number, number],
) => {
  if (state.cachedCurve?.key !== key) {
    state.cachedCurve = buildClosedCurve(key, samples, pointAt);
  }

  return sampleCurvePath(state.cachedCurve, travelPx);
};

export const sampleClosedPolyline = (
  state: PatternPathCacheState,
  key: string,
  travelPx: number,
  pointCount: number,
  pointAt: (index: number) => [number, number],
) => {
  if (state.cachedPolyline?.key !== key) {
    state.cachedPolyline = buildClosedPolyline(key, pointCount, pointAt);
  }

  return sampleCurvePath(state.cachedPolyline, travelPx);
};

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

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

const buildClosedPolyline = (
  key: string,
  pointCount: number,
  pointAt: (index: number) => [number, number],
): CurvePath => {
  const points: Array<[number, number]> = [];
  const lengths: number[] = [];
  let totalLength = 0;

  for (let index = 0; index < pointCount; index += 1) {
    points.push(pointAt(index));
  }

  if (points.length === 0) {
    points.push([0, 0]);
    return { key, points, lengths, totalLength };
  }

  points.push(points[0]);

  for (let index = 0; index < pointCount; index += 1) {
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

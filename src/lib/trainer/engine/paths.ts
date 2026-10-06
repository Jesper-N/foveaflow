import type { PatternBounds } from "./bounds";
import { TAU, positiveModulo } from "./math";
import type { PatternId } from "./types";

type Point = [x: number, y: number];

/**
 * A closed route sampled into straight segments.
 *
 * Curves receive a phase from 0 to 1. Polylines receive the corner index and
 * close back to their first corner.
 */
interface PathDefinition {
  kind: "curve" | "polyline";
  samples: number;
  pointAt: (position: number, bounds: PatternBounds) => Point;
}

export type PathPatternId = Extract<
  PatternId,
  | "clover"
  | "cornerTour"
  | "diamondLoop"
  | "ellipse"
  | "figureEight"
  | "hourglass"
  | "lissajous"
  | "perimeterLoop"
  | "stairStep"
  | "wave"
  | "zigZag"
>;

export const pathDefinitions = {
  clover: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      const petal = 0.58 + 0.3 * Math.cos(angle * 4);
      return [
        centerX + Math.cos(angle) * radiusX * petal,
        centerY + Math.sin(angle) * radiusY * petal,
      ];
    },
    samples: 160,
  },
  cornerTour: {
    kind: "polyline",
    pointAt: (index, { left, top, right, bottom, width, height }) => {
      const insetX = width * 0.18;
      const insetY = height * 0.18;
      const corners: Point[] = [
        [left, top],
        [right - insetX, top + insetY],
        [right, bottom],
        [left + insetX, bottom - insetY],
      ];
      return corners[index];
    },
    samples: 4,
  },
  diamondLoop: {
    kind: "polyline",
    pointAt: (index, { left, top, right, bottom, centerX, centerY }) => {
      const corners: Point[] = [
        [centerX, top],
        [right, centerY],
        [centerX, bottom],
        [left, centerY],
      ];
      return corners[index];
    },
    samples: 4,
  },
  ellipse: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.cos(angle) * radiusX,
        centerY + Math.sin(angle) * radiusY,
      ];
    },
    samples: 160,
  },
  figureEight: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.sin(angle) * radiusX,
        centerY + Math.sin(angle * 2) * radiusY * 0.72,
      ];
    },
    samples: 180,
  },
  hourglass: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      const vertical = Math.sin(angle);
      const pinch = 0.22 + 0.74 * Math.abs(vertical);
      return [
        centerX + Math.sin(angle * 2) * radiusX * pinch,
        centerY + vertical * radiusY,
      ];
    },
    samples: 160,
  },
  lissajous: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.sin(angle * 3 + Math.PI / 2) * radiusX,
        centerY + Math.sin(angle * 2) * radiusY,
      ];
    },
    samples: 180,
  },
  perimeterLoop: {
    kind: "polyline",
    pointAt: (index, { left, top, right, bottom }) => {
      const corners: Point[] = [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
      ];
      return corners[index];
    },
    samples: 4,
  },
  stairStep: {
    kind: "polyline",
    pointAt: (index, { left, top, width, height }) => {
      const row = index % 4;
      const column = Math.floor(index / 4) % 5;
      return [left + (column * width) / 4, top + (row * height) / 3];
    },
    samples: 20,
  },
  wave: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.cos(angle) * radiusX,
        centerY + Math.sin(angle * 3) * radiusY * 0.42,
      ];
    },
    samples: 120,
  },
  zigZag: {
    kind: "polyline",
    pointAt: (index, { left, top, right, height }) => [
      index % 2 === 0 ? left : right,
      top + (height * index) / 4,
    ],
    samples: 5,
  },
} satisfies Record<PathPatternId, PathDefinition>;

export const isPathPattern = (id: string): id is PathPatternId =>
  Object.hasOwn(pathDefinitions, id);

interface BuiltPath {
  /** Bounds rounded to whole pixels. Smaller changes keep the current path. */
  key: string;
  points: Point[];
  lengths: number[];
  cumulativeLengths: number[];
  totalLength: number;
}

const buildPath = (
  { kind, samples, pointAt }: PathDefinition,
  key: string,
  bounds: PatternBounds
): BuiltPath => {
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
    const [startX, startY] = points[index];
    const [endX, endY] = points[index + 1];
    const length = Math.hypot(endX - startX, endY - startY);
    lengths.push(length);
    totalLength += length;
    cumulativeLengths.push(totalLength);
  }

  return { cumulativeLengths, key, lengths, points, totalLength };
};

/**
 * Finds the travel offset that puts the target on the same segment, at the
 * same progress through it, after the path was rebuilt at a new size.
 */
const resizeTravelOffset = (
  previous: BuiltPath,
  next: BuiltPath,
  travelPx: number,
  offsetPx: number
) => {
  if (previous.totalLength <= 0 || next.totalLength <= 0) {
    return 0;
  }

  const previousTravelPx = travelPx + offsetPx;
  const lapCount = Math.floor(previousTravelPx / previous.totalLength);
  let remainingPx = positiveModulo(previousTravelPx, previous.totalLength);
  let nextLapTravelPx = 0;
  for (let index = 0; index < previous.lengths.length; index += 1) {
    const previousLength = previous.lengths[index];
    const nextLength = next.lengths[index] ?? 0;
    if (remainingPx <= previousLength) {
      const progress = previousLength <= 0 ? 0 : remainingPx / previousLength;
      nextLapTravelPx += nextLength * progress;
      break;
    }
    remainingPx -= previousLength;
    nextLapTravelPx += nextLength;
  }
  return lapCount * next.totalLength + nextLapTravelPx - travelPx;
};

const pointAlongPath = (path: BuiltPath, travelPx: number, out: Point) => {
  if (path.totalLength <= 0) {
    const [[x, y]] = path.points;
    out[0] = x;
    out[1] = y;
    return out;
  }

  // Binary search for the segment that contains the travelled distance.
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
  const [startX, startY] = path.points[low];
  const [endX, endY] = path.points[low + 1];
  out[0] = startX + (endX - startX) * progress;
  out[1] = startY + (endY - startY) * progress;
  return out;
};

/** Moves a target along one predefined path at constant speed. */
export class PathSampler {
  readonly #definition: PathDefinition;
  #bounds: PatternBounds | null = null;
  #path: BuiltPath | null = null;
  #offsetPx = 0;
  readonly #position: Point = [0, 0];

  constructor(id: PathPatternId) {
    this.#definition = pathDefinitions[id];
  }

  /** Returns the point `travelPx` along the path. The next call reuses the returned point. */
  sample(travelPx: number, bounds: PatternBounds): Readonly<Point> {
    let path = this.#path;
    if (this.#bounds !== bounds || !path) {
      const key = `${Math.round(bounds.left)}:${Math.round(bounds.top)}:${Math.round(bounds.right)}:${Math.round(bounds.bottom)}`;
      if (path?.key !== key) {
        const nextPath = buildPath(this.#definition, key, bounds);
        this.#offsetPx = path
          ? resizeTravelOffset(path, nextPath, travelPx, this.#offsetPx)
          : 0;
        path = nextPath;
        this.#path = path;
      }
      this.#bounds = bounds;
    }
    return pointAlongPath(path, travelPx + this.#offsetPx, this.#position);
  }
}

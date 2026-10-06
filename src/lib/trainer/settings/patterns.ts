import type { PatternId } from "../engine/types";

interface PursuitPattern {
  id: PatternId;
  name: string;
  /** Repeating routes the eyes can learn, as opposed to random ones. */
  predictable: boolean;
  /**
   * Loops can run backward. Sweeps and bounces already go back and forth,
   * and random routes have no backward.
   */
  reversible: boolean;
}

/** Motion paths offered in Smooth Pursuit, in menu order. */
export const pursuitPatterns = [
  { id: "randomWalk", name: "Random", predictable: false, reversible: false },
  { id: "circle", name: "Circle", predictable: true, reversible: true },
  { id: "ellipse", name: "Ellipse", predictable: true, reversible: true },
  {
    id: "figureEight",
    name: "Figure eight",
    predictable: true,
    reversible: true,
  },
  { id: "wave", name: "Wave", predictable: true, reversible: true },
  { id: "diagonal", name: "Diagonal", predictable: true, reversible: false },
  { id: "bounce", name: "Bounce", predictable: true, reversible: false },
  {
    id: "directionChange",
    name: "Hard turns",
    predictable: false,
    reversible: false,
  },
  {
    id: "horizontalSweep",
    name: "Horizontal sweep",
    predictable: true,
    reversible: false,
  },
  {
    id: "verticalSweep",
    name: "Vertical sweep",
    predictable: true,
    reversible: false,
  },
  {
    id: "downRightSweep",
    name: "Down-right sweep",
    predictable: true,
    reversible: false,
  },
  {
    id: "downLeftSweep",
    name: "Down-left sweep",
    predictable: true,
    reversible: false,
  },
  {
    id: "perimeterLoop",
    name: "Edge loop",
    predictable: true,
    reversible: true,
  },
  {
    id: "diamondLoop",
    name: "Diamond loop",
    predictable: true,
    reversible: true,
  },
  { id: "clover", name: "Clover", predictable: true, reversible: true },
  { id: "zigZag", name: "Zigzag", predictable: true, reversible: true },
  { id: "stairStep", name: "Stair steps", predictable: true, reversible: true },
  { id: "lissajous", name: "Lissajous", predictable: true, reversible: true },
  { id: "hourglass", name: "Hourglass", predictable: true, reversible: true },
  {
    id: "cornerTour",
    name: "Corner tour",
    predictable: true,
    reversible: true,
  },
] as const satisfies readonly PursuitPattern[];

export type PursuitPatternId = (typeof pursuitPatterns)[number]["id"];

const pursuitPatternsById: ReadonlyMap<string, PursuitPattern> = new Map(
  pursuitPatterns.map((pattern) => [pattern.id, pattern])
);

export const predictablePatterns = pursuitPatterns.filter(
  (pattern) => pattern.predictable
);

export const unpredictablePatterns = pursuitPatterns.filter(
  (pattern) => !pattern.predictable
);

export const isPursuitPattern = (value: string): value is PursuitPatternId =>
  pursuitPatternsById.has(value);

/** Whether the target can run its route backward on this pattern. */
export const isReversible = (id: PatternId) =>
  pursuitPatternsById.get(id)?.reversible ?? false;

export const getPatternName = (id: PatternId) =>
  pursuitPatternsById.get(id)?.name ?? id;

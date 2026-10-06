import type { PatternId } from "../engine/types";

/**
 * Saved settings store these ids, so they never change. `mot` is Multiple
 * Distractions, named after multiple object tracking.
 */
export type DrillId = "pursuit" | "reactionTime" | "mot" | "lilacChaser";

export interface Drill {
  id: DrillId;
  name: string;
  /** The motion path the drill starts on. */
  patternId: PatternId;
  /** Distractors added when switching to the drill. */
  distractorCount: number;
}

export const drills = [
  {
    distractorCount: 0,
    id: "pursuit",
    name: "Smooth Pursuit",
    patternId: "randomWalk",
  },
  {
    distractorCount: 0,
    id: "reactionTime",
    name: "Reaction Jumps",
    patternId: "teleport",
  },
  {
    distractorCount: 10,
    id: "mot",
    name: "Multiple Distractions",
    patternId: "multipleObjectTracking",
  },
  {
    distractorCount: 0,
    id: "lilacChaser",
    name: "Lilac Chaser",
    patternId: "circle",
  },
] as const satisfies readonly Drill[];

export const [defaultDrill] = drills;

/** Unknown ids fall back to the default drill. */
export const getDrill = (id: string): Drill =>
  drills.find((drill) => drill.id === id) ?? defaultDrill;

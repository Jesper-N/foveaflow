/** Drawable area in CSS pixels. */
export interface Arena {
  width: number;
  height: number;
}

export type PatternId =
  | "circle"
  | "ellipse"
  | "figureEight"
  | "wave"
  | "diagonal"
  | "bounce"
  | "randomWalk"
  | "directionChange"
  | "teleport"
  | "horizontalSweep"
  | "verticalSweep"
  | "downRightSweep"
  | "downLeftSweep"
  | "perimeterLoop"
  | "diamondLoop"
  | "clover"
  | "zigZag"
  | "stairStep"
  | "lissajous"
  | "hourglass"
  | "cornerTour"
  | "multipleObjectTracking";

/** 1 runs a route forward, -1 runs it backward. */
export type MotionDirection = 1 | -1;

/** Distractors share the screen with the target but should be ignored. */
export type TargetRole = "target" | "distractor";

/** One object on screen. Samplers reuse these objects from frame to frame. */
export interface TargetFrame {
  x: number;
  y: number;
  radiusPx: number;
  alpha: number;
  role: TargetRole;
}

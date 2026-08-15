export interface Arena {
  width: number;
  height: number;
}

export type SpeedUnit = "deg/s" | "cm/s" | "screen/s";

export interface SpeedSetting {
  unit: SpeedUnit;
  value: number;
}

export type TargetRole = "target" | "distractor";

export interface TargetFrame {
  x: number;
  y: number;
  radiusPx: number;
  color: string;
  alpha: number;
  visible: boolean;
  role: TargetRole;
}

export type TargetForm =
  | "circle"
  | "ring"
  | "square"
  | "diamond"
  | "triangle"
  | "cross";

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

export interface PatternParams {
  radiusPx: number;
  pathMarginPx?: number;
  speedPxPerSec: number;
  travelPx: number;
  targetCount?: number;
  distractorCount?: number;
  colorA?: string;
  colorB?: string;
}

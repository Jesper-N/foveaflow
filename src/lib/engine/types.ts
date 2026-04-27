export type Arena = {
  width: number;
  height: number;
};

export type SpeedUnit = "deg/s" | "cm/s" | "screen/s";

export type SpeedSetting = {
  unit: SpeedUnit;
  value: number;
};

export type TargetRole = "target" | "distractor";

export type TargetFrame = {
  id: string;
  x: number;
  y: number;
  radiusPx: number;
  color: string;
  alpha: number;
  visible: boolean;
  role: TargetRole;
  label?: string;
};

export type TargetShape =
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
  | "multipleObjectTracking";

export type PatternParams = {
  radiusPx: number;
  boundsRadiusPx?: number;
  speedPxPerSec: number;
  travelPx: number;
  targetCount?: number;
  distractorCount?: number;
  colorA?: string;
  colorB?: string;
};

export type FpsStats = {
  average: number;
  p95FrameMs: number;
  droppedFrames: number;
};

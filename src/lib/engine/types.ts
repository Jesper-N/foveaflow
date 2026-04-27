export type Arena = {
  width: number;
  height: number;
};

export type SpeedUnit = "deg/s" | "cm/s" | "screen/s";

export type SpeedSetting = {
  unit: SpeedUnit;
  value: number;
};

export type TargetRole = "target" | "distractor" | "cue" | "fixation";

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
  | "looming"
  | "multipleObjectTracking"
  | "peripheralCue"
  | "contrastPulse"
  | "colorDiscrimination";

export type PatternParams = {
  radiusPx: number;
  speedPxPerSec: number;
  travelPx: number;
  targetCount?: number;
  distractorCount?: number;
  contrast?: number;
  colorA?: string;
  colorB?: string;
};

export type FpsStats = {
  average: number;
  p95FrameMs: number;
  droppedFrames: number;
};

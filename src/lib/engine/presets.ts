import type { Calibration } from "./calibration";
import type { SizeProfile, SpeedProfile } from "./profiles";
import type { PatternId, SpeedSetting, TargetShape } from "./types";

export type TrainingMode = "pursuit" | "mot";

export type ExercisePreset = {
  id: TrainingMode;
  name: string;
  patternId: PatternId;
  speed: SpeedSetting;
  baseRadiusPx: number;
  speedProfile: SpeedProfile;
  sizeProfile: SizeProfile;
  targetCount: number;
  distractorCount: number;
  colorA: string;
  colorB: string;
};

export type TrainerSettings = {
  presetId: TrainingMode;
  patternId: PatternId;
  speed: SpeedSetting;
  baseRadiusPx: number;
  speedProfile: SpeedProfile;
  sizeProfile: SizeProfile;
  targetCount: number;
  distractorCount: number;
  showTrail: boolean;
  ballColor: string;
  distractorBrightness: number;
  targetOpacity: number;
  targetShape: TargetShape;
  calibration: Calibration;
};

export const DEFAULT_BALL_COLOR = "#76d900";

export const exercisePresets = [
  {
    id: "pursuit",
    name: "Smooth Pursuit",
    patternId: "ellipse",
    speed: { unit: "deg/s", value: 30 },
    baseRadiusPx: 35,
    speedProfile: { kind: "constant" },
    sizeProfile: { kind: "constant" },
    targetCount: 1,
    distractorCount: 0,
    colorA: "#f5c842",
    colorB: "#3ddbd9",
  },
  {
    id: "mot",
    name: "Multiple Objects",
    patternId: "multipleObjectTracking",
    speed: { unit: "deg/s", value: 30 },
    baseRadiusPx: 35,
    speedProfile: { kind: "constant" },
    sizeProfile: { kind: "constant" },
    targetCount: 1,
    distractorCount: 5,
    colorA: "#3ddbd9",
    colorB: "#f5c842",
  },
] satisfies ExercisePreset[];

export const patternOptions: Array<{ id: PatternId; name: string }> = [
  { id: "circle", name: "Circle" },
  { id: "ellipse", name: "Ellipse" },
  { id: "figureEight", name: "Figure 8" },
  { id: "wave", name: "Wave" },
  { id: "diagonal", name: "Diagonal" },
  { id: "bounce", name: "Bounce" },
  { id: "randomWalk", name: "Random Walk" },
  { id: "directionChange", name: "Direction Change" },
  { id: "teleport", name: "Teleport" },
  { id: "multipleObjectTracking", name: "Multiple Object Tracking" },
];

export const firstPreset = exercisePresets[0];

export const getPreset = (id: string) => {
  return exercisePresets.find((preset) => preset.id === id) ?? firstPreset;
};

export const settingsFromPreset = (
  preset: ExercisePreset,
  calibration: Calibration,
  overrides: Partial<TrainerSettings> = {},
): TrainerSettings => ({
  presetId: preset.id,
  patternId: preset.patternId,
  speed: { ...preset.speed },
  baseRadiusPx: preset.baseRadiusPx,
  speedProfile: { ...preset.speedProfile },
  sizeProfile: { ...preset.sizeProfile },
  targetCount: preset.targetCount,
  distractorCount: preset.distractorCount,
  showTrail: false,
  ballColor: DEFAULT_BALL_COLOR,
  distractorBrightness: 0.7,
  targetOpacity: 1,
  targetShape: "circle",
  calibration,
  ...overrides,
});

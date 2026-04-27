import type { Calibration } from "./calibration";
import type { SizeProfile, SpeedProfile } from "./profiles";
import type { PatternId, SpeedSetting, TargetShape } from "./types";

export type TrainingMode =
  | "pursuit"
  | "random"
  | "peripheral"
  | "mot"
  | "contrast"
  | "looming";

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
  contrast: number;
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
  contrast: number;
  randomizePattern: boolean;
  showTrail: boolean;
  ballColor: string;
  targetShape: TargetShape;
  calibration: Calibration;
};

export const DEFAULT_BALL_COLOR = "#76d900";

export const exercisePresets = [
  {
    id: "pursuit",
    name: "Smooth Pursuit",
    patternId: "ellipse",
    speed: { unit: "deg/s", value: 8 },
    baseRadiusPx: 16,
    speedProfile: { kind: "constant" },
    sizeProfile: { kind: "constant" },
    targetCount: 1,
    distractorCount: 0,
    contrast: 0.9,
    colorA: "#f5c842",
    colorB: "#3ddbd9",
  },
  {
    id: "random",
    name: "Random Tracking",
    patternId: "randomWalk",
    speed: { unit: "deg/s", value: 11 },
    baseRadiusPx: 14,
    speedProfile: {
      kind: "abruptStep",
      minMultiplier: 0.65,
      maxMultiplier: 1.55,
      intervalSec: 1.1,
    },
    sizeProfile: { kind: "randomStep", minPx: 9, maxPx: 22, intervalSec: 1.4 },
    targetCount: 1,
    distractorCount: 0,
    contrast: 0.9,
    colorA: "#f5c842",
    colorB: "#3ddbd9",
  },
  {
    id: "peripheral",
    name: "Peripheral",
    patternId: "peripheralCue",
    speed: { unit: "deg/s", value: 7 },
    baseRadiusPx: 12,
    speedProfile: { kind: "randomJitter", amount: 0.22, intervalSec: 0.9 },
    sizeProfile: { kind: "constant" },
    targetCount: 1,
    distractorCount: 0,
    contrast: 0.9,
    colorA: "#f5c842",
    colorB: "#3ddbd9",
  },
  {
    id: "mot",
    name: "Multiple Objects",
    patternId: "multipleObjectTracking",
    speed: { unit: "deg/s", value: 6 },
    baseRadiusPx: 10,
    speedProfile: {
      kind: "sine",
      minMultiplier: 0.75,
      maxMultiplier: 1.3,
      periodSec: 8,
    },
    sizeProfile: { kind: "constant" },
    targetCount: 3,
    distractorCount: 5,
    contrast: 0.78,
    colorA: "#3ddbd9",
    colorB: "#f5c842",
  },
  {
    id: "contrast",
    name: "Contrast + Color",
    patternId: "contrastPulse",
    speed: { unit: "deg/s", value: 6 },
    baseRadiusPx: 16,
    speedProfile: {
      kind: "sine",
      minMultiplier: 0.65,
      maxMultiplier: 1.15,
      periodSec: 10,
    },
    sizeProfile: { kind: "pulse", minPx: 10, maxPx: 20, periodSec: 4 },
    targetCount: 1,
    distractorCount: 0,
    contrast: 0.38,
    colorA: "#f5c842",
    colorB: "#3ddbd9",
  },
  {
    id: "looming",
    name: "Looming",
    patternId: "looming",
    speed: { unit: "deg/s", value: 5 },
    baseRadiusPx: 12,
    speedProfile: { kind: "constant" },
    sizeProfile: { kind: "pulse", minPx: 8, maxPx: 30, periodSec: 3.2 },
    targetCount: 1,
    distractorCount: 0,
    contrast: 0.9,
    colorA: "#f5c842",
    colorB: "#3ddbd9",
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
  { id: "looming", name: "Looming" },
  { id: "multipleObjectTracking", name: "Multiple Object Tracking" },
  { id: "peripheralCue", name: "Peripheral Cue" },
  { id: "contrastPulse", name: "Contrast Pulse" },
  { id: "colorDiscrimination", name: "Color Discrimination" },
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
  contrast: preset.contrast,
  randomizePattern: preset.id === "random",
  showTrail: false,
  ballColor: DEFAULT_BALL_COLOR,
  targetShape: "circle",
  calibration,
  ...overrides,
});

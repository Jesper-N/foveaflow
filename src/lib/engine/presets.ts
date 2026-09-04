import type { Calibration } from "./calibration";
import type { SizeProfile, SpeedProfile } from "./profiles";
import type { PatternId, SpeedSetting, TargetForm } from "./types";

export type TrainingMode = "pursuit" | "reactionTime" | "mot" | "lilacChaser";
export type LetterWeight = 400 | 500 | 600 | 700 | 800;

export interface ExercisePreset {
  id: TrainingMode;
  name: string;
  patternId: PatternId;
  speed: SpeedSetting;
  baseRadiusPx: number;
  speedProfile: SpeedProfile;
  sizeProfile: SizeProfile;
  targetCount: number;
  distractorCount: number;
}

export interface TrainerSettings {
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
  targetForm: TargetForm;
  motionDirection: 1 | -1;
  letterEnabled: boolean;
  letterColor: string;
  letterWeight: LetterWeight;
  letterScale: number;
  lilacChaserScale: number;
  lilacChaserBallColor: string;
  calibration: Calibration;
}

export const DEFAULT_BALL_COLOR = "#76d900";
export const DEFAULT_LETTER_SCALE = 0.5;

export const exercisePresets = [
  {
    baseRadiusPx: 35,
    distractorCount: 0,
    id: "pursuit",
    name: "Smooth Pursuit",
    patternId: "randomWalk",
    sizeProfile: { kind: "constant" },
    speed: { unit: "deg/s", value: 20 },
    speedProfile: { kind: "constant" },
    targetCount: 1,
  },
  {
    baseRadiusPx: 35,
    distractorCount: 0,
    id: "reactionTime",
    name: "Reaction jumps",
    patternId: "teleport",
    sizeProfile: { kind: "constant" },
    speed: { unit: "deg/s", value: 20 },
    speedProfile: { kind: "constant" },
    targetCount: 1,
  },
  {
    baseRadiusPx: 35,
    distractorCount: 5,
    id: "mot",
    name: "Multiple Distractions",
    patternId: "multipleObjectTracking",
    sizeProfile: { kind: "constant" },
    speed: { unit: "deg/s", value: 20 },
    speedProfile: { kind: "constant" },
    targetCount: 1,
  },
  {
    baseRadiusPx: 35,
    distractorCount: 0,
    id: "lilacChaser",
    name: "Lilac Chaser",
    patternId: "circle",
    sizeProfile: { kind: "constant" },
    speed: { unit: "deg/s", value: 20 },
    speedProfile: { kind: "constant" },
    targetCount: 1,
  },
] satisfies ExercisePreset[];

export const patternOptions: { id: PatternId; name: string }[] = [
  { id: "randomWalk", name: "Random" },
  { id: "circle", name: "Circle" },
  { id: "ellipse", name: "Ellipse" },
  { id: "figureEight", name: "Figure eight" },
  { id: "wave", name: "Wave" },
  { id: "diagonal", name: "Diagonal" },
  { id: "bounce", name: "Bounce" },
  { id: "directionChange", name: "Hard turns" },
  { id: "horizontalSweep", name: "Horizontal sweep" },
  { id: "verticalSweep", name: "Vertical sweep" },
  { id: "downRightSweep", name: "Down-right sweep" },
  { id: "downLeftSweep", name: "Down-left sweep" },
  { id: "perimeterLoop", name: "Edge loop" },
  { id: "diamondLoop", name: "Diamond loop" },
  { id: "clover", name: "Clover" },
  { id: "zigZag", name: "Zigzag" },
  { id: "stairStep", name: "Stair steps" },
  { id: "lissajous", name: "Lissajous" },
  { id: "hourglass", name: "Hourglass" },
  { id: "cornerTour", name: "Corner tour" },
  { id: "multipleObjectTracking", name: "Multiple object tracking" },
];

export const [firstPreset] = exercisePresets;

export const getPreset = (id: string) =>
  exercisePresets.find((preset) => preset.id === id) ?? firstPreset;

export const settingsFromPreset = (
  preset: ExercisePreset,
  calibration: Calibration,
  overrides: Partial<TrainerSettings> = {}
): TrainerSettings => ({
  ballColor: DEFAULT_BALL_COLOR,
  baseRadiusPx: preset.baseRadiusPx,
  calibration,
  distractorBrightness: 0.7,
  distractorCount: preset.distractorCount,
  letterColor: "#000000",
  letterEnabled: false,
  letterScale: DEFAULT_LETTER_SCALE,
  letterWeight: 600,
  lilacChaserBallColor: "#ff00fe",
  lilacChaserScale: 1,
  motionDirection: 1,
  patternId: preset.patternId,
  presetId: preset.id,
  showTrail: false,
  sizeProfile: { ...preset.sizeProfile },
  speed: { ...preset.speed },
  speedProfile: { ...preset.speedProfile },
  targetCount: preset.targetCount,
  targetForm: "circle",
  targetOpacity: 1,
  ...overrides,
});

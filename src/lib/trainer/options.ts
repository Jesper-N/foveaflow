import type { LetterWeight, TrainingMode } from "$lib/engine/presets";
import { getPreset, patternOptions } from "$lib/engine/presets";
import type { PatternId, SpeedUnit, TargetForm } from "$lib/engine/types";
import { behaviorOptions } from "$lib/trainer/behavior";
import type { BehaviorId } from "$lib/trainer/behavior";

export type ControlIconId =
  | "target"
  | "motion"
  | "eye"
  | "calibration"
  | "theme"
  | "reset";

export type ControlSectionId =
  | "session"
  | "drill"
  | "targets"
  | "motion"
  | "screen"
  | "defaults";

export interface ControlSection {
  id: ControlSectionId;
  label: string;
  icon: ControlIconId;
  hideInLilacChaser?: boolean;
}

export const guideUseCasesByMode = {
  lilacChaser: ["Steady fixation", "Peripheral awareness", "Screen reset"],
  mot: ["Selective attention", "Visual clutter", "Game awareness"],
  pursuit: ["Visual tracking", "Gamer warm-up", "Screen-work reset"],
  reactionTime: ["Quick refocus", "Target acquisition", "Reaction warm-up"],
} as const satisfies Record<TrainingMode, readonly string[]>;

export const homepageGuideUseCases = [
  "FPS warmup",
  "Screen break",
  "Visual practice",
] as const;

const controlSections = [
  {
    icon: "theme",
    id: "session",
    label: "Session",
  },
  {
    icon: "target",
    id: "drill",
    label: "Drill",
  },
  {
    hideInLilacChaser: true,
    icon: "eye",
    id: "targets",
    label: "Targets",
  },
  {
    hideInLilacChaser: true,
    icon: "motion",
    id: "motion",
    label: "Motion",
  },
  {
    hideInLilacChaser: true,
    icon: "calibration",
    id: "screen",
    label: "Screen",
  },
  {
    icon: "reset",
    id: "defaults",
    label: "Defaults",
  },
] as const satisfies readonly ControlSection[];

const lilacChaserControlSections = controlSections.filter(
  (section: ControlSection) => !section.hideInLilacChaser
);

export const getAvailableControlSections = (isLilacChaserMode: boolean) =>
  isLilacChaserMode ? lilacChaserControlSections : controlSections;

const getOptionName = (
  options: readonly { id: string | number; name: string }[],
  id: string | number
) => options.find((option) => option.id === id)?.name ?? String(id);

export const getPresetName = (id: string) => getPreset(id).name;

export const targetFormOptions = [
  { id: "circle", name: "Circle" },
  { id: "ring", name: "Ring" },
  { id: "square", name: "Square" },
  { id: "diamond", name: "Diamond" },
  { id: "triangle", name: "Triangle" },
  { id: "cross", name: "Cross" },
] as const satisfies readonly { id: TargetForm; name: string }[];

export const letterScaleByTargetForm = {
  circle: 1,
  cross: 0.72,
  diamond: 0.86,
  ring: 0.82,
  square: 1.05,
  triangle: 0.76,
} satisfies Record<TargetForm, number>;

export const letterWeightOptions = [
  { id: 400, name: "Regular" },
  { id: 500, name: "Medium" },
  { id: 600, name: "Semibold" },
  { id: 700, name: "Bold" },
  { id: 800, name: "Heavy" },
] as const satisfies readonly { id: LetterWeight; name: string }[];

export const getPatternName = (id: PatternId) =>
  getOptionName(patternOptions, id);

export const getBehaviorName = (id: BehaviorId) =>
  getOptionName(behaviorOptions, id);

export const getTargetFormName = (id: TargetForm) =>
  getOptionName(targetFormOptions, id);

export const getLetterWeightName = (id: LetterWeight) =>
  getOptionName(letterWeightOptions, id);

export const maxSpeedByUnit = {
  "cm/s": 143,
  "deg/s": 100,
  "screen/s": 6,
} satisfies Record<SpeedUnit, number>;

export const minSpeedByUnit = {
  "cm/s": 0.1,
  "deg/s": 0.1,
  "screen/s": 0.01,
} satisfies Record<SpeedUnit, number>;

export const speedSliderStepByUnit = {
  "cm/s": 0.1,
  "deg/s": 0.1,
  "screen/s": 0.01,
} satisfies Record<SpeedUnit, number>;

export const speedKeyboardStepByUnit = {
  "cm/s": 1,
  "deg/s": 1,
  "screen/s": 0.05,
} satisfies Record<SpeedUnit, number>;

export const speedDecimalPlacesByUnit = {
  "cm/s": 1,
  "deg/s": 1,
  "screen/s": 2,
} satisfies Record<SpeedUnit, number>;

const pursuitPatternOptions = patternOptions.filter(
  (option) => option.id !== "multipleObjectTracking"
);

const unpredictivePatternIdSet = new Set<PatternId>([
  "randomWalk",
  "directionChange",
]);
const fixedDirectionPatternIdSet = new Set<PatternId>([
  "randomWalk",
  "directionChange",
  "diagonal",
  "bounce",
  "horizontalSweep",
  "verticalSweep",
  "downRightSweep",
  "downLeftSweep",
]);

const pursuitPatternIdSet: ReadonlySet<PatternId> = new Set(
  pursuitPatternOptions.map((option) => option.id)
);
export const canPatternToggleDirection = (patternId: PatternId) =>
  pursuitPatternIdSet.has(patternId) &&
  !fixedDirectionPatternIdSet.has(patternId);

export const unpredictivePatternOptions = pursuitPatternOptions.filter(
  (option) => unpredictivePatternIdSet.has(option.id)
);

export const predictivePatternOptions = pursuitPatternOptions.filter(
  (option) => !unpredictivePatternIdSet.has(option.id)
);

export const lilacChaserColorOptions = [
  { id: "#ff00fe", name: "Magenta" },
  { id: "#ff3030", name: "Red" },
  { id: "#245cff", name: "Blue" },
  { id: "#ffcc00", name: "Gold" },
  { id: "#00d7ff", name: "Cyan" },
] as const;

export const getLilacChaserColorName = (id: string) =>
  getOptionName(lilacChaserColorOptions, id);

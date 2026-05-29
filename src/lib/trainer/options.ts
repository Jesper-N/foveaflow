import type { LetterWeight, TrainingMode } from "$lib/engine/presets";
import { getPreset, patternOptions } from "$lib/engine/presets";
import type { PatternId, SpeedUnit, TargetShape } from "$lib/engine/types";

export type BehaviorId =
  | "constant"
  | "wavePattern"
  | "surgePattern"
  | "alternatingPattern"
  | "climbPattern"
  | "sizePulse";

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

export type ControlSection = {
  id: ControlSectionId;
  label: string;
  icon: ControlIconId;
  hideInLilacChaser?: boolean;
};

export const guideUseCasesByMode: Record<TrainingMode, readonly string[]> = {
  pursuit: ["Visual tracking", "Gamer warm-up", "Screen-work reset"],
  reactionTime: ["Quick refocus", "Target acquisition", "Reaction warm-up"],
  mot: ["Selective attention", "Visual clutter", "Game awareness"],
  lilacChaser: ["Steady fixation", "Peripheral awareness", "Screen reset"],
};

export const homepageGuideUseCases = [
  "FPS warmup",
  "Screen break",
  "Visual practice",
] as const;

export const behaviorOptions = [
  { id: "constant", name: "Steady speed" },
  { id: "wavePattern", name: "Speed wave" },
  { id: "surgePattern", name: "Short bursts" },
  { id: "alternatingPattern", name: "Alternating pace" },
  { id: "climbPattern", name: "Build and reset" },
  { id: "sizePulse", name: "Size pulse" },
] as const satisfies ReadonlyArray<{ id: BehaviorId; name: string }>;

const controlSections = [
  {
    id: "session",
    label: "Session",
    icon: "theme",
  },
  {
    id: "drill",
    label: "Drill",
    icon: "target",
  },
  {
    id: "targets",
    label: "Targets",
    icon: "eye",
    hideInLilacChaser: true,
  },
  {
    id: "motion",
    label: "Motion",
    icon: "motion",
    hideInLilacChaser: true,
  },
  {
    id: "screen",
    label: "Screen",
    icon: "calibration",
    hideInLilacChaser: true,
  },
  {
    id: "defaults",
    label: "Defaults",
    icon: "reset",
  },
] as const satisfies readonly ControlSection[];

const lilacChaserControlSections = controlSections.filter(
  (section: ControlSection) => !section.hideInLilacChaser,
);

export const getAvailableControlSections = (isLilacChaserMode: boolean) => {
  return isLilacChaserMode ? lilacChaserControlSections : controlSections;
};

export const resolveControlSection = (
  activeSection: ControlSectionId,
  availableSections: readonly ControlSection[],
): ControlSectionId => {
  const fallback = availableSections[0]?.id ?? "session";
  return availableSections.some((section) => section.id === activeSection)
    ? activeSection
    : fallback;
};

export const getControlSectionLabel = (
  sectionId: ControlSectionId,
  availableSections: readonly ControlSection[],
) => {
  return (
    availableSections.find((section) => section.id === sectionId)?.label ??
    "Controls"
  );
};

const getOptionName = (
  options: ReadonlyArray<{ id: string | number; name: string }>,
  id: string | number,
) => options.find((option) => option.id === id)?.name ?? String(id);

export const getPresetName = (id: string) => getPreset(id).name;

export const shapeOptions = [
  { id: "circle", name: "Circle" },
  { id: "ring", name: "Ring" },
  { id: "square", name: "Square" },
  { id: "diamond", name: "Diamond" },
  { id: "triangle", name: "Triangle" },
  { id: "cross", name: "Cross" },
] as const satisfies ReadonlyArray<{ id: TargetShape; name: string }>;

export const letterScaleByShape: Record<TargetShape, number> = {
  circle: 1,
  ring: 0.82,
  square: 1.05,
  diamond: 0.86,
  triangle: 0.76,
  cross: 0.72,
};

export const letterWeightOptions = [
  { id: 400, name: "Regular" },
  { id: 500, name: "Medium" },
  { id: 600, name: "Semibold" },
  { id: 700, name: "Bold" },
  { id: 800, name: "Heavy" },
] as const satisfies ReadonlyArray<{ id: LetterWeight; name: string }>;

export const getPatternName = (id: PatternId) =>
  getOptionName(patternOptions, id);

export const getBehaviorName = (id: BehaviorId) =>
  getOptionName(behaviorOptions, id);

export const getShapeName = (id: TargetShape) =>
  getOptionName(shapeOptions, id);

export const getLetterWeightName = (id: LetterWeight) =>
  getOptionName(letterWeightOptions, id);

export const maxSpeedByUnit: Record<SpeedUnit, number> = {
  "deg/s": 100,
  "cm/s": 143,
  "screen/s": 6,
};

export const speedStepByUnit: Record<SpeedUnit, number> = {
  "deg/s": 1,
  "cm/s": 1,
  "screen/s": 0.05,
};

const pursuitPatternOptions = patternOptions.filter(
  (option) => option.id !== "multipleObjectTracking",
);

const unpredictivePatternIds = [
  "randomWalk",
  "directionChange",
] as const satisfies readonly PatternId[];

const fixedDirectionPatternIds = [
  "randomWalk",
  "directionChange",
  "diagonal",
  "bounce",
  "horizontalSweep",
  "verticalSweep",
  "downRightSweep",
  "downLeftSweep",
] as const satisfies readonly PatternId[];

const unpredictivePatternIdSet: ReadonlySet<PatternId> = new Set(
  unpredictivePatternIds,
);
const pursuitPatternIdSet: ReadonlySet<PatternId> = new Set(
  pursuitPatternOptions.map((option) => option.id),
);
const fixedDirectionPatternIdSet: ReadonlySet<PatternId> = new Set(
  fixedDirectionPatternIds,
);

const isUnpredictivePattern = (patternId: PatternId) =>
  unpredictivePatternIdSet.has(patternId);

export const canPatternToggleDirection = (patternId: PatternId) =>
  pursuitPatternIdSet.has(patternId) &&
  !fixedDirectionPatternIdSet.has(patternId);

export const unpredictivePatternOptions = pursuitPatternOptions.filter(
  (option) => isUnpredictivePattern(option.id),
);

export const predictivePatternOptions = pursuitPatternOptions.filter(
  (option) => !isUnpredictivePattern(option.id),
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

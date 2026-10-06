import { clamp } from "../engine/math";
import type { SizeProfile, SpeedProfile } from "../engine/profiles";
import type { MotionDirection, PatternId } from "../engine/types";
import { defaultDrill, getDrill } from "./drills";
import type { Drill, DrillId } from "./drills";
import type { LetterWeight, LilacChaserColor, TargetForm } from "./options";
import { isReversible } from "./patterns";

/** Everything the trainer remembers. See `storage.ts` for how it is saved. */
export interface TrainerSettings {
  drillId: DrillId;
  patternId: PatternId;
  /** Whole number from 1 to 100. See `speed.ts` for the unit. */
  speed: number;
  baseRadiusPx: number;
  speedProfile: SpeedProfile;
  sizeProfile: SizeProfile;
  targetCount: number;
  distractorCount: number;
  showTrail: boolean;
  /** Null follows the current theme's primary color. */
  ballColor: string | null;
  /** How much distractors are darkened from the target color. */
  distractorBrightness: number;
  targetOpacity: number;
  targetForm: TargetForm;
  motionDirection: MotionDirection;
  letterEnabled: boolean;
  letterColor: string;
  letterWeight: LetterWeight;
  letterScale: number;
  lilacChaserScale: number;
  lilacChaserBallColor: LilacChaserColor;
}

interface SettingRange {
  min: number;
  max: number;
  step: number;
  integer?: boolean;
}

/** Limits for every setting chosen on a slider. */
export const settingRanges = {
  baseRadiusPx: { max: 100, min: 4, step: 1 },
  distractorBrightness: { max: 1, min: 0.35, step: 0.01 },
  distractorCount: { integer: true, max: 10, min: 0, step: 1 },
  letterScale: { max: 1.2, min: 0.45, step: 0.01 },
  lilacChaserScale: { max: 1.25, min: 0.75, step: 0.05 },
  speed: { integer: true, max: 100, min: 1, step: 1 },
  targetCount: { integer: true, max: 6, min: 1, step: 1 },
  targetOpacity: { max: 1, min: 0, step: 0.01 },
} as const satisfies Record<string, SettingRange>;

export type RangedSetting = keyof typeof settingRanges;

/** Fits a value into its setting's range, rounding whole-number settings. */
export const clampSetting = (setting: RangedSetting, value: number) => {
  const range: SettingRange = settingRanges[setting];
  const clamped = clamp(value, range.min, range.max);
  return range.integer ? Math.round(clamped) : clamped;
};

export const createDefaultSettings = (
  drill: Drill = defaultDrill
): TrainerSettings => ({
  ballColor: null,
  baseRadiusPx: 40,
  distractorBrightness: 0.45,
  distractorCount: drill.distractorCount,
  drillId: drill.id,
  letterColor: "#000000",
  letterEnabled: false,
  letterScale: 0.5,
  letterWeight: 600,
  lilacChaserBallColor: "#ff00fe",
  lilacChaserScale: 1,
  motionDirection: 1,
  patternId: drill.patternId,
  showTrail: false,
  sizeProfile: { kind: "constant" },
  speed: 20,
  speedProfile: { kind: "constant" },
  targetCount: 1,
  targetForm: "circle",
  targetOpacity: 1,
});

/** Switches motion path. Paths that cannot reverse always run forward. */
export const withPattern = (
  settings: TrainerSettings,
  patternId: PatternId
): TrainerSettings => ({
  ...settings,
  motionDirection: isReversible(patternId) ? settings.motionDirection : 1,
  patternId,
});

/** Switches drill and keeps every other choice. */
export const withDrill = (
  settings: TrainerSettings,
  drillId: string
): TrainerSettings => {
  const drill = getDrill(drillId);
  const isEnteringDistractions =
    drill.id === "mot" && settings.drillId !== "mot";
  return withPattern(
    {
      ...settings,
      distractorCount: isEnteringDistractions
        ? drill.distractorCount
        : settings.distractorCount,
      drillId: drill.id,
    },
    drill.patternId
  );
};

/** Settings for a drill page. Pattern pages also choose the Smooth Pursuit path. */
export const withRoute = (
  settings: TrainerSettings,
  route: { drillId: DrillId; patternId?: PatternId } | null
) => {
  const next = withDrill(settings, route?.drillId ?? defaultDrill.id);
  return route?.drillId === "pursuit" && route.patternId
    ? withPattern(next, route.patternId)
    : next;
};

/** Restores the drill's defaults but stays on the current motion path. */
export const resetToDefaults = (settings: TrainerSettings) => ({
  ...createDefaultSettings(getDrill(settings.drillId)),
  patternId: settings.patternId,
});

import { findTrainerRoute } from "$lib/content/trainer-routes";
import {
  DEFAULT_LETTER_SCALE,
  firstPreset,
  getPreset,
  patternOptions,
  settingsFromPreset,
} from "$lib/engine/presets";
import type {
  ExercisePreset,
  LetterWeight,
  TrainerSettings,
} from "$lib/engine/presets";
import { safeStimulusColor } from "$lib/engine/safety";
import type { StoredSettings } from "$lib/engine/storage";
import type { PatternId, TargetForm } from "$lib/engine/types";

import {
  canPatternToggleDirection,
  letterWeightOptions,
  lilacChaserColorOptions,
  targetFormOptions,
} from "./options";

export type TrainerSliderValue = readonly number[] | undefined;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isFiniteNumber = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

export const trainerSettingBounds = {
  baseRadiusPx: { max: 100, min: 4 },
  distractorBrightness: { max: 1, min: 0.35 },
  distractorCount: { max: 10, min: 0 },
  letterScale: { max: 1.2, min: 0.45 },
  lilacChaserScale: { max: 1.25, min: 0.75 },
  speed: { max: 100, min: 1 },
  targetCount: { max: 6, min: 1 },
  targetOpacity: { max: 1, min: 0 },
} as const;

const storedSettingDefaults = {
  distractorBrightness: 0.45,
  letterColor: "#000000",
  letterWeight: 600,
  lilacChaserBallColor: "#ff00fe",
  lilacChaserScale: 1,
  targetForm: "circle",
  targetOpacity: 1,
} satisfies Pick<
  TrainerSettings,
  | "distractorBrightness"
  | "targetOpacity"
  | "targetForm"
  | "letterColor"
  | "letterWeight"
  | "lilacChaserScale"
  | "lilacChaserBallColor"
>;

const patternIdSet: ReadonlySet<string> = new Set(
  patternOptions.map((option) => option.id)
);
const targetFormSet: ReadonlySet<string> = new Set(
  targetFormOptions.map((option) => option.id)
);
const letterWeightSet: ReadonlySet<number> = new Set(
  letterWeightOptions.map((option) => option.id)
);
const lilacChaserBallColorSet: ReadonlySet<string> = new Set(
  lilacChaserColorOptions.map((option) => option.id)
);

export const isHexColor = (value: string | null | undefined): value is string =>
  value !== null && value !== undefined && /^#[0-9a-f]{6}$/iu.test(value);

export const isPatternId = (value: string): value is PatternId =>
  patternIdSet.has(value);

export const isTargetForm = (value: string | undefined): value is TargetForm =>
  value !== undefined && targetFormSet.has(value);

export const isLetterWeight = (
  value: number | undefined
): value is LetterWeight => value !== undefined && letterWeightSet.has(value);

export const isLilacChaserBallColor = (
  value: string | undefined
): value is string => value !== undefined && lilacChaserBallColorSet.has(value);

const resolveNumber = (
  value: number | null | undefined,
  { min, max }: { min: number; max: number },
  fallback: number
) => (isFiniteNumber(value) ? clamp(value, min, max) : fallback);

const resolveInteger = (
  value: number | null | undefined,
  bounds: { min: number; max: number },
  fallback: number
) => Math.round(resolveNumber(value, bounds, fallback));

export const resolveSliderNumber = (
  value: TrainerSliderValue,
  min: number,
  max: number
) => {
  const next = value?.[0];
  return isFiniteNumber(next) ? clamp(next, min, max) : null;
};

export const resolveSliderInteger = (
  value: TrainerSliderValue,
  min: number,
  max: number
) => {
  const next = resolveSliderNumber(value, min, max);
  return next === null ? null : Math.round(next);
};

export const adjustSpeedBySteps = (speed: number, stepCount: number) =>
  clamp(
    Math.round(speed) + stepCount,
    trainerSettingBounds.speed.min,
    trainerSettingBounds.speed.max
  );

const resolveStoredPatternId = (
  preset: ExercisePreset,
  patternId: string | undefined
) => {
  if (
    preset.id === "pursuit" &&
    patternId !== undefined &&
    isPatternId(patternId) &&
    patternId !== "multipleObjectTracking"
  ) {
    return patternId;
  }

  return preset.patternId;
};

export const applyPresetToSettings = (
  currentSettings: TrainerSettings,
  presetId: string
): TrainerSettings => {
  const preset = getPreset(presetId);
  return {
    ...currentSettings,
    distractorCount:
      preset.id === "mot" && currentSettings.presetId !== "mot"
        ? preset.distractorCount
        : currentSettings.distractorCount,
    patternId: preset.patternId,
    presetId: preset.id,
  };
};

export const applyRouteToSettings = (
  currentSettings: TrainerSettings,
  nextSlug: string | undefined
) => {
  const route = findTrainerRoute(nextSlug);
  const nextSettings = applyPresetToSettings(
    currentSettings,
    route?.mode ?? firstPreset.id
  );

  if (route?.mode === "pursuit" && route.patternId) {
    nextSettings.patternId = route.patternId;
  }

  return nextSettings;
};

export const resetSettingsToPresetDefaults = (
  currentSettings: TrainerSettings
) => {
  const preset = getPreset(currentSettings.presetId);
  return settingsFromPreset(preset, {
    patternId: currentSettings.patternId,
  });
};

export const resetUnsupportedMotionDirection = (
  patternId: PatternId,
  motionDirection: TrainerSettings["motionDirection"],
  travelPx: number
) => {
  if (canPatternToggleDirection(patternId)) {
    return { motionDirection, travelPx };
  }

  return {
    motionDirection: 1 as const,
    travelPx: travelPx < 0 ? Math.abs(travelPx) : travelPx,
  };
};

export const resolveStoredSettings = (saved: StoredSettings) => {
  const preset = getPreset(saved.presetId ?? firstPreset.id);
  const patternId = resolveStoredPatternId(preset, saved.patternId);
  const sizeProfile = saved.sizeProfile ?? preset.sizeProfile;

  return settingsFromPreset(preset, {
    ballColor: isHexColor(saved.ballColor)
      ? safeStimulusColor(saved.ballColor)
      : null,
    baseRadiusPx: resolveNumber(
      saved.baseRadiusPx,
      trainerSettingBounds.baseRadiusPx,
      preset.baseRadiusPx
    ),
    distractorBrightness: resolveNumber(
      saved.distractorBrightness,
      trainerSettingBounds.distractorBrightness,
      storedSettingDefaults.distractorBrightness
    ),
    distractorCount: resolveInteger(
      saved.distractorCount,
      trainerSettingBounds.distractorCount,
      preset.distractorCount
    ),
    letterColor: isHexColor(saved.letterColor)
      ? saved.letterColor
      : storedSettingDefaults.letterColor,
    letterEnabled: saved.letterEnabled === true,
    letterScale: resolveNumber(
      saved.letterScale,
      trainerSettingBounds.letterScale,
      DEFAULT_LETTER_SCALE
    ),
    letterWeight: isLetterWeight(saved.letterWeight)
      ? saved.letterWeight
      : storedSettingDefaults.letterWeight,
    lilacChaserBallColor: isLilacChaserBallColor(saved.lilacChaserBallColor)
      ? saved.lilacChaserBallColor
      : storedSettingDefaults.lilacChaserBallColor,
    lilacChaserScale: resolveNumber(
      saved.lilacChaserScale,
      trainerSettingBounds.lilacChaserScale,
      storedSettingDefaults.lilacChaserScale
    ),
    motionDirection: saved.motionDirection === -1 ? -1 : 1,
    patternId,
    presetId: preset.id,
    showTrail: saved.showTrail === true,
    sizeProfile,
    speed: resolveInteger(
      saved.speed,
      trainerSettingBounds.speed,
      preset.speed
    ),
    speedProfile:
      sizeProfile.kind === "pulse"
        ? { kind: "constant" }
        : (saved.speedProfile ?? preset.speedProfile),
    targetCount: resolveInteger(
      saved.targetCount,
      trainerSettingBounds.targetCount,
      preset.targetCount
    ),
    targetForm: isTargetForm(saved.targetForm)
      ? saved.targetForm
      : storedSettingDefaults.targetForm,
    targetOpacity: resolveNumber(
      saved.targetOpacity,
      trainerSettingBounds.targetOpacity,
      storedSettingDefaults.targetOpacity
    ),
  });
};

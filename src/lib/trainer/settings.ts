import { findTrainerRoute } from "$lib/content/trainer-routes";
import {
  DEFAULT_CALIBRATION,
  pixelsPerSecondToSpeedValue,
  speedToPixelsPerSecond,
} from "$lib/engine/calibration";
import type { Calibration } from "$lib/engine/calibration";
import {
  DEFAULT_BALL_COLOR,
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
import type { PatternId, SpeedUnit, TargetForm } from "$lib/engine/types";

import {
  canPatternToggleDirection,
  letterWeightOptions,
  lilacChaserColorOptions,
  maxSpeedByUnit,
  minSpeedByUnit,
  targetFormOptions,
  speedKeyboardStepByUnit,
} from "./options";

export type CalibrationField = "viewingDistanceCm" | "cssPxPerCm";
export type TrainerSliderValue = readonly number[] | undefined;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isFiniteNumber = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value);

export const trainerSettingBounds = {
  baseRadiusPx: { max: 100, min: 4 },
  cssPxPerCm: { max: 120, min: 10 },
  distractorBrightness: { max: 1, min: 0.35 },
  distractorCount: { max: 10, min: 0 },
  letterScale: { max: 1.2, min: 0.45 },
  lilacChaserScale: { max: 1.25, min: 0.75 },
  targetCount: { max: 6, min: 1 },
  targetOpacity: { max: 1, min: 0 },
  viewingDistanceCm: { max: 120, min: 20 },
} as const;

const storedSettingDefaults = {
  distractorBrightness: 0.7,
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

export const isHexColor = (value: string | undefined): value is string =>
  value !== undefined && /^#[0-9a-f]{6}$/iu.test(value);

export const isSpeedUnit = (value: string): value is SpeedUnit =>
  value === "deg/s" || value === "cm/s" || value === "screen/s";

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
  value: number | undefined,
  { min, max }: { min: number; max: number },
  fallback: number
) => (isFiniteNumber(value) ? clamp(value, min, max) : fallback);

const resolveInteger = (
  value: number | undefined,
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

export const resolveSpeedSliderValue = (
  value: TrainerSliderValue,
  unit: SpeedUnit
) => resolveSliderNumber(value, minSpeedByUnit[unit], maxSpeedByUnit[unit]);

export const resolveSpeedUnit = (
  speed: TrainerSettings["speed"],
  unit: SpeedUnit,
  arena: { width: number; height: number },
  calibration: Calibration
) => ({
  unit,
  value: clamp(
    pixelsPerSecondToSpeedValue(
      speedToPixelsPerSecond(speed, arena, calibration),
      unit,
      arena,
      calibration
    ),
    minSpeedByUnit[unit],
    maxSpeedByUnit[unit]
  ),
});

export const adjustSpeedBySteps = (
  speed: TrainerSettings["speed"],
  stepCount: number
) => ({
  ...speed,
  value: clamp(
    speed.value + speedKeyboardStepByUnit[speed.unit] * stepCount,
    minSpeedByUnit[speed.unit],
    maxSpeedByUnit[speed.unit]
  ),
});

const resolveSpeed = (
  speed: StoredSettings["speed"],
  fallback: TrainerSettings["speed"]
): TrainerSettings["speed"] => {
  if (!speed) {
    return { ...fallback };
  }

  const { unit } = speed;

  return {
    unit,
    value: resolveNumber(
      speed.value,
      { max: maxSpeedByUnit[unit], min: minSpeedByUnit[unit] },
      fallback.value
    ),
  };
};

const resolveCalibration = (
  calibration: StoredSettings["calibration"]
): Calibration => {
  if (!calibration) {
    return DEFAULT_CALIBRATION;
  }

  return {
    createdAt: isFiniteNumber(calibration.createdAt)
      ? calibration.createdAt
      : DEFAULT_CALIBRATION.createdAt,
    cssPxPerCm: resolveNumber(
      calibration.cssPxPerCm,
      trainerSettingBounds.cssPxPerCm,
      DEFAULT_CALIBRATION.cssPxPerCm
    ),
    id: calibration.id,
    viewingDistanceCm: resolveNumber(
      calibration.viewingDistanceCm,
      trainerSettingBounds.viewingDistanceCm,
      DEFAULT_CALIBRATION.viewingDistanceCm
    ),
  };
};

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
  return settingsFromPreset(preset, DEFAULT_CALIBRATION, {
    patternId: currentSettings.patternId,
  });
};

export const updateCalibrationField = (
  calibration: Calibration,
  field: CalibrationField,
  value: number,
  now = Date.now
) => {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  const bounds = trainerSettingBounds[field];
  const createdAt = now();

  return {
    ...calibration,
    createdAt,
    id: `custom-${createdAt}`,
    [field]: clamp(value, bounds.min, bounds.max),
  };
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

  return settingsFromPreset(preset, resolveCalibration(saved.calibration), {
    ballColor: isHexColor(saved.ballColor)
      ? safeStimulusColor(saved.ballColor)
      : DEFAULT_BALL_COLOR,
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
    speed: resolveSpeed(saved.speed, preset.speed),
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

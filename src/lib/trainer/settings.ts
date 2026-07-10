import {
  DEFAULT_CALIBRATION,
  pixelsPerSecondToSpeedValue,
  speedToPixelsPerSecond,
  type Calibration,
} from "$lib/engine/calibration";
import {
  DEFAULT_BALL_COLOR,
  DEFAULT_LETTER_SCALE,
  firstPreset,
  getPreset,
  patternOptions,
  settingsFromPreset,
  type ExercisePreset,
  type LetterWeight,
  type TrainerSettings,
} from "$lib/engine/presets";
import type { SizeProfile, SpeedProfile } from "$lib/engine/profiles";
import type { StoredSettings } from "$lib/engine/storage";
import type { PatternId, SpeedUnit, TargetShape } from "$lib/engine/types";
import { safeStimulusColor } from "$lib/engine/safety";
import { findTrainerRoute } from "$lib/content/trainer-routes";

import {
  canPatternToggleDirection,
  letterWeightOptions,
  lilacChaserColorOptions,
  maxSpeedByUnit,
  minSpeedByUnit,
  shapeOptions,
  speedKeyboardStepByUnit,
} from "./options";

export type CalibrationField = "viewingDistanceCm" | "cssPxPerCm";
export type TrainerSliderValue = readonly number[] | undefined;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isProfileMultiplier = (value: unknown): value is number => {
  return isFiniteNumber(value) && value >= 0 && value <= 4;
};

export const trainerSettingBounds = {
  baseRadiusPx: { min: 4, max: 100 },
  targetCount: { min: 1, max: 6 },
  distractorCount: { min: 0, max: 10 },
  distractorBrightness: { min: 0.35, max: 1 },
  targetOpacity: { min: 0, max: 1 },
  letterScale: { min: 0.45, max: 1.2 },
  lilacChaserScale: { min: 0.75, max: 1.25 },
  viewingDistanceCm: { min: 20, max: 120 },
  cssPxPerCm: { min: 10, max: 120 },
} as const;

const storedSettingDefaults = {
  distractorBrightness: 0.7,
  targetOpacity: 1,
  targetShape: "circle",
  letterColor: "#000000",
  letterWeight: 600,
  lilacChaserScale: 1,
  lilacChaserBallColor: "#ff00fe",
} satisfies Pick<
  TrainerSettings,
  | "distractorBrightness"
  | "targetOpacity"
  | "targetShape"
  | "letterColor"
  | "letterWeight"
  | "lilacChaserScale"
  | "lilacChaserBallColor"
>;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const patternIdSet: ReadonlySet<string> = new Set(
  patternOptions.map((option) => option.id),
);
const targetShapeSet: ReadonlySet<string> = new Set(
  shapeOptions.map((option) => option.id),
);
const letterWeightSet: ReadonlySet<number> = new Set(
  letterWeightOptions.map((option) => option.id),
);
const lilacChaserBallColorSet: ReadonlySet<string> = new Set(
  lilacChaserColorOptions.map((option) => option.id),
);

export const isHexColor = (value: unknown): value is string => {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
};

export const isSpeedUnit = (value: string): value is SpeedUnit => {
  return value === "deg/s" || value === "cm/s" || value === "screen/s";
};

export const isPatternId = (value: string): value is PatternId => {
  return patternIdSet.has(value);
};

export const isTargetShape = (value: string): value is TargetShape => {
  return targetShapeSet.has(value);
};

export const isLetterWeight = (value: number): value is LetterWeight => {
  return letterWeightSet.has(value);
};

export const isLilacChaserBallColor = (value: unknown): value is string => {
  return typeof value === "string" && lilacChaserBallColorSet.has(value);
};

const resolveNumber = (
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) => {
  return isFiniteNumber(value) ? clamp(value, min, max) : fallback;
};

const resolveInteger = (
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) => Math.round(resolveNumber(value, min, max, fallback));

const readSliderNumber = (value: TrainerSliderValue) => {
  const next = value?.[0];
  return isFiniteNumber(next) ? next : null;
};

export const resolveSliderNumber = (
  value: TrainerSliderValue,
  min: number,
  max: number,
) => {
  const next = readSliderNumber(value);
  return next === null ? null : clamp(next, min, max);
};

export const resolveSliderInteger = (
  value: TrainerSliderValue,
  min: number,
  max: number,
) => {
  const next = resolveSliderNumber(value, min, max);
  return next === null ? null : Math.round(next);
};

export const resolveSpeedSliderValue = (
  value: TrainerSliderValue,
  unit: SpeedUnit,
) => {
  return resolveSliderNumber(value, minSpeedByUnit[unit], maxSpeedByUnit[unit]);
};

export const resolveSpeedUnit = (
  speed: TrainerSettings["speed"],
  unit: SpeedUnit,
  arena: { width: number; height: number },
  calibration: Calibration,
) => ({
  unit,
  value: clamp(
    pixelsPerSecondToSpeedValue(
      speedToPixelsPerSecond(speed, arena, calibration),
      unit,
      arena,
      calibration,
    ),
    minSpeedByUnit[unit],
    maxSpeedByUnit[unit],
  ),
});

export const adjustSpeedBySteps = (
  speed: TrainerSettings["speed"],
  stepCount: number,
) => ({
  ...speed,
  value: clamp(
    speed.value + speedKeyboardStepByUnit[speed.unit] * stepCount,
    minSpeedByUnit[speed.unit],
    maxSpeedByUnit[speed.unit],
  ),
});

const isSpeedProfile = (profile: unknown): profile is SpeedProfile => {
  if (!isRecord(profile) || typeof profile.kind !== "string") return false;
  if (profile.kind === "constant") return true;

  if (profile.kind === "sine") {
    return (
      isProfileMultiplier(profile.minMultiplier) &&
      isProfileMultiplier(profile.maxMultiplier) &&
      profile.minMultiplier <= profile.maxMultiplier &&
      isFiniteNumber(profile.periodSec) &&
      profile.periodSec > 0
    );
  }

  if (profile.kind === "steps") {
    return (
      Array.isArray(profile.multipliers) &&
      profile.multipliers.length > 0 &&
      profile.multipliers.length <= 32 &&
      profile.multipliers.every(isProfileMultiplier) &&
      isFiniteNumber(profile.intervalSec) &&
      profile.intervalSec > 0 &&
      isFiniteNumber(profile.transitionSec) &&
      profile.transitionSec >= 0
    );
  }

  if (profile.kind === "loopRamp") {
    return (
      isProfileMultiplier(profile.fromMultiplier) &&
      isProfileMultiplier(profile.toMultiplier) &&
      isFiniteNumber(profile.periodSec) &&
      profile.periodSec > 0 &&
      isFiniteNumber(profile.resetSec) &&
      profile.resetSec >= 0
    );
  }

  return false;
};

const isSizeProfile = (profile: unknown): profile is SizeProfile => {
  if (!isRecord(profile) || typeof profile.kind !== "string") return false;
  if (profile.kind === "constant") return true;

  return (
    profile.kind === "pulse" &&
    isProfileMultiplier(profile.minMultiplier) &&
    isProfileMultiplier(profile.maxMultiplier) &&
    profile.minMultiplier <= profile.maxMultiplier &&
    isFiniteNumber(profile.periodSec) &&
    profile.periodSec > 0
  );
};

const resolveSpeed = (
  speed: unknown,
  fallback: TrainerSettings["speed"],
): TrainerSettings["speed"] => {
  if (!isRecord(speed)) return { ...fallback };

  const unit =
    typeof speed.unit === "string" && isSpeedUnit(speed.unit)
      ? speed.unit
      : fallback.unit;

  return {
    unit,
    value: resolveNumber(
      speed.value,
      minSpeedByUnit[unit],
      maxSpeedByUnit[unit],
      fallback.value,
    ),
  };
};

const resolveCalibration = (calibration: unknown): Calibration => {
  if (!isRecord(calibration)) return DEFAULT_CALIBRATION;

  return {
    id: typeof calibration.id === "string" ? calibration.id : "custom",
    viewingDistanceCm: resolveNumber(
      calibration.viewingDistanceCm,
      trainerSettingBounds.viewingDistanceCm.min,
      trainerSettingBounds.viewingDistanceCm.max,
      DEFAULT_CALIBRATION.viewingDistanceCm,
    ),
    cssPxPerCm: resolveNumber(
      calibration.cssPxPerCm,
      trainerSettingBounds.cssPxPerCm.min,
      trainerSettingBounds.cssPxPerCm.max,
      DEFAULT_CALIBRATION.cssPxPerCm,
    ),
    createdAt: isFiniteNumber(calibration.createdAt)
      ? calibration.createdAt
      : DEFAULT_CALIBRATION.createdAt,
  };
};

const resolveStoredPreset = (presetId: unknown) => {
  return getPreset(typeof presetId === "string" ? presetId : firstPreset.id);
};

const resolveStoredPatternId = (preset: ExercisePreset, patternId: unknown) => {
  if (
    preset.id === "pursuit" &&
    typeof patternId === "string" &&
    isPatternId(patternId) &&
    patternId !== "multipleObjectTracking"
  ) {
    return patternId;
  }

  return preset.patternId;
};

const resolveStoredProfiles = (
  preset: ExercisePreset,
  savedSpeedProfile: unknown,
  savedSizeProfile: unknown,
): Pick<TrainerSettings, "speedProfile" | "sizeProfile"> => {
  const sizeProfile = isSizeProfile(savedSizeProfile)
    ? savedSizeProfile
    : preset.sizeProfile;

  return {
    speedProfile:
      sizeProfile.kind === "pulse"
        ? { kind: "constant" }
        : isSpeedProfile(savedSpeedProfile)
          ? savedSpeedProfile
          : preset.speedProfile,
    sizeProfile,
  };
};

const resolveStoredTargetShape = (targetShape: unknown) => {
  return typeof targetShape === "string" && isTargetShape(targetShape)
    ? targetShape
    : storedSettingDefaults.targetShape;
};

const resolveStoredLetterWeight = (letterWeight: unknown) => {
  return isFiniteNumber(letterWeight) && isLetterWeight(letterWeight)
    ? letterWeight
    : storedSettingDefaults.letterWeight;
};

const getPreservedSettings = (currentSettings: TrainerSettings) => ({
  speed: currentSettings.speed,
  baseRadiusPx: currentSettings.baseRadiusPx,
  speedProfile: currentSettings.speedProfile,
  sizeProfile: currentSettings.sizeProfile,
  targetCount: currentSettings.targetCount,
  distractorCount: currentSettings.distractorCount,
  showTrail: currentSettings.showTrail,
  ballColor: currentSettings.ballColor,
  distractorBrightness: currentSettings.distractorBrightness,
  targetOpacity: currentSettings.targetOpacity,
  targetShape: currentSettings.targetShape,
  motionDirection: currentSettings.motionDirection,
  letterEnabled: currentSettings.letterEnabled,
  letterColor: currentSettings.letterColor,
  letterWeight: currentSettings.letterWeight,
  letterScale: currentSettings.letterScale,
  lilacChaserScale: currentSettings.lilacChaserScale,
  lilacChaserBallColor: currentSettings.lilacChaserBallColor,
});

export const applyRouteToSettings = (
  currentSettings: TrainerSettings,
  nextSlug: string | undefined,
) => {
  const route = findTrainerRoute(nextSlug);
  const preset = route ? getPreset(route.mode) : firstPreset;
  const nextSettings = settingsFromPreset(
    preset,
    currentSettings.calibration,
    getPreservedSettings(currentSettings),
  );

  if (route?.mode === "pursuit" && route.patternId) {
    nextSettings.patternId = route.patternId;
  }

  if (preset.id === "mot" && currentSettings.presetId !== "mot") {
    nextSettings.distractorCount = preset.distractorCount;
  }

  return nextSettings;
};

export const applyPresetToSettings = (
  currentSettings: TrainerSettings,
  presetId: string,
) => {
  const preset = getPreset(presetId);
  const nextSettings = settingsFromPreset(
    preset,
    currentSettings.calibration,
    getPreservedSettings(currentSettings),
  );

  if (preset.id === "mot" && currentSettings.presetId !== "mot") {
    nextSettings.distractorCount = preset.distractorCount;
  }

  return nextSettings;
};

export const resetSettingsToPresetDefaults = (
  currentSettings: TrainerSettings,
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
  now = Date.now,
) => {
  if (!Number.isFinite(value) || value <= 0) return null;
  const bounds = trainerSettingBounds[field];
  const createdAt = now();

  return {
    ...calibration,
    id: `custom-${createdAt}`,
    [field]: clamp(value, bounds.min, bounds.max),
    createdAt,
  };
};

export const resetUnsupportedMotionDirection = (
  patternId: PatternId,
  motionDirection: TrainerSettings["motionDirection"],
  travelPx: number,
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
  const preset = resolveStoredPreset(saved.presetId);
  const patternId = resolveStoredPatternId(preset, saved.patternId);
  const profiles = resolveStoredProfiles(
    preset,
    saved.speedProfile,
    saved.sizeProfile,
  );

  return settingsFromPreset(preset, resolveCalibration(saved.calibration), {
    presetId: preset.id,
    patternId,
    speed: resolveSpeed(saved.speed, preset.speed),
    baseRadiusPx: resolveNumber(
      saved.baseRadiusPx,
      trainerSettingBounds.baseRadiusPx.min,
      trainerSettingBounds.baseRadiusPx.max,
      preset.baseRadiusPx,
    ),
    ...profiles,
    targetCount: resolveInteger(
      saved.targetCount,
      trainerSettingBounds.targetCount.min,
      trainerSettingBounds.targetCount.max,
      preset.targetCount,
    ),
    distractorCount: resolveInteger(
      saved.distractorCount,
      trainerSettingBounds.distractorCount.min,
      trainerSettingBounds.distractorCount.max,
      preset.distractorCount,
    ),
    showTrail: saved.showTrail === true,
    ballColor: isHexColor(saved.ballColor)
      ? safeStimulusColor(saved.ballColor)
      : DEFAULT_BALL_COLOR,
    distractorBrightness: resolveNumber(
      saved.distractorBrightness,
      trainerSettingBounds.distractorBrightness.min,
      trainerSettingBounds.distractorBrightness.max,
      storedSettingDefaults.distractorBrightness,
    ),
    targetOpacity: resolveNumber(
      saved.targetOpacity,
      trainerSettingBounds.targetOpacity.min,
      trainerSettingBounds.targetOpacity.max,
      storedSettingDefaults.targetOpacity,
    ),
    targetShape: resolveStoredTargetShape(saved.targetShape),
    motionDirection: saved.motionDirection === -1 ? -1 : 1,
    letterEnabled: saved.letterEnabled === true,
    letterColor: isHexColor(saved.letterColor)
      ? saved.letterColor
      : storedSettingDefaults.letterColor,
    letterWeight: resolveStoredLetterWeight(saved.letterWeight),
    letterScale: resolveNumber(
      saved.letterScale,
      trainerSettingBounds.letterScale.min,
      trainerSettingBounds.letterScale.max,
      DEFAULT_LETTER_SCALE,
    ),
    lilacChaserScale: resolveNumber(
      saved.lilacChaserScale,
      trainerSettingBounds.lilacChaserScale.min,
      trainerSettingBounds.lilacChaserScale.max,
      storedSettingDefaults.lilacChaserScale,
    ),
    lilacChaserBallColor: isLilacChaserBallColor(saved.lilacChaserBallColor)
      ? saved.lilacChaserBallColor
      : storedSettingDefaults.lilacChaserBallColor,
  });
};

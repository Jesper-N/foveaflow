import { DEFAULT_CALIBRATION, type Calibration } from "$lib/engine/calibration";
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
  behaviorOptions,
  canPatternToggleDirection,
  letterWeightOptions,
  lilacChaserColorOptions,
  maxSpeedByUnit,
  shapeOptions,
  type BehaviorId,
} from "./options";

export type CalibrationField = "viewingDistanceCm" | "cssPxPerCm";
export type TrainerSliderValue = readonly number[] | undefined;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

export const trainerSettingBounds = {
  speedValue: { min: 0.5 },
  baseRadiusPx: { min: 4, max: 100 },
  targetCount: { min: 1, max: 6 },
  distractorCount: { min: 0, max: 10 },
  distractorBrightness: { min: 0.35, max: 1 },
  targetOpacity: { min: 0, max: 1 },
  letterScale: { min: 0.45, max: 1.2 },
  lilacChaserScale: { min: 0.75, max: 1.5 },
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
const behaviorIdSet: ReadonlySet<string> = new Set(
  behaviorOptions.map((option) => option.id),
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

export const isBehaviorId = (value: string): value is BehaviorId => {
  return behaviorIdSet.has(value);
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
  return resolveSliderNumber(
    value,
    trainerSettingBounds.speedValue.min,
    maxSpeedByUnit[unit],
  );
};

export const resolveSpeedUnit = (
  speed: TrainerSettings["speed"],
  unit: SpeedUnit,
) => ({
  unit,
  value: clamp(
    speed.value,
    trainerSettingBounds.speedValue.min,
    maxSpeedByUnit[unit],
  ),
});

const isSpeedProfile = (profile: unknown): profile is SpeedProfile => {
  if (!isRecord(profile) || typeof profile.kind !== "string") return false;
  if (profile.kind === "constant") return true;

  if (profile.kind === "sine") {
    return (
      isFiniteNumber(profile.minMultiplier) &&
      isFiniteNumber(profile.maxMultiplier) &&
      isFiniteNumber(profile.periodSec) &&
      profile.periodSec > 0
    );
  }

  if (profile.kind === "steps") {
    return (
      Array.isArray(profile.multipliers) &&
      profile.multipliers.length > 0 &&
      profile.multipliers.every(isFiniteNumber) &&
      isFiniteNumber(profile.intervalSec) &&
      profile.intervalSec > 0 &&
      isFiniteNumber(profile.transitionSec) &&
      profile.transitionSec >= 0
    );
  }

  if (profile.kind === "loopRamp") {
    return (
      isFiniteNumber(profile.fromMultiplier) &&
      isFiniteNumber(profile.toMultiplier) &&
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
    isFiniteNumber(profile.minMultiplier) &&
    isFiniteNumber(profile.maxMultiplier) &&
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
      trainerSettingBounds.speedValue.min,
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
  const createdAt = now();

  return {
    ...calibration,
    id: `custom-${createdAt}`,
    [field]: value,
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

export const getBehaviorId = (
  speedProfile: SpeedProfile,
  sizeProfile: SizeProfile,
): BehaviorId => {
  if (sizeProfile.kind === "pulse") return "sizePulse";
  if (speedProfile.kind === "loopRamp") return "climbPattern";
  if (speedProfile.kind === "steps") {
    return speedProfile.intervalSec <= 0.7
      ? "surgePattern"
      : "alternatingPattern";
  }
  if (speedProfile.kind === "sine") return "wavePattern";
  return "constant";
};

type BehaviorProfiles = Pick<TrainerSettings, "speedProfile" | "sizeProfile">;

const behaviorProfilesById = {
  constant: {
    speedProfile: { kind: "constant" },
    sizeProfile: { kind: "constant" },
  },
  wavePattern: {
    speedProfile: {
      kind: "sine",
      minMultiplier: 0.45,
      maxMultiplier: 1.55,
      periodSec: 5.2,
    },
    sizeProfile: { kind: "constant" },
  },
  surgePattern: {
    speedProfile: {
      kind: "steps",
      multipliers: [0.45, 1.65, 0.55, 1.5, 0.8],
      intervalSec: 0.65,
      transitionSec: 0.18,
    },
    sizeProfile: { kind: "constant" },
  },
  alternatingPattern: {
    speedProfile: {
      kind: "steps",
      multipliers: [0.5, 1.5, 0.65, 1.35],
      intervalSec: 1.25,
      transitionSec: 0.28,
    },
    sizeProfile: { kind: "constant" },
  },
  climbPattern: {
    speedProfile: {
      kind: "loopRamp",
      fromMultiplier: 0.45,
      toMultiplier: 1.65,
      periodSec: 5.8,
      resetSec: 1.2,
    },
    sizeProfile: { kind: "constant" },
  },
  sizePulse: {
    speedProfile: { kind: "constant" },
    sizeProfile: {
      kind: "pulse",
      minMultiplier: 0.7,
      maxMultiplier: 1.4,
      periodSec: 3.2,
    },
  },
} satisfies Record<BehaviorId, BehaviorProfiles>;

const cloneSpeedProfile = (profile: SpeedProfile): SpeedProfile => {
  if (profile.kind === "steps") {
    return { ...profile, multipliers: [...profile.multipliers] };
  }

  return { ...profile };
};

const cloneSizeProfile = (profile: SizeProfile): SizeProfile => ({
  ...profile,
});

export const createBehaviorProfiles = (
  behavior: BehaviorId,
): BehaviorProfiles => {
  const profiles = behaviorProfilesById[behavior];
  return {
    speedProfile: cloneSpeedProfile(profiles.speedProfile),
    sizeProfile: cloneSizeProfile(profiles.sizeProfile),
  };
};

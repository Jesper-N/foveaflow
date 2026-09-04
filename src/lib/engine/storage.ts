import * as z from "zod/mini";

import type { Calibration } from "./calibration";
import type { TrainerSettings } from "./presets";
import type { SizeProfile, SpeedProfile } from "./profiles";

const SETTINGS_KEY = "foveaflow.settings.v2";

const profileMultiplierSchema = z.number().check(z.minimum(0), z.maximum(4));
const orderedMultipliers = <
  T extends { minMultiplier: number; maxMultiplier: number },
>(
  profile: T
) => profile.minMultiplier <= profile.maxMultiplier;

const speedProfileSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("constant") }),
  z
    .object({
      kind: z.literal("sine"),
      maxMultiplier: profileMultiplierSchema,
      minMultiplier: profileMultiplierSchema,
      periodSec: z.number().check(z.positive()),
    })
    .check(z.refine(orderedMultipliers)),
  z.object({
    intervalSec: z.number().check(z.positive()),
    kind: z.literal("steps"),
    multipliers: z
      .array(profileMultiplierSchema)
      .check(z.minLength(1), z.maxLength(32)),
    transitionSec: z.number().check(z.minimum(0)),
  }),
  z.object({
    fromMultiplier: profileMultiplierSchema,
    kind: z.literal("loopRamp"),
    periodSec: z.number().check(z.positive()),
    resetSec: z.number().check(z.minimum(0)),
    toMultiplier: profileMultiplierSchema,
  }),
]) satisfies z.ZodMiniType<SpeedProfile>;

const sizeProfileSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("constant") }),
  z
    .object({
      kind: z.literal("pulse"),
      maxMultiplier: profileMultiplierSchema,
      minMultiplier: profileMultiplierSchema,
      periodSec: z.number().check(z.positive()),
    })
    .check(z.refine(orderedMultipliers)),
]) satisfies z.ZodMiniType<SizeProfile>;

const calibrationSchema = z.object({
  createdAt: z.number(),
  cssPxPerCm: z.number(),
  id: z.string(),
  viewingDistanceCm: z.number(),
}) satisfies z.ZodMiniType<Calibration>;

const storedSettingsSchema = z.partial(
  z.object({
    ballColor: z.string(),
    baseRadiusPx: z.number(),
    calibration: calibrationSchema,
    distractorBrightness: z.number(),
    distractorCount: z.number(),
    letterColor: z.string(),
    letterEnabled: z.boolean(),
    letterScale: z.number(),
    letterWeight: z.number(),
    lilacChaserBallColor: z.string(),
    lilacChaserScale: z.number(),
    motionDirection: z.union([z.literal(-1), z.literal(1)]),
    patternId: z.string(),
    presetId: z.string(),
    showTrail: z.boolean(),
    sizeProfile: sizeProfileSchema,
    speed: z.object({
      unit: z.enum(["cm/s", "deg/s", "screen/s"]),
      value: z.number(),
    }),
    speedProfile: speedProfileSchema,
    targetCount: z.number(),
    targetForm: z.string(),
    targetOpacity: z.number(),
  })
);

export type StoredSettings = z.infer<typeof storedSettingsSchema>;

type TimerId = ReturnType<typeof setTimeout>;

export const loadSettings = (): StoredSettings | null => {
  try {
    const value = globalThis.localStorage?.getItem(SETTINGS_KEY);
    return value ? storedSettingsSchema.parse(JSON.parse(value)) : null;
  } catch {
    return null;
  }
};

const saveSettings = (settings: TrainerSettings) => {
  try {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be blocked by browser privacy settings.
  }
};

export const createDebouncedSettingsSaver = (
  persist: (settings: TrainerSettings) => void = saveSettings,
  delayMs = 250
) => {
  let timeout: TimerId | undefined;
  let latestSettings: TrainerSettings | undefined;

  const clearPendingTimeout = () => {
    if (timeout === undefined) {
      return;
    }
    globalThis.clearTimeout(timeout);
    timeout = undefined;
  };

  const flush = () => {
    clearPendingTimeout();
    if (!latestSettings) {
      return;
    }

    const settings = latestSettings;
    latestSettings = undefined;
    persist(settings);
  };

  return {
    cancel() {
      clearPendingTimeout();
      latestSettings = undefined;
    },
    flush,
    schedule(settings: TrainerSettings) {
      latestSettings = settings;
      clearPendingTimeout();
      timeout = globalThis.setTimeout(flush, delayMs);
    },
  };
};

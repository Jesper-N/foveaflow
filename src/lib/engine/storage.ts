import { z } from "zod";

import type { Calibration } from "./calibration";
import type { TrainerSettings } from "./presets";
import type { SizeProfile, SpeedProfile } from "./profiles";

const SETTINGS_KEY = "foveaflow.settings.v2";

const profileMultiplierSchema = z.number().min(0).max(4);
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
      periodSec: z.number().positive(),
    })
    .refine(orderedMultipliers),
  z.object({
    intervalSec: z.number().positive(),
    kind: z.literal("steps"),
    multipliers: z.array(profileMultiplierSchema).min(1).max(32),
    transitionSec: z.number().min(0),
  }),
  z.object({
    fromMultiplier: profileMultiplierSchema,
    kind: z.literal("loopRamp"),
    periodSec: z.number().positive(),
    resetSec: z.number().min(0),
    toMultiplier: profileMultiplierSchema,
  }),
]) satisfies z.ZodType<SpeedProfile>;

const sizeProfileSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("constant") }),
  z
    .object({
      kind: z.literal("pulse"),
      maxMultiplier: profileMultiplierSchema,
      minMultiplier: profileMultiplierSchema,
      periodSec: z.number().positive(),
    })
    .refine(orderedMultipliers),
]) satisfies z.ZodType<SizeProfile>;

const calibrationSchema = z.object({
  createdAt: z.number(),
  cssPxPerCm: z.number(),
  id: z.string(),
  viewingDistanceCm: z.number(),
}) satisfies z.ZodType<Calibration>;

const storedSettingsSchema = z.object({
  ballColor: z.string().optional(),
  baseRadiusPx: z.number().optional(),
  calibration: calibrationSchema.optional(),
  distractorBrightness: z.number().optional(),
  distractorCount: z.number().optional(),
  letterColor: z.string().optional(),
  letterEnabled: z.boolean().optional(),
  letterScale: z.number().optional(),
  letterWeight: z.number().optional(),
  lilacChaserBallColor: z.string().optional(),
  lilacChaserScale: z.number().optional(),
  motionDirection: z.union([z.literal(-1), z.literal(1)]).optional(),
  patternId: z.string().optional(),
  presetId: z.string().optional(),
  showTrail: z.boolean().optional(),
  sizeProfile: sizeProfileSchema.optional(),
  speed: z
    .object({
      unit: z.enum(["cm/s", "deg/s", "screen/s"]),
      value: z.number(),
    })
    .optional(),
  speedProfile: speedProfileSchema.optional(),
  targetCount: z.number().optional(),
  targetForm: z.string().optional(),
  targetOpacity: z.number().optional(),
});

export type StoredSettings = z.infer<typeof storedSettingsSchema>;

type TimerId = ReturnType<typeof setTimeout>;

const getBrowserStorage = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const parseJson = (value: string | null): StoredSettings | null => {
  if (!value) {
    return null;
  }
  try {
    return storedSettingsSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
};

export const loadSettings = () => {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }
  try {
    return parseJson(storage.getItem(SETTINGS_KEY));
  } catch {
    return null;
  }
};

const saveSettings = (settings: TrainerSettings) => {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

import * as z from "zod/mini";

import type { SizeProfile, SpeedProfile } from "../engine/profiles";
import { centimetersPerSecondToSpeed } from "../engine/speed";
import { isHexColor, safeStimulusColor } from "./colors";
import { defaultDrill, getDrill } from "./drills";
import { isLetterWeight, isLilacChaserColor, isTargetForm } from "./options";
import { isPursuitPattern } from "./patterns";
import { clampSetting, createDefaultSettings } from "./settings";
import type { RangedSetting, TrainerSettings } from "./settings";

// Saved settings name the drill `presetId`, from before drills were called
// drills. Only this file knows that name.
const SETTINGS_KEY = "foveaflow.settings.v3";
const LEGACY_SETTINGS_KEY = "foveaflow.settings.v2";
/** Version 2 stored the default target color instead of following the theme. */
const LEGACY_DEFAULT_BALL_COLOR = "#76d900";
const SAVE_DELAY_MS = 250;

const multiplierSchema = z.number().check(z.minimum(0), z.maximum(4));
const isOrderedRange = (profile: {
  minMultiplier: number;
  maxMultiplier: number;
}) => profile.minMultiplier <= profile.maxMultiplier;

const speedProfileSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("constant") }),
  z
    .object({
      kind: z.literal("sine"),
      maxMultiplier: multiplierSchema,
      minMultiplier: multiplierSchema,
      periodSec: z.number().check(z.positive()),
    })
    .check(z.refine(isOrderedRange)),
  z.object({
    intervalSec: z.number().check(z.positive()),
    kind: z.literal("steps"),
    multipliers: z
      .array(multiplierSchema)
      .check(z.minLength(1), z.maxLength(32)),
    transitionSec: z.number().check(z.minimum(0)),
  }),
  z.object({
    fromMultiplier: multiplierSchema,
    kind: z.literal("loopRamp"),
    periodSec: z.number().check(z.positive()),
    resetSec: z.number().check(z.minimum(0)),
    toMultiplier: multiplierSchema,
  }),
]) satisfies z.ZodMiniType<SpeedProfile>;

const sizeProfileSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("constant") }),
  z
    .object({
      kind: z.literal("pulse"),
      maxMultiplier: multiplierSchema,
      minMultiplier: multiplierSchema,
      periodSec: z.number().check(z.positive()),
    })
    .check(z.refine(isOrderedRange)),
]) satisfies z.ZodMiniType<SizeProfile>;

// Speed used to be saved with a unit. deg/s was the default unit and matches
// today's scale. screen/s depended on the window, so it falls back to the
// drill's default speed.
const legacySpeedSchema = z.pipe(
  z.object({
    unit: z.enum(["cm/s", "deg/s", "screen/s"]),
    value: z.number(),
  }),
  z.transform(({ unit, value }) => {
    if (unit === "deg/s") {
      return value;
    }
    if (unit === "cm/s") {
      return centimetersPerSecondToSpeed(value);
    }
    return null;
  })
);

/**
 * Every field is optional. Most are only type-checked here, and `fromStored`
 * replaces bad values one by one. A field of the wrong type, or an invalid
 * speed or size profile, rejects the whole save.
 */
const storedSettingsSchema = z.partial(
  z.object({
    ballColor: z.nullable(z.string()),
    baseRadiusPx: z.number(),
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
    speed: z.union([z.number(), legacySpeedSchema]),
    speedProfile: speedProfileSchema,
    targetCount: z.number(),
    targetForm: z.string(),
    targetOpacity: z.number(),
  })
);

type StoredSettings = z.infer<typeof storedSettingsSchema>;

/** Turns stored values into valid settings, falling back to defaults field by field. */
const fromStored = (stored: StoredSettings): TrainerSettings => {
  const drill = getDrill(stored.presetId ?? defaultDrill.id);
  const defaults = createDefaultSettings(drill);
  const ranged = (setting: RangedSetting, value: number | null = null) => {
    const number = value ?? Number.NaN;
    return Number.isFinite(number)
      ? clampSetting(setting, number)
      : defaults[setting];
  };
  // Only Smooth Pursuit lets you pick a path. Other drills always use their own.
  const patternId =
    drill.id === "pursuit" &&
    stored.patternId !== undefined &&
    isPursuitPattern(stored.patternId)
      ? stored.patternId
      : drill.patternId;
  const sizeProfile = stored.sizeProfile ?? defaults.sizeProfile;

  return {
    ballColor: isHexColor(stored.ballColor)
      ? safeStimulusColor(stored.ballColor)
      : null,
    baseRadiusPx: ranged("baseRadiusPx", stored.baseRadiusPx),
    distractorBrightness: ranged(
      "distractorBrightness",
      stored.distractorBrightness
    ),
    distractorCount: ranged("distractorCount", stored.distractorCount),
    drillId: drill.id,
    letterColor: isHexColor(stored.letterColor)
      ? stored.letterColor
      : defaults.letterColor,
    letterEnabled: stored.letterEnabled === true,
    letterScale: ranged("letterScale", stored.letterScale),
    letterWeight:
      stored.letterWeight !== undefined && isLetterWeight(stored.letterWeight)
        ? stored.letterWeight
        : defaults.letterWeight,
    lilacChaserBallColor:
      stored.lilacChaserBallColor !== undefined &&
      isLilacChaserColor(stored.lilacChaserBallColor)
        ? stored.lilacChaserBallColor
        : defaults.lilacChaserBallColor,
    lilacChaserScale: ranged("lilacChaserScale", stored.lilacChaserScale),
    motionDirection: stored.motionDirection === -1 ? -1 : 1,
    patternId,
    showTrail: stored.showTrail === true,
    sizeProfile,
    speed: ranged("speed", stored.speed),
    // Size pulse runs at a steady speed.
    speedProfile:
      sizeProfile.kind === "pulse"
        ? { kind: "constant" }
        : (stored.speedProfile ?? defaults.speedProfile),
    targetCount: ranged("targetCount", stored.targetCount),
    targetForm:
      stored.targetForm !== undefined && isTargetForm(stored.targetForm)
        ? stored.targetForm
        : defaults.targetForm,
    targetOpacity: ranged("targetOpacity", stored.targetOpacity),
  };
};

/** Saved settings, or null when there are none or they cannot be read. */
export const loadSettings = (): TrainerSettings | null => {
  try {
    const value = globalThis.localStorage?.getItem(SETTINGS_KEY);
    if (value) {
      return fromStored(storedSettingsSchema.parse(JSON.parse(value)));
    }

    const legacyValue = globalThis.localStorage?.getItem(LEGACY_SETTINGS_KEY);
    if (!legacyValue) {
      return null;
    }
    const stored = storedSettingsSchema.parse(JSON.parse(legacyValue));
    if (stored.ballColor?.toLowerCase() === LEGACY_DEFAULT_BALL_COLOR) {
      stored.ballColor = null;
    }
    return fromStored(stored);
  } catch {
    return null;
  }
};

const saveSettings = ({ drillId, ...settings }: TrainerSettings) => {
  try {
    globalThis.localStorage?.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...settings, presetId: drillId })
    );
    globalThis.localStorage?.removeItem(LEGACY_SETTINGS_KEY);
  } catch {
    // Browser privacy settings can block storage.
  }
};

/** Coalesces rapid changes, like a dragged slider, into one write. */
export class SettingsSaver {
  #timeout: ReturnType<typeof setTimeout> | undefined;
  #pending: TrainerSettings | undefined;

  schedule(settings: TrainerSettings) {
    this.#pending = settings;
    globalThis.clearTimeout(this.#timeout);
    this.#timeout = globalThis.setTimeout(this.flush, SAVE_DELAY_MS);
  }

  /** Saves pending changes now, for example when the page is hidden. */
  flush = () => {
    globalThis.clearTimeout(this.#timeout);
    this.#timeout = undefined;
    if (this.#pending) {
      saveSettings(this.#pending);
      this.#pending = undefined;
    }
  };
}

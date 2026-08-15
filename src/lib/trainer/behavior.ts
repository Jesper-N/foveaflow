import type { TrainerSettings } from "$lib/engine/presets";
import type { SizeProfile, SpeedProfile } from "$lib/engine/profiles";

export type BehaviorId =
  | "constant"
  | "wavePattern"
  | "surgePattern"
  | "alternatingPattern"
  | "climbPattern"
  | "sizePulse";

export const behaviorOptions = [
  { id: "constant", name: "Steady speed" },
  { id: "wavePattern", name: "Speed wave" },
  { id: "surgePattern", name: "Short bursts" },
  { id: "alternatingPattern", name: "Alternating pace" },
  { id: "climbPattern", name: "Build and reset" },
  { id: "sizePulse", name: "Size pulse" },
] as const satisfies readonly { id: BehaviorId; name: string }[];

const behaviorIdSet: ReadonlySet<string> = new Set(
  behaviorOptions.map((option) => option.id)
);

export const isBehaviorId = (value: string): value is BehaviorId =>
  behaviorIdSet.has(value);

export const getBehaviorId = (
  speedProfile: SpeedProfile,
  sizeProfile: SizeProfile
): BehaviorId => {
  if (sizeProfile.kind === "pulse") {
    return "sizePulse";
  }
  if (speedProfile.kind === "loopRamp") {
    return "climbPattern";
  }
  if (speedProfile.kind === "steps") {
    return speedProfile.intervalSec <= 0.7
      ? "surgePattern"
      : "alternatingPattern";
  }
  if (speedProfile.kind === "sine") {
    return "wavePattern";
  }
  return "constant";
};

type BehaviorProfiles = Pick<TrainerSettings, "speedProfile" | "sizeProfile">;

const behaviorProfilesById = {
  alternatingPattern: {
    sizeProfile: { kind: "constant" },
    speedProfile: {
      intervalSec: 1.25,
      kind: "steps",
      multipliers: [0.5, 1.5, 0.65, 1.35],
      transitionSec: 0.28,
    },
  },
  climbPattern: {
    sizeProfile: { kind: "constant" },
    speedProfile: {
      fromMultiplier: 0.45,
      kind: "loopRamp",
      periodSec: 5.8,
      resetSec: 1.2,
      toMultiplier: 1.65,
    },
  },
  constant: {
    sizeProfile: { kind: "constant" },
    speedProfile: { kind: "constant" },
  },
  sizePulse: {
    sizeProfile: {
      kind: "pulse",
      maxMultiplier: 1.4,
      minMultiplier: 0.7,
      periodSec: 3.2,
    },
    speedProfile: { kind: "constant" },
  },
  surgePattern: {
    sizeProfile: { kind: "constant" },
    speedProfile: {
      intervalSec: 0.65,
      kind: "steps",
      multipliers: [0.45, 1.65, 0.55, 1.5, 0.8],
      transitionSec: 0.18,
    },
  },
  wavePattern: {
    sizeProfile: { kind: "constant" },
    speedProfile: {
      kind: "sine",
      maxMultiplier: 1.55,
      minMultiplier: 0.45,
      periodSec: 5.2,
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
  behavior: BehaviorId
): BehaviorProfiles => {
  const profiles = behaviorProfilesById[behavior];
  return {
    sizeProfile: cloneSizeProfile(profiles.sizeProfile),
    speedProfile: cloneSpeedProfile(profiles.speedProfile),
  };
};

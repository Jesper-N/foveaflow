import type { SizeProfile, SpeedProfile } from "../engine/profiles";

/** "Motion feel" presets. Each one maps to a speed and size profile. */
export type BehaviorId =
  | "constant"
  | "wavePattern"
  | "surgePattern"
  | "alternatingPattern"
  | "climbPattern"
  | "sizePulse";

interface BehaviorProfiles {
  speedProfile: SpeedProfile;
  sizeProfile: SizeProfile;
}

export const behaviors = [
  { id: "constant", name: "Steady speed" },
  { id: "wavePattern", name: "Speed wave" },
  { id: "surgePattern", name: "Short bursts" },
  { id: "alternatingPattern", name: "Alternating pace" },
  { id: "climbPattern", name: "Build and reset" },
  { id: "sizePulse", name: "Size pulse" },
] as const satisfies readonly { id: BehaviorId; name: string }[];

const constantSize: SizeProfile = { kind: "constant" };

/** Short bursts step every 0.65 s and alternating pace every 1.25 s. */
const MAX_BURST_INTERVAL_SEC = 0.7;

const profilesByBehavior = {
  alternatingPattern: {
    sizeProfile: constantSize,
    speedProfile: {
      intervalSec: 1.25,
      kind: "steps",
      multipliers: [0.5, 1.5, 0.65, 1.35],
      transitionSec: 0.28,
    },
  },
  climbPattern: {
    sizeProfile: constantSize,
    speedProfile: {
      fromMultiplier: 0.45,
      kind: "loopRamp",
      periodSec: 5.8,
      resetSec: 1.2,
      toMultiplier: 1.65,
    },
  },
  constant: {
    sizeProfile: constantSize,
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
    sizeProfile: constantSize,
    speedProfile: {
      intervalSec: 0.65,
      kind: "steps",
      multipliers: [0.45, 1.65, 0.55, 1.5, 0.8],
      transitionSec: 0.18,
    },
  },
  wavePattern: {
    sizeProfile: constantSize,
    speedProfile: {
      kind: "sine",
      maxMultiplier: 1.55,
      minMultiplier: 0.45,
      periodSec: 5.2,
    },
  },
} satisfies Record<BehaviorId, BehaviorProfiles>;

export const isBehaviorId = (value: string): value is BehaviorId =>
  Object.hasOwn(profilesByBehavior, value);

export const getBehaviorName = (id: BehaviorId) =>
  behaviors.find((behavior) => behavior.id === id)?.name ?? id;

/** Works out which preset produced a pair of saved profiles. */
export const behaviorFromProfiles = (
  speedProfile: SpeedProfile,
  sizeProfile: SizeProfile
): BehaviorId => {
  if (sizeProfile.kind === "pulse") {
    return "sizePulse";
  }
  switch (speedProfile.kind) {
    case "loopRamp": {
      return "climbPattern";
    }
    case "steps": {
      return speedProfile.intervalSec <= MAX_BURST_INTERVAL_SEC
        ? "surgePattern"
        : "alternatingPattern";
    }
    case "sine": {
      return "wavePattern";
    }
    default: {
      return "constant";
    }
  }
};

/** Fresh copies, so settings never share profile objects with this table. */
export const profilesForBehavior = (id: BehaviorId): BehaviorProfiles => {
  const { sizeProfile, speedProfile } = profilesByBehavior[id];
  return {
    sizeProfile: { ...sizeProfile },
    speedProfile:
      speedProfile.kind === "steps"
        ? { ...speedProfile, multipliers: [...speedProfile.multipliers] }
        : { ...speedProfile },
  };
};

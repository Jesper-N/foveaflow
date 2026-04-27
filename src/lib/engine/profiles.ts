export type SpeedProfile =
  | { kind: "constant" }
  | {
      kind: "ramp";
      fromMultiplier: number;
      toMultiplier: number;
      durationSec: number;
    }
  | {
      kind: "sine";
      minMultiplier: number;
      maxMultiplier: number;
      periodSec: number;
    }
  | {
      kind: "steps";
      multipliers: number[];
      intervalSec: number;
      transitionSec: number;
    }
  | {
      kind: "loopRamp";
      fromMultiplier: number;
      toMultiplier: number;
      periodSec: number;
      resetSec: number;
    };

export type SizeProfile =
  | { kind: "constant" }
  | {
      kind: "pulse";
      minMultiplier: number;
      maxMultiplier: number;
      periodSec: number;
    };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clampSize = (value: number) => Math.min(100, Math.max(1, value));

const phase = (elapsedSec: number, periodSec: number) => {
  if (periodSec <= 0) return 0;
  return ((elapsedSec % periodSec) + periodSec) % periodSec;
};

const smoothStep = (value: number) => {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
};

export const sampleSpeedProfile = (
  profile: SpeedProfile,
  elapsedSec: number,
  basePxPerSec: number,
) => {
  if (profile.kind === "constant") return basePxPerSec;
  if (profile.kind === "ramp") {
    const progress = clamp01(elapsedSec / profile.durationSec);
    return (
      basePxPerSec *
      (profile.fromMultiplier +
        (profile.toMultiplier - profile.fromMultiplier) * progress)
    );
  }
  if (profile.kind === "sine") {
    if (profile.periodSec <= 0) return basePxPerSec * profile.minMultiplier;
    const wave =
      (Math.sin(
        (phase(elapsedSec, profile.periodSec) / profile.periodSec) *
          Math.PI *
          2,
      ) +
        1) /
      2;
    return (
      basePxPerSec *
      (profile.minMultiplier +
        (profile.maxMultiplier - profile.minMultiplier) * wave)
    );
  }
  if (profile.kind === "steps") {
    const multipliers = profile.multipliers;
    if (multipliers.length === 0 || profile.intervalSec <= 0) {
      return basePxPerSec;
    }

    const intervalSec = Math.max(0.1, profile.intervalSec);
    const transitionSec = Math.min(
      Math.max(0, profile.transitionSec),
      intervalSec,
    );
    const bucket = Math.floor(elapsedSec / intervalSec);
    const current = multipliers[bucket % multipliers.length] ?? 1;
    const next = multipliers[(bucket + 1) % multipliers.length] ?? current;

    if (transitionSec === 0) return basePxPerSec * current;

    const localSec = phase(elapsedSec, intervalSec);
    const transitionStart = intervalSec - transitionSec;
    const blend = smoothStep((localSec - transitionStart) / transitionSec);
    return basePxPerSec * (current + (next - current) * blend);
  }
  if (profile.kind === "loopRamp") {
    const periodSec = Math.max(0.1, profile.periodSec);
    const resetSec = Math.min(Math.max(0, profile.resetSec), periodSec);
    const cycleSec = phase(elapsedSec, periodSec);
    const rampSec = Math.max(0.1, periodSec - resetSec);

    if (cycleSec <= rampSec) {
      const blend = smoothStep(cycleSec / rampSec);
      return (
        basePxPerSec *
        (profile.fromMultiplier +
          (profile.toMultiplier - profile.fromMultiplier) * blend)
      );
    }

    if (resetSec === 0) return basePxPerSec * profile.fromMultiplier;

    const blend = smoothStep((cycleSec - rampSec) / resetSec);
    return (
      basePxPerSec *
      (profile.toMultiplier +
        (profile.fromMultiplier - profile.toMultiplier) * blend)
    );
  }
  return basePxPerSec;
};

export const sampleSizeProfile = (
  profile: SizeProfile,
  elapsedSec: number,
  baseRadiusPx: number,
) => {
  if (profile.kind === "constant") return clampSize(baseRadiusPx);
  if (profile.kind === "pulse") {
    if (profile.periodSec <= 0) return clampSize(baseRadiusPx);
    const wave =
      (Math.sin(
        (phase(elapsedSec, profile.periodSec) / profile.periodSec) *
          Math.PI *
          2,
      ) +
        1) /
      2;
    return clampSize(
      baseRadiusPx *
        (profile.minMultiplier +
          (profile.maxMultiplier - profile.minMultiplier) * wave),
    );
  }

  return clampSize(baseRadiusPx);
};

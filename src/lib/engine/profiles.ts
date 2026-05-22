export type SpeedProfile =
  | { kind: "constant" }
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
const FULL_CIRCLE_RADIANS = Math.PI * 2;

const phase = (elapsedSec: number, periodSec: number) => {
  if (periodSec <= 0) return 0;
  return ((elapsedSec % periodSec) + periodSec) % periodSec;
};

const smoothStep = (value: number) => {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
};

const sineWave = (elapsedSec: number, periodSec: number) => {
  return (
    (Math.sin(
      (phase(elapsedSec, periodSec) / periodSec) * FULL_CIRCLE_RADIANS,
    ) +
      1) /
    2
  );
};

const interpolate = (from: number, to: number, progress: number) => {
  return from + (to - from) * progress;
};

export const sampleSpeedProfile = (
  profile: SpeedProfile,
  elapsedSec: number,
  basePxPerSec: number,
) => {
  switch (profile.kind) {
    case "constant":
      return basePxPerSec;

    case "sine": {
      if (profile.periodSec <= 0) return basePxPerSec * profile.minMultiplier;
      return (
        basePxPerSec *
        interpolate(
          profile.minMultiplier,
          profile.maxMultiplier,
          sineWave(elapsedSec, profile.periodSec),
        )
      );
    }

    case "steps": {
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
      return basePxPerSec * interpolate(current, next, blend);
    }

    case "loopRamp": {
      const periodSec = Math.max(0.1, profile.periodSec);
      const resetSec = Math.min(Math.max(0, profile.resetSec), periodSec);
      const cycleSec = phase(elapsedSec, periodSec);
      const rampSec = Math.max(0.1, periodSec - resetSec);

      if (cycleSec <= rampSec) {
        const blend = smoothStep(cycleSec / rampSec);
        return (
          basePxPerSec *
          interpolate(profile.fromMultiplier, profile.toMultiplier, blend)
        );
      }

      if (resetSec === 0) return basePxPerSec * profile.fromMultiplier;

      const blend = smoothStep((cycleSec - rampSec) / resetSec);
      return (
        basePxPerSec *
        interpolate(profile.toMultiplier, profile.fromMultiplier, blend)
      );
    }
  }
};

export const sampleSizeProfile = (
  profile: SizeProfile,
  elapsedSec: number,
  baseRadiusPx: number,
) => {
  switch (profile.kind) {
    case "constant":
      return clampSize(baseRadiusPx);

    case "pulse": {
      if (profile.periodSec <= 0) return clampSize(baseRadiusPx);
      return clampSize(
        baseRadiusPx *
          interpolate(
            profile.minMultiplier,
            profile.maxMultiplier,
            sineWave(elapsedSec, profile.periodSec),
          ),
      );
    }
  }
};

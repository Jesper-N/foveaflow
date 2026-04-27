import { seededRange } from "./random";

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
  | { kind: "randomJitter"; amount: number; intervalSec: number }
  | {
      kind: "abruptStep";
      minMultiplier: number;
      maxMultiplier: number;
      intervalSec: number;
    };

export type SizeProfile =
  | { kind: "constant" }
  | { kind: "ramp"; fromPx: number; toPx: number; durationSec: number }
  | { kind: "pulse"; minPx: number; maxPx: number; periodSec: number }
  | { kind: "randomStep"; minPx: number; maxPx: number; intervalSec: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const phase = (elapsedSec: number, periodSec: number) => {
  if (periodSec <= 0) return 0;
  return ((elapsedSec % periodSec) + periodSec) % periodSec;
};

export const sampleSpeedProfile = (
  profile: SpeedProfile,
  elapsedSec: number,
  basePxPerSec: number,
  seed = 1,
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
  if (profile.kind === "randomJitter") {
    const bucket = Math.floor(
      elapsedSec / Math.max(profile.intervalSec, 0.001),
    );
    const jitter = seededRange(seed, bucket, -profile.amount, profile.amount);
    return basePxPerSec * Math.max(0.05, 1 + jitter);
  }

  const bucket = Math.floor(elapsedSec / Math.max(profile.intervalSec, 0.001));
  return (
    basePxPerSec *
    seededRange(seed, bucket, profile.minMultiplier, profile.maxMultiplier)
  );
};

export const sampleSizeProfile = (
  profile: SizeProfile,
  elapsedSec: number,
  baseRadiusPx: number,
  seed = 1,
) => {
  if (profile.kind === "constant") return baseRadiusPx;
  if (profile.kind === "ramp") {
    const progress = clamp01(elapsedSec / profile.durationSec);
    return profile.fromPx + (profile.toPx - profile.fromPx) * progress;
  }
  if (profile.kind === "pulse") {
    if (profile.periodSec <= 0) return profile.minPx;
    const wave =
      (Math.sin(
        (phase(elapsedSec, profile.periodSec) / profile.periodSec) *
          Math.PI *
          2,
      ) +
        1) /
      2;
    return profile.minPx + (profile.maxPx - profile.minPx) * wave;
  }

  const bucket = Math.floor(elapsedSec / Math.max(profile.intervalSec, 0.001));
  return seededRange(seed, bucket, profile.minPx, profile.maxPx);
};

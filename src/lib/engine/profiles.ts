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
  if (periodSec <= 0) {
    return 0;
  }
  return ((elapsedSec % periodSec) + periodSec) % periodSec;
};

const smoothStepPrimitive = (value: number) => {
  const progress = clamp01(value);
  return progress ** 3 - progress ** 4 / 2;
};

const sineWave = (elapsedSec: number, periodSec: number) =>
  (Math.sin((phase(elapsedSec, periodSec) / periodSec) * FULL_CIRCLE_RADIANS) +
    1) /
  2;

const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const integrateSineMultiplier = (
  profile: Extract<SpeedProfile, { kind: "sine" }>,
  elapsedSec: number
) => {
  if (profile.periodSec <= 0) {
    return profile.minMultiplier * elapsedSec;
  }

  const angularFrequency = FULL_CIRCLE_RADIANS / profile.periodSec;
  const midpoint = (profile.minMultiplier + profile.maxMultiplier) / 2;
  const amplitude = (profile.maxMultiplier - profile.minMultiplier) / 2;
  return (
    midpoint * elapsedSec -
    (amplitude * Math.cos(angularFrequency * elapsedSec)) / angularFrequency +
    amplitude / angularFrequency
  );
};

const integrateStepBucket = (
  currentMultiplier: number,
  nextMultiplier: number,
  elapsedSec: number,
  intervalSec: number,
  transitionSec: number
) => {
  if (transitionSec === 0) {
    return currentMultiplier * elapsedSec;
  }

  const transitionStart = intervalSec - transitionSec;
  if (elapsedSec <= transitionStart) {
    return currentMultiplier * elapsedSec;
  }

  const transitionElapsedSec = elapsedSec - transitionStart;
  return (
    currentMultiplier * elapsedSec +
    (nextMultiplier - currentMultiplier) *
      transitionSec *
      smoothStepPrimitive(transitionElapsedSec / transitionSec)
  );
};

const integrateStepsMultiplier = (
  profile: Extract<SpeedProfile, { kind: "steps" }>,
  elapsedSec: number
) => {
  const { multipliers } = profile;
  if (multipliers.length === 0 || profile.intervalSec <= 0) {
    return elapsedSec;
  }

  const intervalSec = Math.max(0.1, profile.intervalSec);
  const transitionSec = Math.min(
    Math.max(0, profile.transitionSec),
    intervalSec
  );
  const cycleSec = intervalSec * multipliers.length;
  const fullCycleCount = Math.floor(elapsedSec / cycleSec);
  const cycleRemainderSec = elapsedSec - fullCycleCount * cycleSec;
  let integral = 0;

  for (let index = 0; index < multipliers.length; index += 1) {
    const current = multipliers[index] ?? 1;
    const next = multipliers[(index + 1) % multipliers.length] ?? current;
    integral += integrateStepBucket(
      current,
      next,
      intervalSec,
      intervalSec,
      transitionSec
    );
  }
  integral *= fullCycleCount;

  const fullBucketCount = Math.min(
    multipliers.length,
    Math.floor(cycleRemainderSec / intervalSec)
  );
  for (let index = 0; index < fullBucketCount; index += 1) {
    const current = multipliers[index] ?? 1;
    const next = multipliers[(index + 1) % multipliers.length] ?? current;
    integral += integrateStepBucket(
      current,
      next,
      intervalSec,
      intervalSec,
      transitionSec
    );
  }

  if (fullBucketCount === multipliers.length) {
    return integral;
  }

  const bucketElapsedSec = cycleRemainderSec - fullBucketCount * intervalSec;
  const current = multipliers[fullBucketCount] ?? 1;
  const next =
    multipliers[(fullBucketCount + 1) % multipliers.length] ?? current;
  return (
    integral +
    integrateStepBucket(
      current,
      next,
      bucketElapsedSec,
      intervalSec,
      transitionSec
    )
  );
};

const integrateLoopRampCycle = (
  profile: Extract<SpeedProfile, { kind: "loopRamp" }>,
  elapsedSec: number
) => {
  const periodSec = Math.max(0.1, profile.periodSec);
  const resetSec = Math.min(Math.max(0, profile.resetSec), periodSec);
  const rampSec = Math.max(0.1, periodSec - resetSec);
  const rampElapsedSec = Math.min(elapsedSec, rampSec);
  const rampIntegral =
    profile.fromMultiplier * rampElapsedSec +
    (profile.toMultiplier - profile.fromMultiplier) *
      rampSec *
      smoothStepPrimitive(rampElapsedSec / rampSec);

  if (elapsedSec <= rampSec || resetSec === 0) {
    return rampIntegral;
  }

  const resetElapsedSec = elapsedSec - rampSec;
  return (
    rampIntegral +
    profile.toMultiplier * resetElapsedSec +
    (profile.fromMultiplier - profile.toMultiplier) *
      resetSec *
      smoothStepPrimitive(resetElapsedSec / resetSec)
  );
};

const integrateLoopRampMultiplier = (
  profile: Extract<SpeedProfile, { kind: "loopRamp" }>,
  elapsedSec: number
) => {
  const periodSec = Math.max(0.1, profile.periodSec);
  const fullCycleCount = Math.floor(elapsedSec / periodSec);
  const cycleRemainderSec = elapsedSec - fullCycleCount * periodSec;
  return (
    fullCycleCount * integrateLoopRampCycle(profile, periodSec) +
    integrateLoopRampCycle(profile, cycleRemainderSec)
  );
};

const integrateProfileMultiplier = (
  profile: SpeedProfile,
  elapsedSec: number
) => {
  switch (profile.kind) {
    case "constant": {
      return elapsedSec;
    }
    case "sine": {
      return integrateSineMultiplier(profile, elapsedSec);
    }
    case "steps": {
      return integrateStepsMultiplier(profile, elapsedSec);
    }
    case "loopRamp": {
      return integrateLoopRampMultiplier(profile, elapsedSec);
    }
    default: {
      throw new Error("Unsupported speed profile.");
    }
  }
};

export const integrateSpeedProfile = (
  profile: SpeedProfile,
  fromSec: number,
  toSec: number,
  basePxPerSec: number
) => {
  if (
    !Number.isFinite(fromSec) ||
    !Number.isFinite(toSec) ||
    !Number.isFinite(basePxPerSec)
  ) {
    return 0;
  }

  const startSec = Math.max(0, Math.min(fromSec, toSec));
  const endSec = Math.max(0, Math.max(fromSec, toSec));
  const direction = toSec < fromSec ? -1 : 1;
  const distancePx =
    Math.max(0, basePxPerSec) *
    (integrateProfileMultiplier(profile, endSec) -
      integrateProfileMultiplier(profile, startSec));
  return distancePx * direction;
};

export const sampleSizeProfile = (
  profile: SizeProfile,
  elapsedSec: number,
  baseRadiusPx: number
) => {
  switch (profile.kind) {
    case "constant": {
      return clampSize(baseRadiusPx);
    }

    case "pulse": {
      if (profile.periodSec <= 0) {
        return clampSize(baseRadiusPx);
      }
      return clampSize(
        baseRadiusPx *
          interpolate(
            profile.minMultiplier,
            profile.maxMultiplier,
            sineWave(elapsedSec, profile.periodSec)
          )
      );
    }
    default: {
      throw new Error("Unsupported size profile.");
    }
  }
};

export const getMaximumSizeProfileRadius = (
  profile: SizeProfile,
  baseRadiusPx: number
) => {
  if (profile.kind === "constant" || profile.periodSec <= 0) {
    return clampSize(baseRadiusPx);
  }

  return clampSize(
    baseRadiusPx * Math.max(profile.minMultiplier, profile.maxMultiplier)
  );
};

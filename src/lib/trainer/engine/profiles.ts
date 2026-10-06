import { TAU, clamp, positiveModulo } from "./math";

/**
 * How speed changes over time, as multipliers of the base speed. Motion
 * integrates the multiplier over time, so changes never make the target jump.
 */
export type SpeedProfile =
  | { kind: "constant" }
  | {
      kind: "sine";
      minMultiplier: number;
      maxMultiplier: number;
      periodSec: number;
    }
  | {
      /** Holds each multiplier for one interval, easing into the next one. */
      kind: "steps";
      multipliers: number[];
      intervalSec: number;
      transitionSec: number;
    }
  | {
      /** Eases up from one multiplier to another, then eases back. */
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

type SineProfile = Extract<SpeedProfile, { kind: "sine" }>;
type StepsProfile = Extract<SpeedProfile, { kind: "steps" }>;
type LoopRampProfile = Extract<SpeedProfile, { kind: "loopRamp" }>;

const MIN_RADIUS_PX = 1;
const MAX_RADIUS_PX = 100;
/** Floor for periods and intervals, so the math never divides by zero. */
const MIN_PERIOD_SEC = 0.1;

const clampRadius = (radiusPx: number) =>
  clamp(radiusPx, MIN_RADIUS_PX, MAX_RADIUS_PX);

/** Integral of the smoothstep-like ease `3p² - 2p³` from 0 to `progress`. */
const easeIntegral = (progress: number) => {
  const clamped = clamp(progress, 0, 1);
  return clamped ** 3 - clamped ** 4 / 2;
};

const integrateSine = (profile: SineProfile, elapsedSec: number) => {
  if (profile.periodSec <= 0) {
    return profile.minMultiplier * elapsedSec;
  }

  const angularFrequency = TAU / profile.periodSec;
  const midpoint = (profile.minMultiplier + profile.maxMultiplier) / 2;
  const amplitude = (profile.maxMultiplier - profile.minMultiplier) / 2;
  return (
    midpoint * elapsedSec -
    (amplitude * Math.cos(angularFrequency * elapsedSec)) / angularFrequency +
    amplitude / angularFrequency
  );
};

/** Integral within one step: hold `current`, then ease toward `next` at the end. */
const integrateStep = (
  current: number,
  next: number,
  elapsedSec: number,
  intervalSec: number,
  transitionSec: number
) => {
  if (transitionSec === 0) {
    return current * elapsedSec;
  }

  const transitionStartSec = intervalSec - transitionSec;
  if (elapsedSec <= transitionStartSec) {
    return current * elapsedSec;
  }

  const transitionElapsedSec = elapsedSec - transitionStartSec;
  return (
    current * elapsedSec +
    (next - current) *
      transitionSec *
      easeIntegral(transitionElapsedSec / transitionSec)
  );
};

const integrateStepAt = (
  { multipliers }: StepsProfile,
  stepIndex: number,
  elapsedSec: number,
  intervalSec: number,
  transitionSec: number
) =>
  integrateStep(
    multipliers[stepIndex],
    multipliers[(stepIndex + 1) % multipliers.length],
    elapsedSec,
    intervalSec,
    transitionSec
  );

const stepIntervalSec = (profile: StepsProfile) =>
  Math.max(MIN_PERIOD_SEC, profile.intervalSec);

const stepTransitionSec = (profile: StepsProfile, intervalSec: number) =>
  Math.min(Math.max(0, profile.transitionSec), intervalSec);

const integrateSteps = (profile: StepsProfile, elapsedSec: number) => {
  const stepCount = profile.multipliers.length;
  if (stepCount === 0 || profile.intervalSec <= 0) {
    return elapsedSec;
  }

  const intervalSec = stepIntervalSec(profile);
  const transitionSec = stepTransitionSec(profile, intervalSec);
  const cycleSec = intervalSec * stepCount;
  const fullCycleCount = Math.floor(elapsedSec / cycleSec);
  const cycleRemainderSec = elapsedSec - fullCycleCount * cycleSec;

  let integral = 0;
  for (let index = 0; index < stepCount; index += 1) {
    integral += integrateStepAt(
      profile,
      index,
      intervalSec,
      intervalSec,
      transitionSec
    );
  }
  integral *= fullCycleCount;

  const fullStepCount = Math.min(
    stepCount,
    Math.floor(cycleRemainderSec / intervalSec)
  );
  for (let index = 0; index < fullStepCount; index += 1) {
    integral += integrateStepAt(
      profile,
      index,
      intervalSec,
      intervalSec,
      transitionSec
    );
  }
  if (fullStepCount === stepCount) {
    return integral;
  }

  return (
    integral +
    integrateStepAt(
      profile,
      fullStepCount,
      cycleRemainderSec - fullStepCount * intervalSec,
      intervalSec,
      transitionSec
    )
  );
};

const integrateStepsBetween = (
  profile: StepsProfile,
  startSec: number,
  endSec: number
) => {
  const stepCount = profile.multipliers.length;
  const intervalSec = stepIntervalSec(profile);
  const startStep = Math.floor(startSec / intervalSec);
  const isWithinOneStep =
    stepCount > 0 &&
    profile.intervalSec > 0 &&
    startStep === Math.floor(endSec / intervalSec);

  // Frame-sized ranges almost always stay inside one step, which avoids
  // integrating every full cycle since the start of the drill.
  if (isWithinOneStep) {
    const stepIndex = startStep % stepCount;
    const transitionSec = stepTransitionSec(profile, intervalSec);
    const stepStartSec = startStep * intervalSec;
    return (
      integrateStepAt(
        profile,
        stepIndex,
        endSec - stepStartSec,
        intervalSec,
        transitionSec
      ) -
      integrateStepAt(
        profile,
        stepIndex,
        startSec - stepStartSec,
        intervalSec,
        transitionSec
      )
    );
  }

  return integrateSteps(profile, endSec) - integrateSteps(profile, startSec);
};

const integrateLoopRampCycle = (
  profile: LoopRampProfile,
  elapsedSec: number
) => {
  const periodSec = Math.max(MIN_PERIOD_SEC, profile.periodSec);
  const resetSec = Math.min(Math.max(0, profile.resetSec), periodSec);
  const rampSec = Math.max(MIN_PERIOD_SEC, periodSec - resetSec);
  const rampElapsedSec = Math.min(elapsedSec, rampSec);
  const rampIntegral =
    profile.fromMultiplier * rampElapsedSec +
    (profile.toMultiplier - profile.fromMultiplier) *
      rampSec *
      easeIntegral(rampElapsedSec / rampSec);

  if (elapsedSec <= rampSec || resetSec === 0) {
    return rampIntegral;
  }

  const resetElapsedSec = elapsedSec - rampSec;
  return (
    rampIntegral +
    profile.toMultiplier * resetElapsedSec +
    (profile.fromMultiplier - profile.toMultiplier) *
      resetSec *
      easeIntegral(resetElapsedSec / resetSec)
  );
};

const integrateLoopRamp = (profile: LoopRampProfile, elapsedSec: number) => {
  const periodSec = Math.max(MIN_PERIOD_SEC, profile.periodSec);
  const fullCycleCount = Math.floor(elapsedSec / periodSec);
  const cycleRemainderSec = elapsedSec - fullCycleCount * periodSec;
  return (
    fullCycleCount * integrateLoopRampCycle(profile, periodSec) +
    integrateLoopRampCycle(profile, cycleRemainderSec)
  );
};

const integrateMultiplier = (
  profile: SpeedProfile,
  startSec: number,
  endSec: number
) => {
  switch (profile.kind) {
    case "constant": {
      return endSec - startSec;
    }
    case "sine": {
      return integrateSine(profile, endSec) - integrateSine(profile, startSec);
    }
    case "steps": {
      return integrateStepsBetween(profile, startSec, endSec);
    }
    case "loopRamp": {
      return (
        integrateLoopRamp(profile, endSec) -
        integrateLoopRamp(profile, startSec)
      );
    }
    default: {
      throw new Error(`Unsupported speed profile: ${profile satisfies never}`);
    }
  }
};

/** Distance in pixels covered between two points in time. Negative when time runs backward. */
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
    Math.max(0, basePxPerSec) * integrateMultiplier(profile, startSec, endSec);
  return distancePx * direction;
};

export const sampleSizeProfile = (
  profile: SizeProfile,
  elapsedSec: number,
  baseRadiusPx: number
) => {
  if (profile.kind === "constant" || profile.periodSec <= 0) {
    return clampRadius(baseRadiusPx);
  }

  const phase = positiveModulo(elapsedSec, profile.periodSec);
  const wave = (Math.sin((phase / profile.periodSec) * TAU) + 1) / 2;
  const multiplier =
    profile.minMultiplier +
    (profile.maxMultiplier - profile.minMultiplier) * wave;
  return clampRadius(baseRadiusPx * multiplier);
};

/** The largest radius a size profile reaches, used to keep pulsing targets on screen. */
export const maxSizeProfileRadius = (
  profile: SizeProfile,
  baseRadiusPx: number
) => {
  if (profile.kind === "constant" || profile.periodSec <= 0) {
    return clampRadius(baseRadiusPx);
  }

  return clampRadius(
    baseRadiusPx * Math.max(profile.minMultiplier, profile.maxMultiplier)
  );
};

import { describe, expect, test } from "bun:test";

import {
  integrateSpeedProfile,
  sampleSpeedProfile,
  type SpeedProfile,
} from "../src/lib/engine/profiles";
import { advanceMotionTick } from "../src/lib/trainer/motion";

const profiles = [
  { kind: "constant" },
  {
    kind: "sine",
    minMultiplier: 0.45,
    maxMultiplier: 1.55,
    periodSec: 5.2,
  },
  {
    kind: "steps",
    multipliers: [0.45, 1.65, 0.55, 1.5, 0.8],
    intervalSec: 0.65,
    transitionSec: 0.18,
  },
  {
    kind: "loopRamp",
    fromMultiplier: 0.45,
    toMultiplier: 1.65,
    periodSec: 5.8,
    resetSec: 1.2,
  },
] as const satisfies readonly SpeedProfile[];

const regularEndpoints = (durationSec: number, refreshRate: number) => {
  const frameCount = Math.round(durationSec * refreshRate);
  return Array.from(
    { length: frameCount },
    (_, index) => ((index + 1) * durationSec) / frameCount,
  );
};

const irregularEndpoints = (durationSec: number) => {
  const steps = [0.011, 0.037, 0.079, 0.021, 0.053];
  const endpoints: number[] = [];
  let elapsedSec = 0;
  let index = 0;

  while (elapsedSec < durationSec) {
    elapsedSec = Math.min(
      durationSec,
      elapsedSec + steps[index % steps.length],
    );
    endpoints.push(elapsedSec);
    index += 1;
  }

  return endpoints;
};

const simulateMotion = (
  profile: SpeedProfile,
  endpoints: readonly number[],
  motionDirection: 1 | -1 = 1,
  canToggleDirection = true,
) => {
  const startTimestamp = 1_000;
  let lastTimestamp = startTimestamp;
  let elapsedSec = 0;
  let travelPx = 0;

  for (const endpoint of endpoints) {
    const next = advanceMotionTick({
      timestamp: startTimestamp + endpoint * 1_000,
      lastTimestamp,
      elapsedSec,
      travelPx,
      baseSpeedPxPerSec: 500,
      speedProfile: profile,
      canToggleDirection,
      motionDirection,
    });
    lastTimestamp = next.lastTimestamp;
    elapsedSec = next.elapsedSec;
    travelPx = next.travelPx;
  }

  return { elapsedSec, travelPx };
};

describe("speed-profile integration", () => {
  for (const profile of profiles) {
    test(`${profile.kind} is independent of frame cadence`, () => {
      const expectedDistance = integrateSpeedProfile(profile, 0, 60, 500);
      const endpointSets = [
        ...[30, 60, 120, 144].map((rate) => regularEndpoints(60, rate)),
        irregularEndpoints(60),
      ];

      for (const endpoints of endpointSets) {
        const result = simulateMotion(profile, endpoints);
        expect(result.elapsedSec).toBeCloseTo(60, 9);
        expect(result.travelPx).toBeCloseTo(expectedDistance, 7);
      }
    });

    test(`${profile.kind} partitions add to the one-shot integral`, () => {
      const boundaries = [0, 0.47, 1.3, 4.6, 5.8, 11.63, 23.7];
      let partitionedDistance = 0;
      for (let index = 1; index < boundaries.length; index += 1) {
        partitionedDistance += integrateSpeedProfile(
          profile,
          boundaries[index - 1],
          boundaries[index],
          500,
        );
      }

      expect(partitionedDistance).toBeCloseTo(
        integrateSpeedProfile(profile, 0, boundaries.at(-1) ?? 0, 500),
        9,
      );
    });

    test(`${profile.kind} applies direction only to distance`, () => {
      const endpoints = irregularEndpoints(10);
      const forward = simulateMotion(profile, endpoints, 1);
      const reverse = simulateMotion(profile, endpoints, -1);
      const fixedDirection = simulateMotion(profile, endpoints, -1, false);

      expect(reverse.travelPx).toBeCloseTo(-forward.travelPx, 8);
      expect(fixedDirection.travelPx).toBeCloseTo(forward.travelPx, 8);
      expect(reverse.elapsedSec).toBeCloseTo(forward.elapsedSec, 10);
    });
  }

  test("analytic distances match dense midpoint sampling", () => {
    const durationSec = 23.7;
    const sampleCount = 250_000;
    const sampleDurationSec = durationSec / sampleCount;

    for (const profile of profiles) {
      let sampledDistance = 0;
      for (let index = 0; index < sampleCount; index += 1) {
        sampledDistance +=
          sampleSpeedProfile(profile, (index + 0.5) * sampleDurationSec, 500) *
          sampleDurationSec;
      }

      expect(
        Math.abs(
          integrateSpeedProfile(profile, 0, durationSec, 500) - sampledDistance,
        ),
      ).toBeLessThan(0.05);
    }
  });

  test("a mid-session reversal is cadence independent", () => {
    const profile = profiles[2];
    const simulateReversal = (
      first: readonly number[],
      second: readonly number[],
    ) => {
      const firstHalf = simulateMotion(profile, first);
      const secondHalfEndpoints = second.map((endpoint) => endpoint + 30);
      const startTimestamp = 31_000;
      let lastTimestamp = startTimestamp;
      let elapsedSec = firstHalf.elapsedSec;
      let travelPx = firstHalf.travelPx;

      for (const endpoint of secondHalfEndpoints) {
        const next = advanceMotionTick({
          timestamp: 1_000 + endpoint * 1_000,
          lastTimestamp,
          elapsedSec,
          travelPx,
          baseSpeedPxPerSec: 500,
          speedProfile: profile,
          canToggleDirection: true,
          motionDirection: -1,
        });
        lastTimestamp = next.lastTimestamp;
        elapsedSec = next.elapsedSec;
        travelPx = next.travelPx;
      }

      return travelPx;
    };

    const at30Hz = simulateReversal(
      regularEndpoints(30, 30),
      regularEndpoints(30, 30),
    );
    const at144Hz = simulateReversal(
      regularEndpoints(30, 144),
      regularEndpoints(30, 144),
    );
    expect(at144Hz).toBeCloseTo(at30Hz, 7);
  });

  test("uninitialized and backward timestamps add no fake motion", () => {
    const uninitialized = advanceMotionTick({
      timestamp: 1_000,
      lastTimestamp: 0,
      elapsedSec: 0,
      travelPx: 0,
      baseSpeedPxPerSec: 500,
      speedProfile: profiles[0],
      canToggleDirection: true,
      motionDirection: 1,
    });
    const initial = advanceMotionTick({
      timestamp: 1_000,
      lastTimestamp: 1_000,
      elapsedSec: 4,
      travelPx: 200,
      baseSpeedPxPerSec: 500,
      speedProfile: profiles[0],
      canToggleDirection: true,
      motionDirection: 1,
    });
    const backward = advanceMotionTick({
      timestamp: 900,
      lastTimestamp: 1_000,
      elapsedSec: 4,
      travelPx: 200,
      baseSpeedPxPerSec: 500,
      speedProfile: profiles[0],
      canToggleDirection: true,
      motionDirection: 1,
    });

    expect(uninitialized).toEqual({
      lastTimestamp: 1_000,
      elapsedSec: 0,
      travelPx: 0,
    });
    expect(initial).toEqual({
      lastTimestamp: 1_000,
      elapsedSec: 4,
      travelPx: 200,
    });
    expect(backward).toEqual({
      lastTimestamp: 900,
      elapsedSec: 4,
      travelPx: 200,
    });
  });
});

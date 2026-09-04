import { expect, test } from "bun:test";

import { integrateSpeedProfile } from "../../src/lib/engine/profiles";
import type { SpeedProfile } from "../../src/lib/engine/profiles";

const steps: SpeedProfile = {
  intervalSec: 1,
  kind: "steps",
  multipliers: [1, 3],
  transitionSec: 0,
};

test("step speed integration covers partial buckets, transitions, cycles and reverse time", () => {
  expect(integrateSpeedProfile(steps, 0.2, 0.4, 100)).toBeCloseTo(20, 10);
  expect(integrateSpeedProfile(steps, 0.9, 1.1, 100)).toBeCloseTo(40, 10);
  expect(integrateSpeedProfile(steps, 0, 4, 100)).toBeCloseTo(800, 10);
  expect(integrateSpeedProfile(steps, 1.1, 0.9, 100)).toBeCloseTo(-40, 10);
  expect(integrateSpeedProfile(steps, -1, 0.5, 100)).toBeCloseTo(50, 10);
  expect(
    integrateSpeedProfile({ ...steps, transitionSec: 0.2 }, 0.8, 1, 100)
  ).toBeCloseTo(40, 10);
});

test("splitting a speed interval preserves its integrated distance", () => {
  for (const transitionSec of [0, 0.2, 1, 2]) {
    const profile = { ...steps, transitionSec };
    for (let index = 0; index < 1000; index += 1) {
      const start = index / 73;
      const middle = start + 0.003;
      const end = middle + 0.035;
      const split =
        integrateSpeedProfile(profile, start, middle, 420) +
        integrateSpeedProfile(profile, middle, end, 420);
      expect(split).toBeCloseTo(
        integrateSpeedProfile(profile, start, end, 420),
        8
      );
    }
  }
});

test("speed integration retains invalid input and empty-profile behavior", () => {
  expect(integrateSpeedProfile(steps, Number.NaN, 1, 100)).toBe(0);
  expect(integrateSpeedProfile(steps, 0, Number.POSITIVE_INFINITY, 100)).toBe(
    0
  );
  expect(integrateSpeedProfile(steps, 0, 1, -100)).toBe(0);
  expect(integrateSpeedProfile({ ...steps, multipliers: [] }, 0, 1, 100)).toBe(
    100
  );
  expect(integrateSpeedProfile({ ...steps, intervalSec: 0 }, 0, 1, 100)).toBe(
    100
  );
});

import { describe, expect, test } from "bun:test";

import { sampleSizeProfile, sampleSpeedProfile } from "./profiles";
import type { SpeedProfile } from "./profiles";

describe("sampleSpeedProfile", () => {
  test("keeps constant speed unchanged", () => {
    expect(sampleSpeedProfile({ kind: "constant" }, 10, 120)).toBe(120);
  });

  test("samples sine speed between configured multipliers", () => {
    const profile = {
      kind: "sine",
      minMultiplier: 0.5,
      maxMultiplier: 1.5,
      periodSec: 4,
    } as const;

    expect(sampleSpeedProfile(profile, 0, 100)).toBe(100);
    expect(sampleSpeedProfile(profile, 1, 100)).toBe(150);
  });

  test("blends stepped speed during transition window", () => {
    const profile: SpeedProfile = {
      kind: "steps",
      multipliers: [1, 2],
      intervalSec: 1,
      transitionSec: 0.5,
    };

    expect(sampleSpeedProfile(profile, 0.25, 100)).toBe(100);
    expect(sampleSpeedProfile(profile, 1.25, 100)).toBe(200);
  });
});

describe("sampleSizeProfile", () => {
  test("clamps constant target size", () => {
    expect(sampleSizeProfile({ kind: "constant" }, 0, 0)).toBe(1);
    expect(sampleSizeProfile({ kind: "constant" }, 0, 140)).toBe(100);
  });

  test("samples pulse profile", () => {
    const profile = {
      kind: "pulse",
      minMultiplier: 0.5,
      maxMultiplier: 1.5,
      periodSec: 4,
    } as const;

    expect(sampleSizeProfile(profile, 1, 40)).toBe(60);
  });
});

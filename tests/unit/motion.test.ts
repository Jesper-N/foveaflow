import { describe, expect, test } from "bun:test";

import { FrameSampler } from "../../src/lib/trainer/canvas/frame-sampler";
import { resolvePatternBounds } from "../../src/lib/trainer/engine/bounds";
import {
  letterAt,
  timeLetterBucket,
} from "../../src/lib/trainer/engine/letters";
import { MotionClock } from "../../src/lib/trainer/engine/motion-clock";
import { PatternSampler } from "../../src/lib/trainer/engine/pattern-sampler";
import type { PatternParams } from "../../src/lib/trainer/engine/pattern-sampler";
import {
  integrateSpeedProfile,
  maxSizeProfileRadius,
  sampleSizeProfile,
} from "../../src/lib/trainer/engine/profiles";
import type { SpeedProfile } from "../../src/lib/trainer/engine/profiles";
import { createRng } from "../../src/lib/trainer/engine/random";
import {
  centimetersPerSecondToSpeed,
  speedToPixelsPerSecond,
} from "../../src/lib/trainer/engine/speed";
import type {
  PatternId,
  TargetFrame,
} from "../../src/lib/trainer/engine/types";
import { profilesForBehavior } from "../../src/lib/trainer/settings/behaviors";
import { getDrill } from "../../src/lib/trainer/settings/drills";
import { pursuitPatterns } from "../../src/lib/trainer/settings/patterns";
import { createDefaultSettings } from "../../src/lib/trainer/settings/settings";

const ALL_PATTERNS: PatternId[] = [
  ...pursuitPatterns.map(({ id }) => id),
  "teleport",
  "multipleObjectTracking",
];
const ARENA = { height: 1080, width: 1920 };
const SEED = 12_345;

const params = (travelPx: number): PatternParams => ({
  distractorCount: 4,
  pathMarginPx: 16,
  radiusPx: 30,
  targetCount: 2,
  travelPx,
});

/** Samples one pattern at each travel distance, as a running drill would. */
const samplePositions = (
  patternId: PatternId,
  travels: readonly number[],
  arena = ARENA
) => {
  const sampler = new PatternSampler();
  const rng = createRng(SEED);
  const frames: TargetFrame[] = [];
  return travels.map((travelPx) => {
    const count = sampler.sample(
      frames,
      patternId,
      arena,
      params(travelPx),
      rng
    );
    return frames.slice(0, count).map((frame) => ({ ...frame }));
  });
};

describe("speed", () => {
  test("legacy cm/s speeds keep their on-screen distance", () => {
    const speed = centimetersPerSecondToSpeed(20);
    expect(speedToPixelsPerSecond(speed) / 37.8).toBeCloseTo(20, 9);
  });

  test("an invalid speed stands still instead of breaking the drill", () => {
    expect(speedToPixelsPerSecond(Number.NaN)).toBe(0);
    expect(integrateSpeedProfile({ kind: "constant" }, 0, Infinity, 1)).toBe(0);
  });

  // Each frame integrates its own slice of time, so any split must add up to
  // the same distance, or motion would depend on the frame rate.
  test.each([
    "wavePattern",
    "surgePattern",
    "climbPattern",
    "constant",
  ] as const)(
    "%s: distance does not depend on how time is split",
    (behavior) => {
      const { speedProfile } = profilesForBehavior(behavior);
      for (const [start, middle, end] of [
        [0, 0.3, 1],
        [0.5, 2.2, 7.9],
        [3.1, 3.9, 30],
      ]) {
        const whole = integrateSpeedProfile(speedProfile, start, end, 50);
        const parts =
          integrateSpeedProfile(speedProfile, start, middle, 50) +
          integrateSpeedProfile(speedProfile, middle, end, 50);
        expect(parts).toBeCloseTo(whole, 6);
      }
    }
  );

  test("a speed wave averages to its midpoint over one period", () => {
    const profile: SpeedProfile = {
      kind: "sine",
      maxMultiplier: 1.5,
      minMultiplier: 0.5,
      periodSec: 4,
    };
    expect(integrateSpeedProfile(profile, 0, 4, 10)).toBeCloseTo(40, 9);
  });

  test("a size pulse stays within its range", () => {
    const { sizeProfile } = profilesForBehavior("sizePulse");
    const largest = maxSizeProfileRadius(sizeProfile, 40);
    for (let elapsedSec = 0; elapsedSec < 10; elapsedSec += 0.1) {
      expect(
        sampleSizeProfile(sizeProfile, elapsedSec, 40)
      ).toBeLessThanOrEqual(largest + 1e-9);
    }
    expect(largest).toBe(56);
  });
});

describe("motion clock", () => {
  test("resuming after a pause does not jump the target", () => {
    const clock = new MotionClock();
    clock.advance(1000, 100, { kind: "constant" }, 1);
    expect(clock.travelPx).toBe(0);
    clock.advance(1016, 100, { kind: "constant" }, 1);
    expect(clock.travelPx).toBeCloseTo(1.6, 9);
  });

  test("a long gap, like a background tab, counts as one short frame", () => {
    const clock = new MotionClock();
    clock.advance(1000, 100, { kind: "constant" }, 1);
    clock.advance(6000, 100, { kind: "constant" }, 1);
    expect(clock.elapsedSec).toBeCloseTo(0.08, 9);
  });

  test("reverse direction runs the travel backward", () => {
    const clock = new MotionClock();
    clock.advance(1000, 100, { kind: "constant" }, -1);
    clock.advance(1016, 100, { kind: "constant" }, -1);
    expect(clock.travelPx).toBeCloseTo(-1.6, 9);
  });
});

describe("patterns", () => {
  test.each(ALL_PATTERNS)("%s: targets stay inside the arena", (patternId) => {
    const bounds = resolvePatternBounds(ARENA, 30, 16);
    const travels = Array.from({ length: 400 }, (_, index) => index * 37.5);
    for (const frames of samplePositions(patternId, travels)) {
      for (const { x, y } of frames) {
        expect(x).toBeGreaterThanOrEqual(bounds.left - 1e-6);
        expect(x).toBeLessThanOrEqual(bounds.right + 1e-6);
        expect(y).toBeGreaterThanOrEqual(bounds.top - 1e-6);
        expect(y).toBeLessThanOrEqual(bounds.bottom + 1e-6);
      }
    }
  });

  test.each(ALL_PATTERNS)(
    "%s: position depends on distance, not frame rate",
    (patternId) => {
      const fine = samplePositions(
        patternId,
        Array.from({ length: 601 }, (_, index) => index * 5)
      );
      const coarse = samplePositions(
        patternId,
        Array.from({ length: 21 }, (_, index) => index * 150)
      );
      for (const [index, frames] of coarse.entries()) {
        const expected = fine[index * 30];
        expect(frames).toHaveLength(expected.length);
        for (const [frameIndex, { x, y }] of frames.entries()) {
          expect(x).toBeCloseTo(expected[frameIndex].x, 6);
          expect(y).toBeCloseTo(expected[frameIndex].y, 6);
        }
      }
    }
  );

  test("a resize keeps a looping target at the same point of its lap", () => {
    const sampler = new PatternSampler();
    const rng = createRng(SEED);
    const frames: TargetFrame[] = [];
    const angleAt = (arena: typeof ARENA, travelPx: number) => {
      sampler.sample(frames, "circle", arena, params(travelPx), rng);
      return Math.atan2(
        frames[0].y - arena.height / 2,
        frames[0].x - arena.width / 2
      );
    };
    const before = angleAt(ARENA, 1000);
    const after = angleAt({ height: 540, width: 960 }, 1000);
    expect(after).toBeCloseTo(before, 9);
  });

  test("Reaction Jumps hold still, then jump and fade in", () => {
    const sampler = new PatternSampler();
    const rng = createRng(SEED);
    const frames: TargetFrame[] = [];
    const jumps: { x: number; y: number; alphas: number[] }[] = [];
    for (let travelPx = 0; travelPx < 3000; travelPx += 5) {
      sampler.sample(frames, "teleport", ARENA, params(travelPx), rng);
      const [{ x, y, alpha }] = frames;
      jumps[sampler.jumpIndex] ??= { alphas: [], x, y };
      const jump = jumps[sampler.jumpIndex];
      expect([x, y]).toEqual([jump.x, jump.y]);
      jump.alphas.push(alpha);
    }

    expect(jumps.length).toBeGreaterThan(3);
    for (const [index, jump] of jumps.entries()) {
      expect(jump.alphas[0]).toBeLessThan(1);
      expect(jump.alphas.at(-1)).toBe(1);
      if (index > 0) {
        expect([jump.x, jump.y]).not.toEqual([
          jumps[index - 1].x,
          jumps[index - 1].y,
        ]);
      }
    }
  });

  test("Multiple Distractions lists targets before distractors", () => {
    const [frames] = samplePositions("multipleObjectTracking", [100]);
    expect(frames.map(({ role }) => role)).toEqual([
      "target",
      "target",
      "distractor",
      "distractor",
      "distractor",
      "distractor",
    ]);
  });

  // Locks every route. Update with `bun test --update-snapshots` only when a
  // change to the motion is intended.
  test("routes match the recorded snapshot", () => {
    const routes = Object.fromEntries(
      ALL_PATTERNS.map((patternId) => [
        patternId,
        samplePositions(patternId, [0, 333, 1234, 5678, 20_000]).map((frames) =>
          frames.map(({ x, y, alpha }) => [
            Number(x.toFixed(4)),
            Number(y.toFixed(4)),
            alpha,
          ])
        ),
      ])
    );
    expect(routes).toMatchSnapshot();
  });
});

describe("frames", () => {
  test("a pulsing target keeps room for its largest size", () => {
    const settings = {
      ...createDefaultSettings(),
      baseRadiusPx: 60,
      patternId: "horizontalSweep" as const,
      sizeProfile: {
        kind: "pulse",
        maxMultiplier: 1.5,
        minMultiplier: 0.5,
        periodSec: 2,
      } as const,
    };
    const sample = new FrameSampler().sample(
      settings,
      ARENA,
      0,
      0,
      createRng(SEED)
    );
    // The route starts at the left edge, inset by the 90 px peak radius plus the gap.
    expect(sample.frames[0].x).toBe(98);
  });

  test("letters change every two seconds", () => {
    expect(timeLetterBucket(1.9)).toBe(0);
    expect(timeLetterBucket(2)).toBe(1);
    expect(letterAt(SEED, 0, 0)).toMatch(/^[A-Z]$/u);
    expect(letterAt(SEED, 0, 0)).not.toBe(letterAt(SEED, 0, 1));
  });

  test("Reaction Jumps change letters with each jump, not with time", () => {
    const settings = createDefaultSettings(getDrill("reactionTime"));
    const sampler = new FrameSampler();
    const rng = createRng(SEED);
    const bucketAt = (elapsedSec: number, travelPx: number) =>
      sampler.sample(settings, ARENA, elapsedSec, travelPx, rng).letterBucket;
    expect(bucketAt(0, 10)).toBe(0);
    expect(bucketAt(30, 10)).toBe(0);
    expect(bucketAt(30, 3000)).toBeGreaterThan(0);
  });
});

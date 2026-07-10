import { describe, expect, test } from "bun:test";

import {
  DEFAULT_CALIBRATION,
  speedToPixelsPerSecond,
} from "../src/lib/engine/calibration";
import { getReactionLetterBucket } from "../src/lib/engine/letters";
import { getTeleportJumpDistancePx } from "../src/lib/engine/patterns";
import {
  firstPreset,
  patternOptions,
  settingsFromPreset,
} from "../src/lib/engine/presets";
import { createRng } from "../src/lib/engine/random";
import type { Arena, TargetShape } from "../src/lib/engine/types";
import { createTrainerFrameSampler } from "../src/lib/trainer/frame-sampler";
import { getLilacChaserOuterRadiusPx } from "../src/lib/trainer/rendering";
import {
  adjustSpeedBySteps,
  resolveStoredSettings,
  resolveSpeedUnit,
  trainerSettingBounds,
  updateCalibrationField,
} from "../src/lib/trainer/settings";
import { getTargetVisualExtentPx } from "../src/lib/trainer/target-geometry";

const arena: Arena = { width: 1_200, height: 800 };

describe("calibrated speed settings", () => {
  test("preserves physical speed when units change", () => {
    const speed = { unit: "deg/s", value: 20 } as const;
    const before = speedToPixelsPerSecond(speed, arena, DEFAULT_CALIBRATION);
    const centimeters = resolveSpeedUnit(
      speed,
      "cm/s",
      arena,
      DEFAULT_CALIBRATION,
    );
    const screens = resolveSpeedUnit(
      centimeters,
      "screen/s",
      arena,
      DEFAULT_CALIBRATION,
    );

    expect(
      speedToPixelsPerSecond(centimeters, arena, DEFAULT_CALIBRATION),
    ).toBeCloseTo(before, 10);
    expect(
      speedToPixelsPerSecond(screens, arena, DEFAULT_CALIBRATION),
    ).toBeCloseTo(before, 10);
  });

  test("uses the configured step for each unit", () => {
    expect(
      adjustSpeedBySteps({ unit: "screen/s", value: 1 }, 1).value,
    ).toBeCloseTo(1.05, 10);
    expect(adjustSpeedBySteps({ unit: "cm/s", value: 1 }, 1).value).toBe(2);
  });

  test("preserves low physical speeds when converting to screens", () => {
    for (const speed of [
      { unit: "deg/s", value: 0.5 },
      { unit: "cm/s", value: 0.5 },
    ] as const) {
      const before = speedToPixelsPerSecond(speed, arena, DEFAULT_CALIBRATION);
      const converted = resolveSpeedUnit(
        speed,
        "screen/s",
        arena,
        DEFAULT_CALIBRATION,
      );

      expect(
        speedToPixelsPerSecond(converted, arena, DEFAULT_CALIBRATION),
      ).toBeCloseTo(before, 10);
    }
  });
});

describe("live calibration", () => {
  test("uses the same bounds as stored calibration", () => {
    const high = updateCalibrationField(
      DEFAULT_CALIBRATION,
      "viewingDistanceCm",
      1e12,
      () => 1,
    );
    const low = updateCalibrationField(
      DEFAULT_CALIBRATION,
      "cssPxPerCm",
      1,
      () => 2,
    );

    expect(high?.viewingDistanceCm).toBe(
      trainerSettingBounds.viewingDistanceCm.max,
    );
    expect(low?.cssPxPerCm).toBe(trainerSettingBounds.cssPxPerCm.min);
  });

  test("rejects non-finite values", () => {
    expect(
      updateCalibrationField(
        DEFAULT_CALIBRATION,
        "viewingDistanceCm",
        Number.POSITIVE_INFINITY,
      ),
    ).toBeNull();
  });
});

describe("stored profile validation", () => {
  test("rejects unsafe multipliers and oversized step profiles", () => {
    const unsafeSine = resolveStoredSettings({
      presetId: "pursuit",
      speedProfile: {
        kind: "sine",
        minMultiplier: 0.5,
        maxMultiplier: 1e300,
        periodSec: 4,
      },
    });
    const oversizedSteps = resolveStoredSettings({
      presetId: "pursuit",
      speedProfile: {
        kind: "steps",
        multipliers: Array.from({ length: 33 }, () => 1),
        intervalSec: 1,
        transitionSec: 0.2,
      },
    });

    expect(unsafeSine.speedProfile).toEqual(firstPreset.speedProfile);
    expect(oversizedSteps.speedProfile).toEqual(firstPreset.speedProfile);
  });
});

describe("rendered target bounds", () => {
  const shapes = [
    "circle",
    "ring",
    "square",
    "diamond",
    "triangle",
    "cross",
  ] as const satisfies readonly TargetShape[];

  for (const shape of shapes) {
    test(`${shape} stays fully inside the arena`, () => {
      for (const { id: patternId } of patternOptions) {
        const sampler = createTrainerFrameSampler();
        const settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION, {
          patternId,
          targetShape: shape,
          baseRadiusPx: trainerSettingBounds.baseRadiusPx.max,
          sizeProfile: { kind: "constant" },
        });

        for (const travelPx of [0, 250, 700]) {
          const sample = sampler.sample({
            settings,
            arena,
            elapsedSec: travelPx / 500,
            travelPx,
            currentSpeedPxPerSec: 500,
            baseSpeedPxPerSec: 500,
            safeBallColor: "#76d900",
            distractorColor: "#3d7000",
            pathMarginPx: 16,
            rng: createRng(123),
            seed: 123,
          });

          for (const frame of sample.frames.slice(0, sample.count)) {
            const extent = getTargetVisualExtentPx(frame.radiusPx, shape);
            expect(frame.x - extent).toBeGreaterThanOrEqual(-1e-9);
            expect(frame.x + extent).toBeLessThanOrEqual(arena.width + 1e-9);
            expect(frame.y - extent).toBeGreaterThanOrEqual(-1e-9);
            expect(frame.y + extent).toBeLessThanOrEqual(arena.height + 1e-9);
          }
        }
      }
    });
  }
});

describe("special-mode geometry", () => {
  test("keeps Lilac Chaser dots inside a phone-sized arena", () => {
    const phoneArena = { width: 390, height: 700 };
    const outerRadius = getLilacChaserOuterRadiusPx(
      phoneArena,
      trainerSettingBounds.lilacChaserScale.max,
    );

    expect(outerRadius).toBeLessThan(phoneArena.width / 2);
  });

  test("uses the rendered teleport distance for reaction letters", () => {
    const reactionPreset = settingsFromPreset(
      firstPreset,
      DEFAULT_CALIBRATION,
      {
        presetId: "reactionTime",
        patternId: "teleport",
        targetShape: "diamond",
        baseRadiusPx: 100,
      },
    );
    const travelPx = 450;
    const sample = createTrainerFrameSampler().sample({
      settings: reactionPreset,
      arena: { width: 1_920, height: 1_080 },
      elapsedSec: 0.9,
      travelPx,
      currentSpeedPxPerSec: 500,
      baseSpeedPxPerSec: 500,
      safeBallColor: "#76d900",
      distractorColor: "#3d7000",
      pathMarginPx: 16,
      rng: createRng(123),
      seed: 123,
    });
    const expectedJumpDistance = getTeleportJumpDistancePx(
      { width: 1_920, height: 1_080 },
      100,
      getTargetVisualExtentPx(100, "diamond") + 8,
    );

    expect(sample.letterContext.reactionJumpDistancePx).toBeCloseTo(
      expectedJumpDistance,
      10,
    );
    expect(
      getReactionLetterBucket(
        travelPx,
        sample.letterContext.reactionJumpDistancePx,
      ),
    ).toBe(1);
  });
});

describe("frame sampler lifecycle", () => {
  test("drops dormant random-walk state after switching patterns", () => {
    const settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION, {
      patternId: "randomWalk",
    });
    const inputAt = (travelPx: number) => ({
      settings,
      arena,
      elapsedSec: travelPx / 500,
      travelPx,
      currentSpeedPxPerSec: 500,
      baseSpeedPxPerSec: 500,
      safeBallColor: "#76d900",
      distractorColor: "#3d7000",
      pathMarginPx: 16,
      rng: createRng(123),
      seed: 123,
    });
    const sampler = createTrainerFrameSampler();

    sampler.sample(inputAt(100));
    settings.patternId = "circle";
    sampler.sample(inputAt(20_000));
    settings.patternId = "randomWalk";
    const resumed = sampler.sample(inputAt(20_000)).frames[0];
    const fresh = createTrainerFrameSampler().sample(inputAt(20_000)).frames[0];

    expect(resumed.x).toBeCloseTo(fresh.x, 10);
    expect(resumed.y).toBeCloseTo(fresh.y, 10);
  });

  test("keeps hard-turn bounds stable while target size pulses", () => {
    const settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION, {
      patternId: "directionChange",
      baseRadiusPx: 60,
      sizeProfile: {
        kind: "pulse",
        minMultiplier: 0.7,
        maxMultiplier: 1.4,
        periodSec: 4,
      },
    });
    const sampleAt = (elapsedSec: number) => {
      const sample = createTrainerFrameSampler().sample({
        settings,
        arena,
        elapsedSec,
        travelPx: 700,
        currentSpeedPxPerSec: 500,
        baseSpeedPxPerSec: 500,
        safeBallColor: "#76d900",
        distractorColor: "#3d7000",
        pathMarginPx: 16,
        rng: createRng(123),
        seed: 123,
      });
      return sample.frames[0];
    };

    const midpoint = sampleAt(0);
    const maximum = sampleAt(1);

    expect(maximum.radiusPx).toBeGreaterThan(midpoint.radiusPx);
    expect(maximum.x).toBeCloseTo(midpoint.x, 10);
    expect(maximum.y).toBeCloseTo(midpoint.y, 10);
  });
});

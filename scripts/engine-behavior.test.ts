import { describe, expect, test } from "bun:test";

import { createPatternSampler } from "../src/lib/engine/patterns";
import { createRng } from "../src/lib/engine/random";
import type {
  Arena,
  PatternId,
  PatternParams,
  TargetFrame,
} from "../src/lib/engine/types";

const arena: Arena = { width: 1_000, height: 800 };

const createParams = (
  overrides: Partial<PatternParams> = {},
): PatternParams => ({
  radiusPx: 30,
  pathMarginPx: 16,
  speedPxPerSec: 500,
  travelPx: 0,
  targetCount: 1,
  distractorCount: 2,
  ...overrides,
});

const copyFrames = (frames: TargetFrame[], count: number) =>
  frames.slice(0, count).map((frame) => ({ ...frame }));

const expectFrameInsidePatternBounds = (
  frame: TargetFrame,
  targetArena: Arena,
  params: PatternParams,
) => {
  const margin = Math.min(
    Math.max(params.pathMarginPx ?? 16, params.radiusPx + 8),
    Math.min(targetArena.width, targetArena.height) / 2,
  );
  expect(frame.x).toBeGreaterThanOrEqual(margin);
  expect(frame.x).toBeLessThanOrEqual(targetArena.width - margin);
  expect(frame.y).toBeGreaterThanOrEqual(margin);
  expect(frame.y).toBeLessThanOrEqual(targetArena.height - margin);
};

const travelSamples = (finalTravelPx: number, stepPx: number) => {
  const samples = [0];
  for (let travelPx = stepPx; travelPx < finalTravelPx; travelPx += stepPx) {
    samples.push(travelPx);
  }
  samples.push(finalTravelPx);
  return samples;
};

const sampleRandomWalk = (travelSamples: readonly number[]) => {
  const sampler = createPatternSampler();
  const frames: TargetFrame[] = [];
  const rng = createRng(12_345);
  const params = createParams();

  for (const travelPx of travelSamples) {
    params.travelPx = travelPx;
    sampler.sampleInto(
      frames,
      "randomWalk",
      travelPx / params.speedPxPerSec,
      arena,
      params,
      rng,
    );
  }

  return { ...frames[0] };
};

const sampleMot = (
  sampler: ReturnType<typeof createPatternSampler>,
  frames: TargetFrame[],
  params: PatternParams,
  travelPx: number,
) => {
  params.travelPx = travelPx;
  const count = sampler.sampleInto(
    frames,
    "multipleObjectTracking",
    travelPx / params.speedPxPerSec,
    arena,
    params,
    createRng(42),
  );
  return copyFrames(frames, count);
};

describe("indexed random sampling", () => {
  test("keeps the fixed-seed 32-bit sequence stable", () => {
    const rng = createRng(123_456);
    const words = [0, 1, 2, 100, 40_000].map((index) =>
      Math.floor(rng.randomAt(index) * 4_294_967_296),
    );

    expect(words).toEqual([
      1_571_065_163, 666_828_013, 2_134_397_263, 2_329_773_947, 917_378_548,
    ]);
  });
});

describe("random-walk sampling", () => {
  test("reaches the same endpoint across sampling cadences", () => {
    const finalTravelPx = 10_000;
    const oneTick = sampleRandomWalk([0, finalTravelPx]);

    for (const stepPx of [4.175, 8.35, 13.7]) {
      const sampled = sampleRandomWalk(travelSamples(finalTravelPx, stepPx));
      expect(sampled.x).toBeCloseTo(oneTick.x, 10);
      expect(sampled.y).toBeCloseTo(oneTick.y, 10);
    }
  });

  test("keeps motion smooth across fixed-step boundaries", () => {
    const samples = travelSamples(1_000, 4.175);
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();
    let previous: TargetFrame | null = null;

    for (const travelPx of samples) {
      params.travelPx = travelPx;
      sampler.sampleInto(
        frames,
        "randomWalk",
        travelPx / params.speedPxPerSec,
        arena,
        params,
        createRng(12_345),
      );
      if (previous) {
        expect(
          Math.hypot(frames[0].x - previous.x, frames[0].y - previous.y),
        ).toBeLessThanOrEqual(5);
      }
      previous = { ...frames[0] };
    }
  });

  test("preserves a legal point when the arena changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 700 });
    const rng = createRng(12_345);

    params.travelPx = 0;
    sampler.sampleInto(frames, "randomWalk", 0, arena, params, rng);
    params.travelPx = 700;
    sampler.sampleInto(frames, "randomWalk", 1.4, arena, params, rng);
    const beforeResize = { ...frames[0] };
    sampler.sampleInto(
      frames,
      "randomWalk",
      1.4,
      { width: 1_200, height: 900 },
      params,
      rng,
    );

    expect(frames[0].x).toBeCloseTo(beforeResize.x, 10);
    expect(frames[0].y).toBeCloseTo(beforeResize.y, 10);
  });
});

describe("multiple-object tracking state", () => {
  test("preserves trajectories when radius changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();

    sampleMot(sampler, frames, params, 0);
    const before = sampleMot(sampler, frames, params, 100);
    params.radiusPx = 31;
    const after = sampleMot(sampler, frames, params, 100);

    expect(after.map(({ x, y }) => ({ x, y }))).toEqual(
      before.map(({ x, y }) => ({ x, y })),
    );
  });

  test("changes only tail objects when object count changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();

    sampleMot(sampler, frames, params, 0);
    const before = sampleMot(sampler, frames, params, 100);
    params.distractorCount = 3;
    const afterAdding = sampleMot(sampler, frames, params, 100);

    expect(afterAdding).toHaveLength(before.length + 1);
    expect(
      afterAdding.slice(0, before.length).map(({ x, y }) => ({ x, y })),
    ).toEqual(before.map(({ x, y }) => ({ x, y })));

    params.distractorCount = 1;
    const afterRemoving = sampleMot(sampler, frames, params, 100);
    expect(afterRemoving).toHaveLength(2);
    expect(afterRemoving.map(({ x, y }) => ({ x, y }))).toEqual(
      before.slice(0, 2).map(({ x, y }) => ({ x, y })),
    );
  });

  test("reaches the same positions across non-grid sampling cadences", () => {
    const finalTravelPx = 2_000;
    const sampleSequence = (samples: readonly number[]) => {
      const sampler = createPatternSampler();
      const frames: TargetFrame[] = [];
      const params = createParams();
      let sample: TargetFrame[] = [];
      for (const travelPx of samples) {
        sample = sampleMot(sampler, frames, params, travelPx);
      }
      return sample;
    };
    const oneTick = sampleSequence([0, finalTravelPx]);
    const steadyTicks = sampleSequence(travelSamples(finalTravelPx, 8.35));

    expect(steadyTicks.map(({ x, y }) => ({ x, y }))).toEqual(
      oneTick.map(({ x, y }) => ({ x, y })),
    );
  });
});

describe("hard-turn sampling", () => {
  const sampleHardTurns = (travelValues: readonly number[]) => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();

    for (const travelPx of travelValues) {
      params.travelPx = travelPx;
      sampler.sampleInto(
        frames,
        "directionChange",
        travelPx / params.speedPxPerSec,
        arena,
        params,
        createRng(9_001),
      );
    }

    return { ...frames[0] };
  };

  test("rebases a fresh path instead of replaying old travel", () => {
    const sampleFirstFrame = (travelPx: number) => {
      const sampler = createPatternSampler();
      const frames: TargetFrame[] = [];
      const params = createParams({ travelPx });
      const count = sampler.sampleInto(
        frames,
        "directionChange",
        travelPx / params.speedPxPerSec,
        arena,
        params,
        createRng(9_001),
      );
      return copyFrames(frames, count)[0];
    };

    const initial = sampleFirstFrame(0);
    const afterLongSession = sampleFirstFrame(1_000_000);

    expect(afterLongSession.x).toBeCloseTo(initial.x, 10);
    expect(afterLongSession.y).toBeCloseTo(initial.y, 10);
  });

  test("reaches the same point across sampling cadences", () => {
    const finalTravelPx = 2_000;
    const oneTick = sampleHardTurns([0, finalTravelPx]);
    const steadyTicks = sampleHardTurns(travelSamples(finalTravelPx, 8.35));

    expect(steadyTicks.x).toBeCloseTo(oneTick.x, 10);
    expect(steadyTicks.y).toBeCloseTo(oneTick.y, 10);
  });

  test("preserves the current point when target bounds change", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 700 });
    const rng = createRng(9_001);

    sampler.sampleInto(frames, "directionChange", 1.4, arena, params, rng);
    const beforeResize = { ...frames[0] };

    params.radiusPx = 55;
    params.pathMarginPx = 63;
    sampler.sampleInto(frames, "directionChange", 1.4, arena, params, rng);
    const afterResize = frames[0];

    expect(afterResize.x).toBeCloseTo(beforeResize.x, 10);
    expect(afterResize.y).toBeCloseTo(beforeResize.y, 10);
  });

  test("keeps the active segment heading while target bounds change", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();
    const rng = createRng(9_001);

    sampler.sampleInto(frames, "directionChange", 0, arena, params, rng);
    let previous = { ...frames[0] };
    let previousHeading: number | null = null;
    let largestHeadingChange = 0;

    for (let index = 1; index <= 30; index += 1) {
      params.travelPx = index * 10;
      params.radiusPx = 30 + index * 2;
      params.pathMarginPx = params.radiusPx + 8;
      sampler.sampleInto(
        frames,
        "directionChange",
        params.travelPx / params.speedPxPerSec,
        arena,
        params,
        rng,
      );
      expect(
        Math.hypot(frames[0].x - previous.x, frames[0].y - previous.y),
      ).toBeCloseTo(10, 8);
      const heading = Math.atan2(
        frames[0].y - previous.y,
        frames[0].x - previous.x,
      );
      if (previousHeading !== null) {
        largestHeadingChange = Math.max(
          largestHeadingChange,
          Math.abs(
            Math.atan2(
              Math.sin(heading - previousHeading),
              Math.cos(heading - previousHeading),
            ),
          ),
        );
      }
      previousHeading = heading;
      previous = { ...frames[0] };
    }

    expect(largestHeadingChange).toBeLessThan(0.2);
  });

  test("matches the unchanged path while resized bounds stay clear", () => {
    const controlSampler = createPatternSampler();
    const resizedSampler = createPatternSampler();
    const controlFrames: TargetFrame[] = [];
    const resizedFrames: TargetFrame[] = [];
    const controlParams = createParams();
    const resizedParams = createParams();
    const radii = [
      35, 45, 60, 70, 65, 50, 40, 55, 70, 60, 45, 35, 50, 65, 70, 55, 40, 35,
      50, 65,
    ];

    for (const travelPx of [0, 700]) {
      controlParams.travelPx = travelPx;
      resizedParams.travelPx = travelPx;
      controlSampler.sampleInto(
        controlFrames,
        "directionChange",
        travelPx / controlParams.speedPxPerSec,
        arena,
        controlParams,
        createRng(9_001),
      );
      resizedSampler.sampleInto(
        resizedFrames,
        "directionChange",
        travelPx / resizedParams.speedPxPerSec,
        arena,
        resizedParams,
        createRng(9_001),
      );
    }

    for (const [index, radiusPx] of radii.entries()) {
      const travelPx = 710 + index * 10;
      controlParams.travelPx = travelPx;
      resizedParams.travelPx = travelPx;
      resizedParams.radiusPx = radiusPx;
      resizedParams.pathMarginPx = radiusPx + 8;
      controlSampler.sampleInto(
        controlFrames,
        "directionChange",
        travelPx / controlParams.speedPxPerSec,
        arena,
        controlParams,
        createRng(9_001),
      );
      resizedSampler.sampleInto(
        resizedFrames,
        "directionChange",
        travelPx / resizedParams.speedPxPerSec,
        arena,
        resizedParams,
        createRng(9_001),
      );

      expect(resizedFrames[0].x).toBeCloseTo(controlFrames[0].x, 10);
      expect(resizedFrames[0].y).toBeCloseTo(controlFrames[0].y, 10);
    }
  });

  test("keeps its active segment through a constraining size scrub", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();
    const mobileArena = { width: 390, height: 700 };
    const rng = createRng(318);
    let previousPoint = { x: 0, y: 0 };

    for (const travelPx of [0, 599, 600]) {
      params.travelPx = travelPx;
      sampler.sampleInto(
        frames,
        "directionChange",
        travelPx / params.speedPxPerSec,
        mobileArena,
        params,
        rng,
      );
      if (travelPx === 599) previousPoint = { ...frames[0] };
    }
    const beforeResize = { ...frames[0] };
    const previousDirection = {
      x: beforeResize.x - previousPoint.x,
      y: beforeResize.y - previousPoint.y,
    };

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(
      frames,
      "directionChange",
      600 / params.speedPxPerSec,
      mobileArena,
      params,
      rng,
    );
    const constrainedPoint = { ...frames[0] };
    expectFrameInsidePatternBounds(constrainedPoint, mobileArena, params);

    for (const radiusPx of [30, 100, 30, 100, 30]) {
      params.radiusPx = radiusPx;
      params.pathMarginPx = radiusPx + 8;
      sampler.sampleInto(
        frames,
        "directionChange",
        600 / params.speedPxPerSec,
        mobileArena,
        params,
        rng,
      );
      expect(frames[0].x).toBeCloseTo(constrainedPoint.x, 10);
      expect(frames[0].y).toBeCloseTo(constrainedPoint.y, 10);
      expectFrameInsidePatternBounds(frames[0], mobileArena, params);
    }

    params.travelPx = 601;
    sampler.sampleInto(
      frames,
      "directionChange",
      601 / params.speedPxPerSec,
      mobileArena,
      params,
      rng,
    );
    const constrainedDirection = {
      x: frames[0].x - constrainedPoint.x,
      y: frames[0].y - constrainedPoint.y,
    };
    expect(
      Math.hypot(constrainedDirection.x, constrainedDirection.y),
    ).toBeCloseTo(1, 10);
    expect(
      Math.abs(
        previousDirection.x * constrainedDirection.y -
          previousDirection.y * constrainedDirection.x,
      ),
    ).toBeLessThan(1e-10);
    expectFrameInsidePatternBounds(frames[0], mobileArena, params);

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(
      frames,
      "directionChange",
      601 / params.speedPxPerSec,
      mobileArena,
      params,
      rng,
    );
    const reconstrainedPoint = { ...frames[0] };
    expectFrameInsidePatternBounds(reconstrainedPoint, mobileArena, params);

    params.travelPx = 602;
    sampler.sampleInto(
      frames,
      "directionChange",
      602 / params.speedPxPerSec,
      mobileArena,
      params,
      rng,
    );
    expect(
      Math.hypot(
        frames[0].x - reconstrainedPoint.x,
        frames[0].y - reconstrainedPoint.y,
      ),
    ).toBeCloseTo(1, 10);
    expectFrameInsidePatternBounds(frames[0], mobileArena, params);
  });

  test("keeps the target visible after the arena itself shrinks", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();
    const rng = createRng(3);

    for (const travelPx of [0, 600]) {
      params.travelPx = travelPx;
      sampler.sampleInto(
        frames,
        "directionChange",
        travelPx / params.speedPxPerSec,
        arena,
        params,
        rng,
      );
    }

    const smallerArena = { width: 390, height: 700 };
    sampler.sampleInto(
      frames,
      "directionChange",
      600 / params.speedPxPerSec,
      smallerArena,
      params,
      rng,
    );

    expectFrameInsidePatternBounds(frames[0], smallerArena, params);
  });

  test("handles collapsed bounds", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({
      radiusPx: 120,
      pathMarginPx: 120,
      travelPx: 10,
    });

    sampler.sampleInto(
      frames,
      "directionChange",
      0,
      { width: 240, height: 240 },
      params,
      createRng(9_001),
    );

    expect(frames[0].x).toBe(120);
    expect(frames[0].y).toBe(120);
  });

  test("resumes without catch-up after bounds temporarily collapse", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams();
    const smallArena = { width: 240, height: 240 };
    const rng = createRng(9_001);

    params.travelPx = 0;
    sampler.sampleInto(frames, "directionChange", 0, smallArena, params, rng);
    params.travelPx = 50;
    sampler.sampleInto(frames, "directionChange", 0.1, smallArena, params, rng);
    const beforeCollapse = { ...frames[0] };

    params.radiusPx = 120;
    params.pathMarginPx = 120;
    params.travelPx = 100;
    sampler.sampleInto(frames, "directionChange", 0.2, smallArena, params, rng);
    expect(frames[0].x).toBe(120);
    expect(frames[0].y).toBe(120);
    const collapsedPoint = { ...frames[0] };
    expect(
      Math.hypot(
        collapsedPoint.x - beforeCollapse.x,
        collapsedPoint.y - beforeCollapse.y,
      ),
    ).toBeGreaterThan(0);

    params.radiusPx = 30;
    params.pathMarginPx = 16;
    params.travelPx = 110;
    sampler.sampleInto(
      frames,
      "directionChange",
      0.22,
      smallArena,
      params,
      rng,
    );
    expect(
      Math.hypot(
        frames[0].x - collapsedPoint.x,
        frames[0].y - collapsedPoint.y,
      ),
    ).toBeCloseTo(10, 8);
  });

  test("resets deterministically when travel rolls back", () => {
    const sampler = createPatternSampler();
    const freshSampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const freshFrames: TargetFrame[] = [];
    const params = createParams();
    const rng = createRng(9_001);

    for (const travelPx of [0, 500, 200]) {
      params.travelPx = travelPx;
      sampler.sampleInto(
        frames,
        "directionChange",
        travelPx / params.speedPxPerSec,
        arena,
        params,
        rng,
      );
    }
    freshSampler.sampleInto(
      freshFrames,
      "directionChange",
      200 / params.speedPxPerSec,
      arena,
      params,
      rng,
    );

    expect(frames[0]).toEqual(freshFrames[0]);
  });

  test("handles non-finite travel", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: Number.POSITIVE_INFINITY });

    sampler.sampleInto(
      frames,
      "directionChange",
      Number.POSITIVE_INFINITY,
      arena,
      params,
      createRng(9_001),
    );

    expect(Number.isFinite(frames[0].x)).toBe(true);
    expect(Number.isFinite(frames[0].y)).toBe(true);
  });
});

describe("pattern geometry changes", () => {
  const additionalGeometryPatternIds = [
    "figureEight",
    "wave",
    "diagonal",
    "downRightSweep",
    "downLeftSweep",
    "perimeterLoop",
    "diamondLoop",
    "clover",
    "zigZag",
    "stairStep",
    "lissajous",
    "hourglass",
    "cornerTour",
  ] as const satisfies readonly PatternId[];

  test("circle keeps its loop phase when target size changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 600 });
    const rng = createRng(9_001);

    sampler.sampleInto(frames, "circle", 1.2, arena, params, rng);
    const phaseBeforeResize = Math.atan2(
      frames[0].y - arena.height / 2,
      frames[0].x - arena.width / 2,
    );

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(frames, "circle", 1.2, arena, params, rng);
    const phaseAfterResize = Math.atan2(
      frames[0].y - arena.height / 2,
      frames[0].x - arena.width / 2,
    );

    expect(
      Math.atan2(
        Math.sin(phaseAfterResize - phaseBeforeResize),
        Math.cos(phaseAfterResize - phaseBeforeResize),
      ),
    ).toBeCloseTo(0, 10);
  });

  test("horizontal sweep keeps its direction and progress when bounds change", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 600 });
    const rng = createRng(9_001);
    const progress = (frame: TargetFrame, margin: number) =>
      (frame.x - margin) / (arena.width - margin * 2);

    sampler.sampleInto(frames, "horizontalSweep", 1.2, arena, params, rng);
    const progressBeforeResize = progress(frames[0], 38);

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(frames, "horizontalSweep", 1.2, arena, params, rng);

    expect(progress(frames[0], 108)).toBeCloseTo(progressBeforeResize, 10);
  });

  test("ellipse keeps its parametric phase when target size changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 600 });
    const rng = createRng(9_001);
    const normalizedPhase = (frame: TargetFrame, margin: number) =>
      Math.atan2(
        (frame.y - arena.height / 2) / (arena.height / 2 - margin),
        (frame.x - arena.width / 2) / (arena.width / 2 - margin),
      );

    sampler.sampleInto(frames, "ellipse", 1.2, arena, params, rng);
    const phaseBeforeResize = normalizedPhase(frames[0], 38);

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(frames, "ellipse", 1.2, arena, params, rng);

    expect(normalizedPhase(frames[0], 108)).toBeCloseTo(phaseBeforeResize, 10);
  });

  test("bounce keeps both axis phases when target size changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 600 });
    const rng = createRng(9_001);
    const normalizedPoint = (frame: TargetFrame, margin: number) => ({
      x: (frame.x - margin) / (arena.width - margin * 2),
      y: (frame.y - margin) / (arena.height - margin * 2),
    });

    sampler.sampleInto(frames, "bounce", 1.2, arena, params, rng);
    const pointBeforeResize = normalizedPoint(frames[0], 38);

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(frames, "bounce", 1.2, arena, params, rng);
    const pointAfterResize = normalizedPoint(frames[0], 108);

    expect(pointAfterResize.x).toBeCloseTo(pointBeforeResize.x, 10);
    expect(pointAfterResize.y).toBeCloseTo(pointBeforeResize.y, 10);
  });

  test("reaction jumps keep their active jump when target size changes", () => {
    const sampler = createPatternSampler();
    const frames: TargetFrame[] = [];
    const params = createParams({ travelPx: 800 });
    const rng = createRng(9_001);
    const largeArena = { width: 2_000, height: 1_600 };
    const normalizedPoint = (frame: TargetFrame, margin: number) => ({
      x: (frame.x - margin) / (largeArena.width - margin * 2),
      y: (frame.y - margin) / (largeArena.height - margin * 2),
    });

    sampler.sampleInto(frames, "teleport", 1.6, largeArena, params, rng);
    const pointBeforeResize = normalizedPoint(frames[0], 38);

    params.radiusPx = 100;
    params.pathMarginPx = 108;
    sampler.sampleInto(frames, "teleport", 1.6, largeArena, params, rng);
    const pointAfterResize = normalizedPoint(frames[0], 108);

    expect(pointAfterResize.x).toBeCloseTo(pointBeforeResize.x, 10);
    expect(pointAfterResize.y).toBeCloseTo(pointBeforeResize.y, 10);
  });

  for (const patternId of additionalGeometryPatternIds) {
    test(`${patternId} keeps its normalized path position when target size changes`, () => {
      const sampler = createPatternSampler();
      const frames: TargetFrame[] = [];
      const params = createParams({ travelPx: 600 });
      const rng = createRng(9_001);
      const normalizedPoint = (frame: TargetFrame, margin: number) => ({
        x: (frame.x - margin) / (arena.width - margin * 2),
        y: (frame.y - margin) / (arena.height - margin * 2),
      });

      sampler.sampleInto(frames, patternId, 1.2, arena, params, rng);
      const pointBeforeResize = normalizedPoint(frames[0], 38);

      params.radiusPx = 100;
      params.pathMarginPx = 108;
      sampler.sampleInto(frames, patternId, 1.2, arena, params, rng);
      const pointAfterResize = normalizedPoint(frames[0], 108);

      expect(pointAfterResize.x).toBeCloseTo(pointBeforeResize.x, 10);
      expect(pointAfterResize.y).toBeCloseTo(pointBeforeResize.y, 10);
    });
  }
});

describe("pattern invariants", () => {
  const patternIds = [
    "circle",
    "ellipse",
    "figureEight",
    "wave",
    "diagonal",
    "bounce",
    "randomWalk",
    "directionChange",
    "teleport",
    "horizontalSweep",
    "verticalSweep",
    "downRightSweep",
    "downLeftSweep",
    "perimeterLoop",
    "diamondLoop",
    "clover",
    "zigZag",
    "stairStep",
    "lissajous",
    "hourglass",
    "cornerTour",
    "multipleObjectTracking",
  ] as const satisfies readonly PatternId[];

  for (const id of patternIds) {
    test(`${id} stays deterministic, finite, and in bounds`, () => {
      const firstSampler = createPatternSampler();
      const secondSampler = createPatternSampler();
      const firstFrames: TargetFrame[] = [];
      const secondFrames: TargetFrame[] = [];
      const firstRng = createRng(9_001);
      const secondRng = createRng(9_001);
      const firstParams = createParams();
      const secondParams = createParams();

      for (const travelPx of [0, 5, 250, 700]) {
        firstParams.travelPx = travelPx;
        secondParams.travelPx = travelPx;
        const elapsedSec = travelPx / firstParams.speedPxPerSec;
        const firstCount = firstSampler.sampleInto(
          firstFrames,
          id,
          elapsedSec,
          arena,
          firstParams,
          firstRng,
        );
        const secondCount = secondSampler.sampleInto(
          secondFrames,
          id,
          elapsedSec,
          arena,
          secondParams,
          secondRng,
        );
        const firstSample = copyFrames(firstFrames, firstCount);

        expect(firstSample).toEqual(copyFrames(secondFrames, secondCount));
        expect(firstSample.length).toBeGreaterThan(0);

        for (const frame of firstSample) {
          expect(Number.isFinite(frame.x)).toBe(true);
          expect(Number.isFinite(frame.y)).toBe(true);
          expect(Number.isFinite(frame.radiusPx)).toBe(true);
          expect(Number.isFinite(frame.alpha)).toBe(true);
          expect(frame.x).toBeGreaterThanOrEqual(0);
          expect(frame.x).toBeLessThanOrEqual(arena.width);
          expect(frame.y).toBeGreaterThanOrEqual(0);
          expect(frame.y).toBeLessThanOrEqual(arena.height);
        }
      }
    });
  }

  test("all patterns keep finite centers inside collapsed arenas", () => {
    const collapsedArenas = [
      { width: 1, height: 1 },
      { width: 1, height: 100 },
      { width: 100, height: 1 },
    ];

    for (const id of patternIds) {
      for (const tinyArena of collapsedArenas) {
        const sampler = createPatternSampler();
        const frames: TargetFrame[] = [];
        const params = createParams();

        for (const travelPx of [0, 5, 250, 700]) {
          params.travelPx = travelPx;
          const count = sampler.sampleInto(
            frames,
            id,
            travelPx / params.speedPxPerSec,
            tinyArena,
            params,
            createRng(9_001),
          );

          for (const frame of copyFrames(frames, count)) {
            expect(Number.isFinite(frame.x)).toBe(true);
            expect(Number.isFinite(frame.y)).toBe(true);
            expect(frame.x).toBeGreaterThanOrEqual(0);
            expect(frame.x).toBeLessThanOrEqual(tinyArena.width);
            expect(frame.y).toBeGreaterThanOrEqual(0);
            expect(frame.y).toBeLessThanOrEqual(tinyArena.height);
          }
        }
      }
    }
  });
});

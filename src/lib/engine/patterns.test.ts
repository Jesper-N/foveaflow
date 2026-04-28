import { describe, expect, test } from "bun:test";

import { samplePattern } from "./patterns";
import { createRng } from "./random";
import type { Arena, PatternParams } from "./types";

const arena: Arena = { width: 800, height: 600 };

const baseParams: PatternParams = {
  radiusPx: 20,
  pathMarginPx: 16,
  speedPxPerSec: 120,
  travelPx: 480,
  colorA: "#76d900",
  colorB: "#3ddbd9",
};

describe("samplePattern", () => {
  test("samples multiple-object tracking roles and count", () => {
    const frames = samplePattern(
      "multipleObjectTracking",
      4,
      arena,
      {
        ...baseParams,
        targetCount: 2,
        distractorCount: 3,
      },
      createRng(1234),
    );

    expect(frames).toHaveLength(5);
    expect(frames.filter((frame) => frame.role === "target")).toHaveLength(2);
    expect(frames.filter((frame) => frame.role === "distractor")).toHaveLength(
      3,
    );
  });

  test("keeps sampled frames inside the arena", () => {
    const frames = samplePattern(
      "clover",
      3,
      arena,
      baseParams,
      createRng(1234),
    );

    expect(frames).toHaveLength(1);
    expect(frames[0].x).toBeGreaterThanOrEqual(0);
    expect(frames[0].x).toBeLessThanOrEqual(arena.width);
    expect(frames[0].y).toBeGreaterThanOrEqual(0);
    expect(frames[0].y).toBeLessThanOrEqual(arena.height);
  });

  test("samples cached curves deterministically", () => {
    const first = samplePattern("wave", 2, arena, baseParams, createRng(1234));
    const second = samplePattern("wave", 2, arena, baseParams, createRng(1234));

    expect(second).toEqual(first);
  });
});

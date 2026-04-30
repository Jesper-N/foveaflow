import { describe, expect, test } from "bun:test";

import { resolveCanvasScale } from "./canvas";

describe("resolveCanvasScale", () => {
  test("keeps device pixel ratio when canvas stays under the pixel budget", () => {
    expect(resolveCanvasScale(800, 600, 2, 6_000_000)).toBe(2);
  });

  test("reduces scale when device pixel ratio would exceed the pixel budget", () => {
    const scale = resolveCanvasScale(2560, 1440, 2.5, 6_000_000);

    expect(scale).toBeCloseTo(Math.sqrt(6_000_000 / (2560 * 1440)), 8);
    expect(
      Math.round(2560 * scale) * Math.round(1440 * scale),
    ).toBeLessThanOrEqual(6_100_000);
  });

  test("guards invalid sizes and ratios", () => {
    expect(resolveCanvasScale(0, 600, 2, 6_000_000)).toBe(1);
    expect(resolveCanvasScale(800, 600, 0, 6_000_000)).toBe(1);
  });
});

import { expect, test } from "bun:test";

import {
  createPatternPathCacheState,
  sampleClosedCurve,
  sampleClosedPolyline,
} from "../../src/lib/engine/pattern-paths";

const ellipsePoint = (phase: number): [number, number] => [
  Math.cos(phase * Math.PI * 2) * 500,
  Math.sin(phase * Math.PI * 2) * 300,
];

test("curve lookup preserves arc-length positions over forward and reverse laps", () => {
  const samples = 180;
  const points = Array.from({ length: samples + 1 }, (_, index) =>
    ellipsePoint(index / samples)
  );
  const lengths = points
    .slice(1)
    .map((point, index) =>
      Math.hypot(point[0] - points[index][0], point[1] - points[index][1])
    );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const state = createPatternPathCacheState();

  for (let step = -1000; step <= 1000; step += 1) {
    const travel = step * 13.7;
    let remaining = ((travel % total) + total) % total;
    let segment = 0;
    while (remaining > lengths[segment]) {
      remaining -= lengths[segment];
      segment += 1;
    }
    const progress = remaining / lengths[segment];
    const actual = sampleClosedCurve(
      state,
      "ellipse:fixed",
      travel,
      samples,
      ellipsePoint
    );
    for (const axis of [0, 1]) {
      const start = points[segment][axis];
      const end = points[segment + 1][axis];
      expect(actual[axis]).toBeCloseTo(start + (end - start) * progress, 8);
    }
  }
});

test("polyline lookup handles corners, repeated points, reverse motion and empty paths", () => {
  const points: [number, number][] = [
    [0, 0],
    [10, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];
  const state = createPatternPathCacheState();
  for (const [travel, expected] of [
    [0, [0, 0]],
    [10, [10, 0]],
    [15, [10, 5]],
    [40, [0, 0]],
    [-5, [0, 5]],
  ] satisfies [number, [number, number]][]) {
    expect(
      sampleClosedPolyline(
        state,
        "rectangle:fixed",
        travel,
        points.length,
        (index) => points[index]
      )
    ).toEqual(expected);
  }
  expect(
    sampleClosedPolyline(state, "empty:fixed", 10, 0, () => [0, 0])
  ).toEqual([0, 0]);
});

const rectangle = (size: number): [number, number][] => [
  [0, 0],
  [size, 0],
  [size, size],
  [0, size],
];

test("changing path geometry preserves progress along the current edge", () => {
  const state = createPatternPathCacheState();
  const first = rectangle(10);
  sampleClosedPolyline(state, "rectangle:10", 15, 4, (index) => first[index]);
  const second = rectangle(20);
  expect(
    sampleClosedPolyline(state, "rectangle:20", 15, 4, (index) => second[index])
  ).toEqual([20, 10]);
});

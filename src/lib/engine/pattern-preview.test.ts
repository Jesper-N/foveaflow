import { describe, expect, test } from "bun:test";

import {
  getPatternPreviewPath,
  previewablePatternIds,
} from "./pattern-preview";

describe("getPatternPreviewPath", () => {
  test("builds finite SVG path data for each pursuit pattern", () => {
    const paths = previewablePatternIds.map((patternId) =>
      getPatternPreviewPath(patternId),
    );

    expect(paths).toHaveLength(previewablePatternIds.length);
    expect(paths.every((path) => path.startsWith("M"))).toBe(true);
    expect(paths.every((path) => path.includes("L"))).toBe(true);
    expect(
      paths.every((path) => {
        const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        return values.length > 0 && values.every(Number.isFinite);
      }),
    ).toBe(true);
  });
});

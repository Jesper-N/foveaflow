import { describe, expect, test } from "bun:test";

import { isFlashSequenceSafe } from "./safety";

describe("isFlashSequenceSafe", () => {
  test("allows up to three flashes in any rolling second", () => {
    expect(isFlashSequenceSafe([0, 250, 500])).toBe(true);
    expect(isFlashSequenceSafe([0, 250, 500, 1000])).toBe(true);
  });

  test("rejects four flashes inside one rolling second", () => {
    expect(isFlashSequenceSafe([0, 250, 500, 999])).toBe(false);
  });

  test("handles unsorted flash times", () => {
    expect(isFlashSequenceSafe([500, 0, 999, 250])).toBe(false);
  });
});

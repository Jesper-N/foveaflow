import { expect, test } from "bun:test";

import { trainerShortcuts } from "../../src/lib/components/trainer/shortcuts";

test("every shortcut has its own keys", () => {
  const keys = trainerShortcuts.map((shortcut) => shortcut.keys);
  expect(new Set(keys).size).toBe(keys.length);
});

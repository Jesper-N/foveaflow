import { expect, test } from "bun:test";

import { trainerShortcuts } from "../../src/lib/components/trainer/shortcuts";

test("every shortcut has its own keys", () => {
  const keys = trainerShortcuts.map((shortcut) => shortcut.keys);
  expect(new Set(keys).size).toBe(keys.length);
});

test("only size and speed repeat while a key is held", () => {
  expect(
    trainerShortcuts
      .filter((shortcut) => "repeat" in shortcut && shortcut.repeat)
      .map((shortcut) => shortcut.action)
      .toSorted()
  ).toEqual(["growTarget", "shrinkTarget", "slowDown", "speedUp"]);
});

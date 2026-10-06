import { expect, test } from "bun:test";

import { getShortcutAction } from "../../src/lib/components/trainer/shortcuts";

const press = (key: string, modifiers: Partial<KeyboardEvent> = {}) =>
  getShortcutAction({
    altKey: false,
    ctrlKey: false,
    defaultPrevented: false,
    isComposing: false,
    key,
    metaKey: false,
    repeat: false,
    ...modifiers,
  });

test("keys map to actions, ignoring letter case", () => {
  expect(press(" ")).toBe("togglePause");
  expect(press("S")).toBe("openControls");
  expect(press("ArrowRight")).toBe("speedUp");
  expect(press("x")).toBeNull();
});

test("only size and speed repeat while a key is held", () => {
  expect(press("ArrowUp", { repeat: true })).toBe("growTarget");
  expect(press("g", { repeat: true })).toBeNull();
});

test("browser and system shortcuts are left alone", () => {
  expect(press("s", { metaKey: true })).toBeNull();
  expect(press("d", { ctrlKey: true })).toBeNull();
  expect(press("g", { defaultPrevented: true })).toBeNull();
  expect(press("g", { isComposing: true })).toBeNull();
});

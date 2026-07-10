import { describe, expect, test } from "bun:test";

import {
  createBehaviorProfiles,
  getBehaviorId,
  isBehaviorId,
} from "../src/lib/trainer/behavior";
import { runTrainerShortcutAction } from "../src/lib/trainer/shortcut-runner";
import {
  getTrainerShortcutAction,
  type TrainerShortcutAction,
  type TrainerShortcutEvent,
} from "../src/lib/trainer/keyboard";

const createShortcutHandlers = (calls: string[]) => ({
  hasPriorityKeyboardSurface: () => false,
  toggleMotionPaused: () => calls.push("toggleMotionPaused"),
  adjustTargetSize: (deltaPx: number) => calls.push(`targetSize:${deltaPx}`),
  adjustSpeed: (delta: number) => calls.push(`speed:${delta}`),
});

const createShortcutEvent = (
  key: string,
  overrides: Partial<TrainerShortcutEvent> = {},
): TrainerShortcutEvent => ({
  altKey: false,
  ctrlKey: false,
  defaultPrevented: false,
  isComposing: false,
  key,
  metaKey: false,
  repeat: false,
  ...overrides,
});

describe("behavior profiles", () => {
  test("validates behavior ids", () => {
    expect(isBehaviorId("constant")).toBe(true);
    expect(isBehaviorId("missing")).toBe(false);
  });

  test("returns fresh profile copies", () => {
    const profiles = createBehaviorProfiles("surgePattern");
    if (profiles.speedProfile.kind !== "steps") {
      throw new Error("Expected surgePattern to use a steps speed profile");
    }

    profiles.speedProfile.multipliers.push(99);

    const freshProfiles = createBehaviorProfiles("surgePattern");
    if (freshProfiles.speedProfile.kind !== "steps") {
      throw new Error("Expected surgePattern to use a steps speed profile");
    }

    expect(freshProfiles.speedProfile.multipliers).not.toContain(99);
    expect(
      getBehaviorId(freshProfiles.speedProfile, freshProfiles.sizeProfile),
    ).toBe("surgePattern");
  });
});

describe("shortcut runner", () => {
  test.each([
    ["toggleMotion", "toggleMotionPaused"],
    ["increaseTargetSize", "targetSize:1"],
    ["decreaseTargetSize", "targetSize:-1"],
    ["increaseSpeed", "speed:1"],
    ["decreaseSpeed", "speed:-1"],
  ] as const satisfies readonly [TrainerShortcutAction, string][])(
    "dispatches %s",
    (action, expectedCall) => {
      const calls: string[] = [];

      expect(
        runTrainerShortcutAction(action, createShortcutHandlers(calls)),
      ).toBe(true);
      expect(calls).toEqual([expectedCall]);
    },
  );

  test("does not run shortcuts over priority surfaces", () => {
    const calls: string[] = [];

    expect(
      runTrainerShortcutAction("toggleMotion", {
        ...createShortcutHandlers(calls),
        hasPriorityKeyboardSurface: () => true,
      }),
    ).toBe(false);
    expect(calls).toEqual([]);
  });

  test("does not reserve bare letter keys", () => {
    for (const key of ["d", "p", "m", "s", "g"]) {
      expect(getTrainerShortcutAction(createShortcutEvent(key))).toBeNull();
    }
  });
});

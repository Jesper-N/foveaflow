import { describe, expect, test } from "bun:test";

import {
  createBehaviorProfiles,
  getBehaviorId,
  isBehaviorId,
} from "../src/lib/trainer/behavior";
import {
  getHeaderSelectOpenState,
  runTrainerShortcutAction,
} from "../src/lib/trainer/shortcut-runner";
import type { TrainerShortcutAction } from "../src/lib/trainer/keyboard";

const createShortcutHandlers = (calls: string[]) => ({
  hasPriorityKeyboardSurface: () => false,
  toggleMotionPaused: () => calls.push("toggleMotionPaused"),
  adjustTargetSize: (deltaPx: number) => calls.push(`targetSize:${deltaPx}`),
  adjustSpeed: (delta: number) => calls.push(`speed:${delta}`),
  toggleTheme: () => calls.push("toggleTheme"),
  canOpenPatternSelect: () => true,
  openHeaderSelect: (select: "mode" | "pattern") =>
    calls.push(`header:${select}`),
  openControlsPanel: () => calls.push("controls"),
  openGuideDialog: () => {
    calls.push("guide");
    return true;
  },
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
    ["toggleTheme", "toggleTheme"],
    ["openPatternSelect", "header:pattern"],
    ["openModeSelect", "header:mode"],
    ["openSettingsDialog", "controls"],
    ["openGuideDialog", "guide"],
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

  test("blocks pattern select outside pursuit mode", () => {
    const calls: string[] = [];

    expect(
      runTrainerShortcutAction("openPatternSelect", {
        ...createShortcutHandlers(calls),
        canOpenPatternSelect: () => false,
      }),
    ).toBe(false);
    expect(calls).toEqual([]);
  });

  test("opens only the shortcut target select", () => {
    expect(getHeaderSelectOpenState("mode", false)).toEqual({
      mobilePresetSelectOpen: true,
      desktopPresetSelectOpen: false,
      mobilePatternSelectOpen: false,
      desktopPatternSelectOpen: false,
      mobileLilacChaserColorSelectOpen: false,
      desktopLilacChaserColorSelectOpen: false,
    });

    expect(getHeaderSelectOpenState("pattern", true)).toEqual({
      mobilePresetSelectOpen: false,
      desktopPresetSelectOpen: false,
      mobilePatternSelectOpen: false,
      desktopPatternSelectOpen: true,
      mobileLilacChaserColorSelectOpen: false,
      desktopLilacChaserColorSelectOpen: false,
    });
  });
});

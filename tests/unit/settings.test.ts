import { describe, expect, test } from "bun:test";

import {
  behaviorFromProfiles,
  behaviors,
  profilesForBehavior,
} from "../../src/lib/trainer/settings/behaviors";
import { safeStimulusColor } from "../../src/lib/trainer/settings/colors";
import { getDrill } from "../../src/lib/trainer/settings/drills";
import {
  predictablePatterns,
  pursuitPatterns,
  unpredictablePatterns,
} from "../../src/lib/trainer/settings/patterns";
import {
  clampSetting,
  createDefaultSettings,
  resetToDefaults,
  withDrill,
  withPattern,
} from "../../src/lib/trainer/settings/settings";

describe("settings", () => {
  test("values are clamped, and whole-number settings rounded", () => {
    expect(clampSetting("speed", 140.4)).toBe(100);
    expect(clampSetting("speed", 20.6)).toBe(21);
    expect(clampSetting("targetOpacity", 0.333)).toBe(0.333);
    expect(clampSetting("distractorCount", -2)).toBe(0);
  });

  test("switching drill picks the drill's path and keeps other choices", () => {
    const settings = { ...createDefaultSettings(), speed: 55 };
    expect(withDrill(settings, "reactionTime")).toMatchObject({
      drillId: "reactionTime",
      patternId: "teleport",
      speed: 55,
    });
  });

  test("entering Multiple Distractions restores its distractors", () => {
    const pursuit = { ...createDefaultSettings(), distractorCount: 3 };
    expect(withDrill(pursuit, "mot").distractorCount).toBe(10);

    const distractions = {
      ...createDefaultSettings(getDrill("mot")),
      distractorCount: 3,
    };
    expect(withDrill(distractions, "mot").distractorCount).toBe(3);
  });

  test("a path that cannot reverse always runs forward", () => {
    const reversed = {
      ...createDefaultSettings(),
      motionDirection: -1 as const,
      patternId: "circle" as const,
    };
    expect(withPattern(reversed, "ellipse").motionDirection).toBe(-1);
    expect(withPattern(reversed, "randomWalk").motionDirection).toBe(1);
  });

  test("reset restores the drill's defaults but keeps the path", () => {
    const settings = {
      ...createDefaultSettings(),
      baseRadiusPx: 80,
      patternId: "wave" as const,
    };
    expect(resetToDefaults(settings)).toMatchObject({
      baseRadiusPx: 40,
      patternId: "wave",
    });
  });
});

describe("catalogs", () => {
  // The Motion feel menu shows the behavior worked out from saved profiles.
  test.each(behaviors.map(({ id }) => id))(
    "the %s behavior is recognized from its own profiles",
    (id) => {
      const { speedProfile, sizeProfile } = profilesForBehavior(id);
      expect(behaviorFromProfiles(speedProfile, sizeProfile)).toBe(id);
    }
  );

  test("every Smooth Pursuit path is in exactly one menu group", () => {
    const grouped = [...predictablePatterns, ...unpredictablePatterns].map(
      ({ id }) => id
    );
    expect(grouped.toSorted()).toEqual(
      pursuitPatterns.map(({ id }) => id).toSorted()
    );
  });

  test("saturated red is swapped for amber", () => {
    expect(safeStimulusColor("#f81010")).toBe("#ffb020");
    expect(safeStimulusColor("#e01010")).toBe("#e01010");
  });
});

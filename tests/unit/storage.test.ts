import { beforeEach, expect, test } from "bun:test";

import { profilesForBehavior } from "../../src/lib/trainer/settings/behaviors";
import { getDrill } from "../../src/lib/trainer/settings/drills";
import { createDefaultSettings } from "../../src/lib/trainer/settings/settings";
import {
  SettingsSaver,
  loadSettings,
} from "../../src/lib/trainer/settings/storage";

const SETTINGS_KEY = "foveaflow.settings.v3";
const LEGACY_SETTINGS_KEY = "foveaflow.settings.v2";

const storage = new Map<string, string>();
globalThis.localStorage = {
  clear: () => storage.clear(),
  getItem: (key) => storage.get(key) ?? null,
  key: (index) => [...storage.keys()][index] ?? null,
  get length() {
    return storage.size;
  },
  removeItem: (key) => {
    storage.delete(key);
  },
  setItem: (key, value) => {
    storage.set(key, value);
  },
};

/** Stores raw JSON, as an older version or a hand edit would have it, then loads it. */
const loadFrom = (key: string, json: string) => {
  storage.set(key, json);
  return loadSettings();
};

beforeEach(() => {
  storage.clear();
});

test("nothing saved, or a broken save, loads nothing", () => {
  expect(loadSettings()).toBeNull();
  expect(loadFrom(SETTINGS_KEY, "{")).toBeNull();
});

test("saving writes after a pause and loads back the same settings", () => {
  const settings = {
    ...createDefaultSettings(getDrill("mot")),
    ballColor: "#2488cc",
    speed: 35,
  };
  const saver = new SettingsSaver();
  saver.schedule(settings);
  expect(storage.has(SETTINGS_KEY)).toBe(false);
  saver.flush();
  expect(loadSettings()).toEqual(settings);
});

// Old saves name the drill `presetId`. Renaming it would reset every drill.
test("saves keep the stored drill field name", () => {
  const saver = new SettingsSaver();
  saver.schedule(createDefaultSettings(getDrill("mot")));
  saver.flush();
  const saved = JSON.parse(storage.get(SETTINGS_KEY) ?? "{}");
  expect(saved.presetId).toBe("mot");
  expect(saved).not.toHaveProperty("drillId");
});

test.each([
  [{ unit: "deg/s", value: 29.6 }, 30],
  [{ unit: "cm/s", value: 20 }, 19],
  [{ unit: "screen/s", value: 0.5 }, 20],
])("a legacy speed of %o loads as %d", (speed, expected) => {
  expect(loadFrom(SETTINGS_KEY, JSON.stringify({ speed }))?.speed).toBe(
    expected
  );
});

test("version 2 drops its old default color so the theme color applies", () => {
  expect(
    loadFrom(LEGACY_SETTINGS_KEY, JSON.stringify({ ballColor: "#76D900" }))
      ?.ballColor
  ).toBeNull();
  expect(
    loadFrom(LEGACY_SETTINGS_KEY, JSON.stringify({ ballColor: "#2488cc" }))
      ?.ballColor
  ).toBe("#2488cc");
});

test("saving replaces a version 2 save", () => {
  storage.set(LEGACY_SETTINGS_KEY, "{}");
  const saver = new SettingsSaver();
  saver.schedule(createDefaultSettings());
  saver.flush();
  expect(storage.has(LEGACY_SETTINGS_KEY)).toBe(false);
});

test("invalid values fall back one by one", () => {
  expect(
    loadFrom(
      SETTINGS_KEY,
      JSON.stringify({
        baseRadiusPx: 500,
        letterColor: "red",
        letterWeight: 650,
        lilacChaserBallColor: "#123456",
        patternId: "multipleObjectTracking",
        presetId: "retired-drill",
        speed: 35,
        targetForm: "hexagon",
      })
    )
  ).toMatchObject({
    baseRadiusPx: 100,
    drillId: "pursuit",
    letterColor: "#000000",
    letterWeight: 600,
    lilacChaserBallColor: "#ff00fe",
    patternId: "randomWalk",
    speed: 35,
    targetForm: "circle",
  });
});

test("a field of the wrong type discards the whole save", () => {
  expect(
    loadFrom(SETTINGS_KEY, JSON.stringify({ showTrail: "yes" }))
  ).toBeNull();
});

test("only Smooth Pursuit keeps a saved path", () => {
  expect(
    loadFrom(
      SETTINGS_KEY,
      JSON.stringify({ patternId: "clover", presetId: "pursuit" })
    )
  ).toMatchObject({ drillId: "pursuit", patternId: "clover" });
  expect(
    loadFrom(
      SETTINGS_KEY,
      JSON.stringify({ patternId: "clover", presetId: "lilacChaser" })
    )
  ).toMatchObject({ drillId: "lilacChaser", patternId: "circle" });
});

test("a saved saturated red loads as amber", () => {
  expect(
    loadFrom(SETTINGS_KEY, JSON.stringify({ ballColor: "#ff0000" }))?.ballColor
  ).toBe("#ffb020");
});

test("a size pulse always runs at a steady speed", () => {
  const settings = loadFrom(
    SETTINGS_KEY,
    JSON.stringify({
      ...profilesForBehavior("sizePulse"),
      speedProfile: profilesForBehavior("wavePattern").speedProfile,
    })
  );
  expect(settings?.speedProfile).toEqual({ kind: "constant" });
});

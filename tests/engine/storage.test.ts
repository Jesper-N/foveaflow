import { afterEach, expect, test } from "bun:test";

import { DEFAULT_CALIBRATION } from "../../src/lib/engine/calibration";
import {
  exercisePresets,
  settingsFromPreset,
} from "../../src/lib/engine/presets";
import type { SpeedProfile } from "../../src/lib/engine/profiles";
import { loadSettings } from "../../src/lib/engine/storage";
import type { StoredSettings } from "../../src/lib/engine/storage";

const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage"
);

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

const loadStoredValue = (value: string) => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => value },
  });
  return loadSettings();
};

test("all preset settings survive storage validation", () => {
  for (const preset of exercisePresets) {
    const settings = settingsFromPreset(preset, DEFAULT_CALIBRATION);
    expect(loadStoredValue(JSON.stringify(settings))).toEqual(settings);
  }
  expect(loadStoredValue('{"baseRadiusPx":30,"unknown":true}')).toEqual({
    baseRadiusPx: 30,
  });
  expect(loadStoredValue("{}")).toEqual({});
});

test("storage rejects malformed values and invalid profile constraints", () => {
  const invalidValues = [
    "{",
    "null",
    "[]",
    '{"baseRadiusPx":"30"}',
    '{"motionDirection":0}',
    '{"calibration":{}}',
    '{"speed":{"unit":"mph","value":1}}',
    '{"speedProfile":{"kind":"unknown"}}',
    '{"speedProfile":{"kind":"sine","minMultiplier":2,"maxMultiplier":1,"periodSec":2}}',
    '{"speedProfile":{"kind":"sine","minMultiplier":0,"maxMultiplier":5,"periodSec":2}}',
    '{"speedProfile":{"kind":"sine","minMultiplier":0,"maxMultiplier":1,"periodSec":0}}',
    '{"speedProfile":{"kind":"steps","multipliers":[],"intervalSec":1,"transitionSec":0}}',
    '{"speedProfile":{"kind":"steps","multipliers":[1],"intervalSec":1,"transitionSec":-1}}',
    '{"sizeProfile":{"kind":"pulse","minMultiplier":2,"maxMultiplier":1,"periodSec":2}}',
    JSON.stringify({
      speedProfile: {
        intervalSec: 1,
        kind: "steps",
        multipliers: Array.from({ length: 33 }, () => 1),
        transitionSec: 0,
      },
    }),
  ];
  for (const value of invalidValues) {
    expect(loadStoredValue(value)).toBeNull();
  }
});

test("storage accepts valid nonconstant profiles and their boundary values", () => {
  for (const speedProfile of [
    { kind: "sine", maxMultiplier: 4, minMultiplier: 0, periodSec: 1 },
    { intervalSec: 1, kind: "steps", multipliers: [0, 4], transitionSec: 0 },
    {
      fromMultiplier: 0,
      kind: "loopRamp",
      periodSec: 1,
      resetSec: 0,
      toMultiplier: 4,
    },
  ] satisfies SpeedProfile[]) {
    const settings = {
      sizeProfile: {
        kind: "pulse",
        maxMultiplier: 4,
        minMultiplier: 0,
        periodSec: 1,
      },
      speedProfile,
    } satisfies StoredSettings;
    expect(loadStoredValue(JSON.stringify(settings))).toEqual(settings);
  }
});

test("blocked storage remains safe", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("Storage blocked");
    },
  });
  expect(loadSettings()).toBeNull();
});

import { describe, expect, test } from "bun:test";

import type { TrainerSettings } from "./presets";
import { createDebouncedSettingsSaver } from "./storage";

describe("createDebouncedSettingsSaver", () => {
  test("coalesces rapid settings saves into the latest write", () => {
    const callbacks = new Map<number, () => void>();
    const cleared: number[] = [];
    const saved: TrainerSettings[] = [];
    let nextTimerId = 1;

    const timers = {
      setTimeout: (callback: () => void) => {
        const timerId = nextTimerId;
        nextTimerId += 1;
        callbacks.set(timerId, callback);
        return timerId;
      },
      clearTimeout: (timerId: number) => {
        cleared.push(timerId);
        callbacks.delete(timerId);
      },
    };

    const saver = createDebouncedSettingsSaver(
      (settings) => saved.push(settings),
      250,
      timers,
    );
    const firstSettings = { presetId: "pursuit" } as TrainerSettings;
    const latestSettings = { presetId: "mot" } as TrainerSettings;

    saver.schedule(firstSettings);
    saver.schedule(latestSettings);

    expect(cleared).toEqual([1]);
    callbacks.get(2)?.();
    expect(saved).toEqual([latestSettings]);
  });
});

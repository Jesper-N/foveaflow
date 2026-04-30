import type { TrainerSettings } from "./presets";

const SETTINGS_KEY = "eye-trainer.settings.v2";

export type StoredSettings = Partial<TrainerSettings>;

type TimerApi<TimerId> = {
  setTimeout: (callback: () => void, delayMs: number) => TimerId;
  clearTimeout: (timerId: TimerId) => void;
};

const hasBrowserStorage = () =>
  typeof window !== "undefined" && "localStorage" in window;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseJson = (value: string | null): StoredSettings | null => {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? (parsed as StoredSettings) : null;
  } catch {
    return null;
  }
};

export const loadSettings = () => {
  if (!hasBrowserStorage()) return null;
  try {
    return parseJson(window.localStorage.getItem(SETTINGS_KEY));
  } catch {
    return null;
  }
};

export const saveSettings = (settings: TrainerSettings) => {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable or full. Training must keep running.
  }
};

const defaultTimers: TimerApi<ReturnType<typeof setTimeout>> = {
  setTimeout: (callback, timeoutDelayMs) =>
    globalThis.setTimeout(callback, timeoutDelayMs),
  clearTimeout: (timerId) => globalThis.clearTimeout(timerId),
};

export const createDebouncedSettingsSaver = <
  TimerId = ReturnType<typeof setTimeout>,
>(
  persist: (settings: TrainerSettings) => void = saveSettings,
  delayMs = 250,
  timers: TimerApi<TimerId> = defaultTimers as unknown as TimerApi<TimerId>,
) => {
  let timeout: TimerId | undefined;
  let latestSettings: TrainerSettings | undefined;

  const clearPendingTimeout = () => {
    if (timeout === undefined) return;
    timers.clearTimeout(timeout);
    timeout = undefined;
  };

  const flush = () => {
    clearPendingTimeout();
    if (!latestSettings) return;

    const settings = latestSettings;
    latestSettings = undefined;
    persist(settings);
  };

  return {
    schedule(settings: TrainerSettings) {
      latestSettings = settings;
      clearPendingTimeout();
      timeout = timers.setTimeout(flush, delayMs);
    },
    flush,
    cancel() {
      clearPendingTimeout();
      latestSettings = undefined;
    },
  };
};

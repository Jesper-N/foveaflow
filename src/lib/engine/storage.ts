import type { TrainerSettings } from "./presets";

const SETTINGS_KEY = "foveaflow.settings.v2";

export type StoredSettings = Record<string, unknown>;

type TimerId = ReturnType<typeof setTimeout>;

const hasBrowserStorage = () =>
  typeof window !== "undefined" && "localStorage" in window;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseJson = (value: string | null): StoredSettings | null => {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
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
    return;
  }
};

export const createDebouncedSettingsSaver = (
  persist: (settings: TrainerSettings) => void = saveSettings,
  delayMs = 250,
) => {
  let timeout: TimerId | undefined;
  let latestSettings: TrainerSettings | undefined;

  const clearPendingTimeout = () => {
    if (timeout === undefined) return;
    globalThis.clearTimeout(timeout);
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
      timeout = globalThis.setTimeout(flush, delayMs);
    },
    flush,
    cancel() {
      clearPendingTimeout();
      latestSettings = undefined;
    },
  };
};

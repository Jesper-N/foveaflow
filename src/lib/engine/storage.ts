import type { TrainerSettings } from "./presets";

const SETTINGS_KEY = "eye-trainer.settings.v2";

export type StoredSettings = Partial<TrainerSettings>;

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

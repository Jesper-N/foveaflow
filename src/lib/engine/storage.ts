import type { TrainerSettings } from "./presets";

const SETTINGS_KEY = "eye-trainer.settings.v2";

const hasBrowserStorage = () =>
  typeof window !== "undefined" && "localStorage" in window;

const parseJson = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const loadSettings = () => {
  if (!hasBrowserStorage()) return null;
  return parseJson<TrainerSettings>(window.localStorage.getItem(SETTINGS_KEY));
};

export const saveSettings = (settings: TrainerSettings) => {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

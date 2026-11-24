import { setMode } from "mode-watcher";

export const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const;

type ThemeChoice = (typeof themeOptions)[number]["value"];

const isThemeChoice = (value: string): value is ThemeChoice =>
  themeOptions.some((option) => option.value === value);

/** Applies a theme picked in a menu. Ignores anything that is not a theme. */
export const selectTheme = (value: string) => {
  if (isThemeChoice(value)) {
    setMode(value);
  }
};

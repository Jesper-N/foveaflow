import MonitorIcon from "@lucide/svelte/icons/monitor";
import MoonIcon from "@lucide/svelte/icons/moon";
import SunIcon from "@lucide/svelte/icons/sun";
import { setMode } from "mode-watcher";

export const themeOptions = [
  { icon: SunIcon, label: "Light", value: "light" },
  { icon: MoonIcon, label: "Dark", value: "dark" },
  { icon: MonitorIcon, label: "System", value: "system" },
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

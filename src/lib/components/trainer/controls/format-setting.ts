import type { RangedSetting } from "$lib/trainer/settings/settings";

/** A slider's current value as it is shown next to the slider. */
export const formatSetting = (setting: RangedSetting, value: number) => {
  switch (setting) {
    case "baseRadiusPx": {
      return `${Math.round(value)} px`;
    }
    case "lilacChaserScale": {
      return `${value.toFixed(2)}x`;
    }
    case "distractorBrightness":
    case "letterScale":
    case "targetOpacity": {
      return `${Math.round(value * 100)}%`;
    }
    case "distractorCount":
    case "speed":
    case "targetCount": {
      return String(value);
    }
    default: {
      throw new Error(`Unknown setting: ${setting satisfies never}`);
    }
  }
};

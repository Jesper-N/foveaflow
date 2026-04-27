import type { Arena, SpeedSetting } from "./types";

export type Calibration = {
  id: string;
  viewingDistanceCm: number;
  cssPxPerCm: number;
  createdAt: number;
};

export const DEFAULT_CALIBRATION: Calibration = {
  id: "default",
  viewingDistanceCm: 60,
  cssPxPerCm: 37.8,
  createdAt: 0,
};

export const cmToPx = (cm: number, calibration: Calibration) =>
  cm * calibration.cssPxPerCm;

export const pxToCm = (px: number, calibration: Calibration) =>
  px / calibration.cssPxPerCm;

export const degreesToCm = (degrees: number, calibration: Calibration) => {
  const radians = (degrees * Math.PI) / 180;
  return 2 * calibration.viewingDistanceCm * Math.tan(radians / 2);
};

export const degreesToPx = (degrees: number, calibration: Calibration) => {
  return cmToPx(degreesToCm(degrees, calibration), calibration);
};

export const speedToPixelsPerSecond = (
  setting: SpeedSetting,
  arena: Arena,
  calibration: Calibration,
) => {
  if (setting.unit === "deg/s") return degreesToPx(setting.value, calibration);
  if (setting.unit === "cm/s") return cmToPx(setting.value, calibration);
  return setting.value * Math.min(arena.width, arena.height);
};

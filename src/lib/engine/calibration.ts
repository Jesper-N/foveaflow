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

const cmToPx = (cm: number, calibration: Calibration) =>
  cm * calibration.cssPxPerCm;

const pxToCm = (px: number, calibration: Calibration) =>
  px / calibration.cssPxPerCm;

const degreesToCm = (degrees: number, calibration: Calibration) => {
  const radians = (degrees * Math.PI) / 180;
  return 2 * calibration.viewingDistanceCm * Math.tan(radians / 2);
};

const cmToDegrees = (cm: number, calibration: Calibration) => {
  return (
    (2 * Math.atan(cm / (2 * calibration.viewingDistanceCm)) * 180) / Math.PI
  );
};

const degreesToPx = (degrees: number, calibration: Calibration) => {
  return cmToPx(degreesToCm(degrees, calibration), calibration);
};

export const pixelsPerSecondToSpeedValue = (
  pixelsPerSecond: number,
  unit: SpeedSetting["unit"],
  arena: Arena,
  calibration: Calibration,
) => {
  const value = Number.isFinite(pixelsPerSecond)
    ? Math.max(0, pixelsPerSecond)
    : 0;
  if (unit === "deg/s") {
    return cmToDegrees(pxToCm(value, calibration), calibration);
  }
  if (unit === "cm/s") return pxToCm(value, calibration);

  const screenSpan = Math.max(1, Math.min(arena.width, arena.height));
  return value / screenSpan;
};

export const speedToPixelsPerSecond = (
  setting: SpeedSetting,
  arena: Arena,
  calibration: Calibration,
) => {
  const value = Number.isFinite(setting.value) ? Math.max(0, setting.value) : 0;
  if (setting.unit === "deg/s") return degreesToPx(value, calibration);
  if (setting.unit === "cm/s") return cmToPx(value, calibration);
  return value * Math.max(1, Math.min(arena.width, arena.height));
};

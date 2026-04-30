export const MAX_CANVAS_PIXEL_COUNT = 6_000_000;
const MAX_DEVICE_PIXEL_RATIO = 2.5;
const MIN_CANVAS_SCALE = 0.5;

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

export const resolveCanvasScale = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  maxPixelCount = MAX_CANVAS_PIXEL_COUNT,
) => {
  if (!isPositiveFinite(cssWidth) || !isPositiveFinite(cssHeight)) return 1;

  const preferredScale = isPositiveFinite(devicePixelRatio)
    ? Math.min(devicePixelRatio, MAX_DEVICE_PIXEL_RATIO)
    : 1;

  if (!isPositiveFinite(maxPixelCount)) return preferredScale;

  const cssPixelCount = cssWidth * cssHeight;
  const budgetScale = Math.sqrt(maxPixelCount / cssPixelCount);

  return Math.max(MIN_CANVAS_SCALE, Math.min(preferredScale, budgetScale));
};

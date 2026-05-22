export const MAX_CANVAS_PIXEL_COUNT = 6_000_000;
const MAX_DEVICE_PIXEL_RATIO = 2.5;

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

const resolveCanvasScale = (
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

  return Math.min(preferredScale, budgetScale);
};

export const resolveCanvasLayout = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  maxPixelCount = MAX_CANVAS_PIXEL_COUNT,
) => {
  const width = isPositiveFinite(cssWidth) ? cssWidth : 1;
  const height = isPositiveFinite(cssHeight) ? cssHeight : 1;
  let scale = resolveCanvasScale(
    width,
    height,
    devicePixelRatio,
    maxPixelCount,
  );
  let canvasWidth = Math.max(1, Math.round(width * scale));
  let canvasHeight = Math.max(1, Math.round(height * scale));

  if (canvasWidth * canvasHeight > maxPixelCount) {
    scale = Math.min(
      Math.max(1, Math.floor(width * scale)) / width,
      Math.max(1, Math.floor(height * scale)) / height,
    );
    canvasWidth = Math.max(1, Math.floor(width * scale));
    canvasHeight = Math.max(1, Math.floor(height * scale));
  }

  return {
    arena: { width, height },
    scale,
    canvasWidth,
    canvasHeight,
  };
};

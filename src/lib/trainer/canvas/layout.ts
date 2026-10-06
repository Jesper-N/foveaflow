import type { Arena } from "../engine/types";

/** Caps the backing store so huge or high-density screens stay fast. */
const MAX_CANVAS_PIXELS = 6_000_000;
const MAX_DEVICE_PIXEL_RATIO = 2.5;

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

const resolveScale = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number
) => {
  const preferredScale = isPositiveFinite(devicePixelRatio)
    ? Math.min(devicePixelRatio, MAX_DEVICE_PIXEL_RATIO)
    : 1;
  const budgetScale = Math.sqrt(MAX_CANVAS_PIXELS / (cssWidth * cssHeight));
  return Math.min(preferredScale, budgetScale);
};

/** Sizes the canvas backing store for its CSS size and the screen density. */
export const resolveCanvasLayout = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number
) => {
  const width = isPositiveFinite(cssWidth) ? cssWidth : 1;
  const height = isPositiveFinite(cssHeight) ? cssHeight : 1;
  let scale = resolveScale(width, height, devicePixelRatio);
  let canvasWidth = Math.max(1, Math.round(width * scale));
  let canvasHeight = Math.max(1, Math.round(height * scale));

  // Rounding up can overshoot the budget by a pixel row, so round down instead.
  if (canvasWidth * canvasHeight > MAX_CANVAS_PIXELS) {
    scale = Math.min(
      Math.max(1, Math.floor(width * scale)) / width,
      Math.max(1, Math.floor(height * scale)) / height
    );
    canvasWidth = Math.max(1, Math.floor(width * scale));
    canvasHeight = Math.max(1, Math.floor(height * scale));
  }

  const arena: Arena = { height, width };
  return { arena, canvasHeight, canvasWidth, scale };
};

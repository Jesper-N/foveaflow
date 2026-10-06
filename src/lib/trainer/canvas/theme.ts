import type { Arena } from "../engine/types";

export type ColorMode = "light" | "dark";

export interface CanvasTheme {
  gridColor: string;
  /** How much of the trail each frame erases. */
  trailFadeAlpha: number;
}

const canvasThemes: Record<ColorMode, CanvasTheme> = {
  dark: { gridColor: "rgba(255, 255, 255, 0.045)", trailFadeAlpha: 0.35 },
  light: { gridColor: "rgba(16, 18, 22, 0.075)", trailFadeAlpha: 0.38 },
};

export const getCanvasTheme = (mode: ColorMode) => canvasThemes[mode];

/**
 * Draws the guide grid as a CSS background, so it costs nothing per frame
 * and the canvas only has to paint the targets.
 */
export const applyGridBackground = (
  canvas: HTMLCanvasElement,
  arena: Arena,
  theme: CanvasTheme
) => {
  const cellPx = Math.max(96, Math.min(arena.width, arena.height) / 5);
  canvas.style.backgroundImage = [
    `linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px)`,
  ].join(",");
  canvas.style.backgroundSize = `${cellPx}px ${cellPx}px`;
};

/** The theme's primary color as a `#rrggbb` hex, the format color inputs use. */
export const readThemeTargetColor = (element: HTMLElement): string => {
  const sample = document.createElement("canvas");
  sample.width = 1;
  sample.height = 1;
  const context = sample.getContext("2d");
  if (!context) {
    return "#000000";
  }
  // Painting one pixel converts any CSS color space to sRGB.
  context.fillStyle = getComputedStyle(element)
    .getPropertyValue("--primary")
    .trim();
  context.fillRect(0, 0, 1, 1);
  const channels = context.getImageData(0, 0, 1, 1).data.slice(0, 3);
  return `#${Array.from(channels, (channel) => channel.toString(16).padStart(2, "0")).join("")}`;
};

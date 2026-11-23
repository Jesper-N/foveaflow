import type { Arena } from "../engine/types";

export type ColorMode = "light" | "dark";

export interface CanvasTheme {
  gridColor: string;
  /** Target color until the user picks one, as a `#rrggbb` hex. */
  targetColor: string;
  /** How much of the trail each frame erases. */
  trailFadeAlpha: number;
}

const canvasThemes: Record<ColorMode, CanvasTheme> = {
  dark: {
    gridColor: "rgba(255, 255, 255, 0.045)",
    targetColor: "#f0b100",
    trailFadeAlpha: 0.35,
  },
  light: {
    gridColor: "rgba(16, 18, 22, 0.075)",
    targetColor: "#fdc700",
    trailFadeAlpha: 0.38,
  },
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

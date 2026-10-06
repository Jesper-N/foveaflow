import type { Arena } from "./types";

/** The rectangle a target's center may travel in, inset from the arena edges. */
export interface PatternBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
}

export type Box = Pick<PatternBounds, "left" | "top" | "right" | "bottom">;

const DEFAULT_PATH_MARGIN_PX = 16;

/** Gap kept between the edge of a target and the edge of the arena. */
const TARGET_EDGE_GAP_PX = 8;

/** Inset from the arena edge that keeps a target of this radius fully visible. */
export const resolvePathMargin = (
  radiusPx: number,
  pathMarginPx = DEFAULT_PATH_MARGIN_PX
) => Math.max(pathMarginPx, radiusPx + TARGET_EDGE_GAP_PX);

export const resolvePatternBounds = (
  arena: Arena,
  radiusPx: number,
  pathMarginPx = DEFAULT_PATH_MARGIN_PX
): PatternBounds => {
  const maxMargin = Math.max(0, Math.min(arena.width, arena.height) / 2);
  const margin = Math.min(resolvePathMargin(radiusPx, pathMarginPx), maxMargin);
  const left = margin;
  const top = margin;
  const right = Math.max(left, arena.width - margin);
  const bottom = Math.max(top, arena.height - margin);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return {
    bottom,
    centerX: arena.width / 2,
    centerY: arena.height / 2,
    height,
    left,
    radiusX: width / 2,
    radiusY: height / 2,
    right,
    top,
    width,
  };
};

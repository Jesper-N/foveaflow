import type { TargetFrame, TargetRole } from "./types";

/**
 * Writes into the frame at `index`, reusing the existing object so sampling
 * allocates nothing per frame, and returns the next free index.
 */
export const writeTargetFrame = (
  frames: TargetFrame[],
  index: number,
  x: number,
  y: number,
  radiusPx: number,
  alpha = 1,
  role: TargetRole = "target"
) => {
  const frame = frames[index];
  if (frame) {
    frame.x = x;
    frame.y = y;
    frame.radiusPx = radiusPx;
    frame.alpha = alpha;
    frame.role = role;
  } else {
    frames[index] = { alpha, radiusPx, role, x, y };
  }
  return index + 1;
};

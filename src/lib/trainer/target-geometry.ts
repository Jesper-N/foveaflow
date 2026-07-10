import type { TargetShape } from "$lib/engine/types";

export const getTargetVisualExtentPx = (
  radiusPx: number,
  shape: TargetShape,
) => {
  const radius = Number.isFinite(radiusPx) ? Math.max(0, radiusPx) : 0;

  if (shape === "diamond" || shape === "triangle") return radius * 1.25;
  if (shape === "cross") return radius + Math.max(3, radius * 0.45) / 2;
  if (shape === "ring") return radius + Math.max(3, radius * 0.28) / 2;
  return radius;
};

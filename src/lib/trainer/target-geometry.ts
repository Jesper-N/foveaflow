import type { TargetForm } from "$lib/engine/types";

export const getTargetVisualExtentPx = (
  radiusPx: number,
  targetForm: TargetForm
) => {
  const radius = Number.isFinite(radiusPx) ? Math.max(0, radiusPx) : 0;

  if (targetForm === "diamond" || targetForm === "triangle") {
    return radius * 1.25;
  }
  if (targetForm === "cross") {
    return radius + Math.max(3, radius * 0.45) / 2;
  }
  if (targetForm === "ring") {
    return radius + Math.max(3, radius * 0.28) / 2;
  }
  return radius;
};

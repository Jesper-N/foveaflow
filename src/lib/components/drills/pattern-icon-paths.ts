import type { PatternBounds } from "$lib/trainer/engine/bounds";
import type { PathPatternId } from "$lib/trainer/engine/paths";
import { pathDefinitions } from "$lib/trainer/engine/paths";
import type { PatternId } from "$lib/trainer/engine/types";

/** A 24×24 icon box with room for the stroke. */
const iconBounds: PatternBounds = {
  bottom: 19,
  centerX: 12,
  centerY: 12,
  height: 14,
  left: 3,
  radiusX: 9,
  radiusY: 7,
  right: 21,
  top: 5,
  width: 18,
};

/** Draws an icon from the same path the trainer animates, so the two always match. */
const tracePath = (id: PathPatternId) => {
  const { kind, samples, pointAt } = pathDefinitions[id];
  const points = Array.from({ length: samples }, (_, index) => {
    const [x, y] = pointAt(
      kind === "curve" ? index / samples : index,
      iconBounds
    );
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `${points.join(" ")} Z`;
};

/** SVG path data per pattern. Patterns drawn as glyphs have none. */
export const patternIconPaths: Record<PatternId, string | null> = {
  bounce: "M4 14 10 5 19 19 21 16",
  circle: "M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0Z",
  clover: tracePath("clover"),
  cornerTour: tracePath("cornerTour"),
  diagonal: "M3 5 18 19 21 16",
  diamondLoop: tracePath("diamondLoop"),
  directionChange: "M3 17 8 7 12 15 17 5 21 10",
  downLeftSweep: "M19 5 5 19",
  downRightSweep: "M5 5 19 19",
  ellipse: tracePath("ellipse"),
  figureEight: tracePath("figureEight"),
  horizontalSweep: "M3 12H21",
  hourglass: tracePath("hourglass"),
  lissajous: tracePath("lissajous"),
  multipleObjectTracking: null,
  perimeterLoop: tracePath("perimeterLoop"),
  randomWalk: "M3 17C4 8 8 7 11 12S18 19 21 7",
  stairStep: tracePath("stairStep"),
  teleport: null,
  verticalSweep: "M12 3V21",
  wave: tracePath("wave"),
  zigZag: tracePath("zigZag"),
};

import { pathDefinitions } from "$lib/engine/path-definitions";
import type { PatternBounds } from "$lib/engine/pattern-paths";
import type { PatternId } from "$lib/engine/types";

export const pathPreviewClass =
  "text-brand-foreground size-5 shrink-0 in-data-highlighted:text-accent-foreground";

const previewBounds: PatternBounds = {
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

const traceDefinition = (id: PatternId) => {
  const definition = pathDefinitions[id];
  if (!definition) {
    throw new Error(`No path definition for preview: ${id}`);
  }
  const points = Array.from({ length: definition.samples }, (_, index) => {
    const position =
      definition.kind === "curve" ? index / definition.samples : index;
    const [x, y] = definition.pointAt(position, previewBounds);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `${points.join(" ")} Z`;
};

export const previewPaths: Record<PatternId, string | null> = {
  bounce: "M4 14 10 5 19 19 21 16",
  circle: "M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0Z",
  clover: traceDefinition("clover"),
  cornerTour: traceDefinition("cornerTour"),
  diagonal: "M3 5 18 19 21 16",
  diamondLoop: traceDefinition("diamondLoop"),
  directionChange: "M3 17 8 7 12 15 17 5 21 10",
  downLeftSweep: "M19 5 5 19",
  downRightSweep: "M5 5 19 19",
  ellipse: traceDefinition("ellipse"),
  figureEight: traceDefinition("figureEight"),
  horizontalSweep: "M3 12H21",
  hourglass: traceDefinition("hourglass"),
  lissajous: traceDefinition("lissajous"),
  multipleObjectTracking: null,
  perimeterLoop: traceDefinition("perimeterLoop"),
  randomWalk: "M3 17C4 8 8 7 11 12S18 19 21 7",
  stairStep: traceDefinition("stairStep"),
  teleport: null,
  verticalSweep: "M12 3V21",
  wave: traceDefinition("wave"),
  zigZag: traceDefinition("zigZag"),
};

export const distractorDots = [
  { x: 5, y: 6 },
  { x: 19, y: 7 },
  { x: 4, y: 17 },
  { x: 18, y: 19 },
];
export const jumpDots = [
  { opacity: 0.3, x: 4.5, y: 17.5 },
  { opacity: 0.55, x: 11, y: 6.5 },
  { opacity: 1, x: 19.5, y: 14.5 },
];

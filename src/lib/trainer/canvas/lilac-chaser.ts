import { TAU } from "../engine/math";
import type { Arena } from "../engine/types";

// Proportions and timing of the classic illusion: twelve dots on a ring,
// one hidden at a time, moving on every 100 ms step.
const DOT_COUNT = 12;
export const LILAC_CHASER_STEP_SEC = 0.1;
const ORBIT_RATIO = 0.3381;
const DOT_RATIO = 0.0399;
const CROSS_ARM_RATIO = 0.0132;
const CROSS_STROKE_RATIO = 0.0125;
/** The illusion needs a neutral gray field, whatever the app theme. */
const BACKGROUND_COLOR = "#d8d8da";
const CROSS_COLOR = "#050505";

/** Dot directions, starting at 12 o'clock and going clockwise. */
const DOT_DIRECTIONS = Array.from({ length: DOT_COUNT }, (_, index) => {
  const angle = -Math.PI / 2 + (index / DOT_COUNT) * TAU;
  return [Math.cos(angle), Math.sin(angle)] as const;
});

export const lilacChaserHiddenDot = (elapsedSec: number) =>
  Math.floor(elapsedSec / LILAC_CHASER_STEP_SEC) % DOT_COUNT;

/** Sizes the ring for the arena. `sizeScale` is the drill's scale setting. */
const measure = (arena: Arena, sizeScale: number) => {
  const minSide = Math.min(arena.width, arena.height);
  const dotRadius = minSide * DOT_RATIO * sizeScale;
  return {
    centerX: arena.width / 2,
    centerY: arena.height / 2,
    crossArm: minSide * CROSS_ARM_RATIO * sizeScale,
    crossStroke: minSide * CROSS_STROKE_RATIO * sizeScale,
    dotRadius,
    orbitRadius: minSide * (ORBIT_RATIO + DOT_RATIO) * sizeScale - dotRadius,
  };
};

type RingGeometry = ReturnType<typeof measure>;

const dotCenter = (
  { centerX, centerY, orbitRadius }: RingGeometry,
  dot: number
) => {
  const [directionX, directionY] = DOT_DIRECTIONS[dot];
  return [
    centerX + directionX * orbitRadius,
    centerY + directionY * orbitRadius,
  ] as const;
};

/** Paints one dot in the current fill style. */
const drawDot = (
  ctx: CanvasRenderingContext2D,
  ring: RingGeometry,
  dot: number
) => {
  const [x, y] = dotCenter(ring, dot);
  ctx.beginPath();
  ctx.arc(x, y, ring.dotRadius, 0, TAU);
  ctx.fill();
};

export const drawLilacChaser = (
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  sizeScale: number,
  dotColor: string,
  hiddenDot: number
) => {
  const ring = measure(arena, sizeScale);
  const { centerX, centerY, crossArm, crossStroke } = ring;

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, arena.width, arena.height);

  ctx.fillStyle = dotColor;
  for (let dot = 0; dot < DOT_COUNT; dot += 1) {
    if (dot !== hiddenDot) {
      drawDot(ctx, ring, dot);
    }
  }

  ctx.strokeStyle = CROSS_COLOR;
  ctx.lineWidth = crossStroke;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX - crossArm, centerY);
  ctx.lineTo(centerX + crossArm, centerY);
  ctx.moveTo(centerX, centerY - crossArm);
  ctx.lineTo(centerX, centerY + crossArm);
  ctx.stroke();
};

/**
 * Moves the gap by one dot: repaints the dot that was hidden and erases the
 * one that is hidden now, instead of redrawing the whole canvas.
 * `pixelScale` is device pixels per CSS pixel.
 */
export const stepLilacChaser = (
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  sizeScale: number,
  dotColor: string,
  previousHiddenDot: number,
  hiddenDot: number,
  pixelScale: number
) => {
  const ring = measure(arena, sizeScale);
  ctx.fillStyle = dotColor;
  drawDot(ctx, ring, previousHiddenDot);

  const [x, y] = dotCenter(ring, hiddenDot);
  const extent = ring.dotRadius + 2;
  const left = Math.floor((x - extent) * pixelScale);
  const top = Math.floor((y - extent) * pixelScale);
  const right = Math.ceil((x + extent) * pixelScale);
  const bottom = Math.ceil((y + extent) * pixelScale);
  // Erase in device pixels: fractional edges blend with the background and
  // leave visible seams.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(left, top, right - left, bottom - top);
  ctx.restore();
};

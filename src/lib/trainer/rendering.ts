import type { TrainerSettings } from "$lib/engine/presets";
import type { Arena, TargetFrame, TargetShape } from "$lib/engine/types";
import {
  getLetterBucket,
  getLetterForBucket,
  getReactionLetterBucket,
} from "$lib/engine/letters";
import { getTeleportJumpDistancePx } from "$lib/engine/patterns";

import { letterScaleByShape } from "./options";

const FULL_CIRCLE_RADIANS = Math.PI * 2;
const LILAC_CHASER_DOT_COUNT = 12;
const LILAC_CHASER_STEP_SEC = 0.1;
const LILAC_CHASER_ORBIT_RATIO = 0.3381;
const LILAC_CHASER_DOT_RATIO = 0.0399;
const LILAC_CHASER_CROSS_ARM_RATIO = 0.0132;
const LILAC_CHASER_CROSS_STROKE_RATIO = 0.0125;
const LILAC_CHASER_THEME = {
  background: "#d8d8da",
  cross: "#050505",
};
const LILAC_CHASER_UNIT_POINTS = Array.from(
  { length: LILAC_CHASER_DOT_COUNT },
  (_, index) => {
    const angle =
      -Math.PI / 2 + (index / LILAC_CHASER_DOT_COUNT) * FULL_CIRCLE_RADIANS;
    return [Math.cos(angle), Math.sin(angle)] as const;
  },
);

export type CanvasTheme = {
  background: string;
  trail: string;
  grid: string;
};

export type CanvasColorMode = "light" | "dark";

type GuidePath = Pick<Path2D, "lineTo" | "moveTo">;

type LetterContext = {
  arena: Arena;
  elapsedSec: number;
  travelPx: number;
  seed: number;
};

const withAlpha = (color: string, alpha: number) => {
  if (!color.startsWith("rgb(")) return color;
  return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
};

export const getCanvasTheme = (
  node: HTMLCanvasElement,
  colorMode: CanvasColorMode,
): CanvasTheme => {
  const background = getComputedStyle(node).backgroundColor;

  return colorMode === "dark"
    ? {
        background,
        trail: withAlpha(background, 0.35),
        grid: "rgba(255, 255, 255, 0.045)",
      }
    : {
        background,
        trail: withAlpha(background, 0.38),
        grid: "rgba(16, 18, 22, 0.075)",
      };
};

export const drawGuides = (
  ctx: CanvasRenderingContext2D,
  gridPath: Path2D | null,
  theme: CanvasTheme,
) => {
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  if (gridPath) ctx.stroke(gridPath);
};

export function createGuideGridPath(arena: Arena): Path2D;
export function createGuideGridPath<TPath extends GuidePath>(
  arena: Arena,
  path: TPath,
): TPath;
export function createGuideGridPath<TPath extends GuidePath>(
  arena: Arena,
  path?: TPath,
) {
  const gridPath = path ?? new Path2D();
  const step = Math.max(96, Math.min(arena.width, arena.height) / 5);

  for (let x = step; x < arena.width; x += step) {
    gridPath.moveTo(x, 0);
    gridPath.lineTo(x, arena.height);
  }

  for (let y = step; y < arena.height; y += step) {
    gridPath.moveTo(0, y);
    gridPath.lineTo(arena.width, y);
  }

  return gridPath;
}

export const drawLilacChaserFrame = (
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  scale: number,
  ballColor: string,
  hiddenIndex: number,
) => {
  const centerX = arena.width / 2;
  const centerY = arena.height / 2;
  const minSide = Math.min(arena.width, arena.height);
  const orbitRadius = minSide * LILAC_CHASER_ORBIT_RATIO * scale;
  const dotRadius = minSide * LILAC_CHASER_DOT_RATIO * scale;
  const crossRadius = minSide * LILAC_CHASER_CROSS_ARM_RATIO * scale;

  ctx.fillStyle = LILAC_CHASER_THEME.background;
  ctx.fillRect(0, 0, arena.width, arena.height);

  ctx.fillStyle = ballColor;
  for (let index = 0; index < LILAC_CHASER_DOT_COUNT; index += 1) {
    if (index === hiddenIndex) continue;
    const point = LILAC_CHASER_UNIT_POINTS[index];
    const x = centerX + point[0] * orbitRadius;
    const y = centerY + point[1] * orbitRadius;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, FULL_CIRCLE_RADIANS);
    ctx.fill();
  }

  ctx.strokeStyle = LILAC_CHASER_THEME.cross;
  ctx.lineWidth = minSide * LILAC_CHASER_CROSS_STROKE_RATIO * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX - crossRadius, centerY);
  ctx.lineTo(centerX + crossRadius, centerY);
  ctx.moveTo(centerX, centerY - crossRadius);
  ctx.lineTo(centerX, centerY + crossRadius);
  ctx.stroke();
};

export const getLilacChaserHiddenIndex = (elapsedSec: number) => {
  return (
    Math.floor(elapsedSec / LILAC_CHASER_STEP_SEC) % LILAC_CHASER_DOT_COUNT
  );
};

export const getLetterFontSize = (
  radiusPx: number,
  shape: TargetShape,
  letterScale: number,
) => Math.max(6, radiusPx * letterScaleByShape[shape] * letterScale);

export const drawLetterGlyph = (
  ctx: CanvasRenderingContext2D,
  letter: string,
  frame: TargetFrame,
  settings: Pick<
    TrainerSettings,
    "letterColor" | "letterWeight" | "letterScale" | "targetShape"
  >,
) => {
  const fontSize = getLetterFontSize(
    frame.radiusPx,
    settings.targetShape,
    settings.letterScale,
  );
  ctx.save();
  ctx.fillStyle = settings.letterColor;
  ctx.font = `${settings.letterWeight} ${fontSize}px Geist, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(frame.x, frame.y + fontSize * 0.04);
  ctx.fillText(letter, 0, 0);
  ctx.restore();
};

export const getFrameLetter = (
  settings: Pick<TrainerSettings, "presetId">,
  frame: TargetFrame,
  index: number,
  { arena, elapsedSec, travelPx, seed }: LetterContext,
) => {
  if (settings.presetId === "reactionTime") {
    const bucket = getReactionLetterBucket(
      travelPx,
      getTeleportJumpDistancePx(arena, frame.radiusPx),
    );
    return getLetterForBucket(seed, index, bucket);
  }

  return getLetterForBucket(seed, index, getLetterBucket(elapsedSec));
};

export const drawTargetFrame = (
  ctx: CanvasRenderingContext2D,
  frame: TargetFrame,
  index: number,
  settings: TrainerSettings,
  letterContext: LetterContext,
) => {
  if (!frame.visible) return;

  const alpha = frame.alpha * settings.targetOpacity;
  if (alpha <= 0) return;

  if (!settings.letterEnabled) {
    drawTargetShape(ctx, frame, settings.targetShape, alpha);
    return;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = frame.color;
  drawStimulusShape(
    ctx,
    frame.x,
    frame.y,
    frame.radiusPx,
    settings.targetShape,
  );
  drawLetterGlyph(
    ctx,
    getFrameLetter(settings, frame, index, letterContext),
    frame,
    settings,
  );
  ctx.restore();
};

const drawTargetShape = (
  ctx: CanvasRenderingContext2D,
  frame: TargetFrame,
  shape: TargetShape,
  alpha: number,
) => {
  if (alpha !== 1) ctx.globalAlpha = alpha;
  ctx.fillStyle = frame.color;
  drawStimulusShape(ctx, frame.x, frame.y, frame.radiusPx, shape);
  if (alpha !== 1) ctx.globalAlpha = 1;
};

const drawStimulusShape = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusPx: number,
  shape: TargetShape,
) => {
  if (shape === "square") {
    ctx.fillRect(x - radiusPx, y - radiusPx, radiusPx * 2, radiusPx * 2);
    return;
  }

  ctx.beginPath();

  if (shape === "diamond") {
    ctx.moveTo(x, y - radiusPx * 1.25);
    ctx.lineTo(x + radiusPx * 1.25, y);
    ctx.lineTo(x, y + radiusPx * 1.25);
    ctx.lineTo(x - radiusPx * 1.25, y);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (shape === "triangle") {
    ctx.moveTo(x, y - radiusPx * 1.25);
    ctx.lineTo(x + radiusPx * 1.15, y + radiusPx);
    ctx.lineTo(x - radiusPx * 1.15, y + radiusPx);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (shape === "cross") {
    ctx.lineWidth = Math.max(3, radiusPx * 0.45);
    ctx.lineCap = "round";
    ctx.strokeStyle = ctx.fillStyle;
    ctx.moveTo(x - radiusPx, y);
    ctx.lineTo(x + radiusPx, y);
    ctx.moveTo(x, y - radiusPx);
    ctx.lineTo(x, y + radiusPx);
    ctx.stroke();
    return;
  }

  ctx.arc(x, y, radiusPx, 0, FULL_CIRCLE_RADIANS);
  if (shape === "ring") {
    ctx.lineWidth = Math.max(3, radiusPx * 0.28);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.stroke();
    return;
  }

  ctx.fill();
};

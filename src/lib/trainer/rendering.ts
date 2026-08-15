import {
  getLetterBucket,
  getLetterForBucket,
  getReactionLetterBucket,
} from "$lib/engine/letters";
import type { TrainerSettings } from "$lib/engine/presets";
import type { Arena, TargetFrame, TargetForm } from "$lib/engine/types";

import { letterScaleByTargetForm } from "./options";

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
  }
);

export interface CanvasTheme {
  grid: string;
  trailFadeAlpha: number;
}

export type CanvasColorMode = "light" | "dark";

interface LetterContext {
  elapsedSec: number;
  travelPx: number;
  seed: number;
  reactionJumpDistancePx: number;
}

export const getCanvasTheme = (colorMode: CanvasColorMode): CanvasTheme =>
  colorMode === "dark"
    ? {
        grid: "rgba(255, 255, 255, 0.045)",
        trailFadeAlpha: 0.35,
      }
    : {
        grid: "rgba(16, 18, 22, 0.075)",
        trailFadeAlpha: 0.38,
      };

const getGuideGridStep = (arena: Arena) =>
  Math.max(96, Math.min(arena.width, arena.height) / 5);

export const applyCanvasBackground = (
  node: HTMLCanvasElement,
  arena: Arena,
  theme: CanvasTheme
) => {
  const step = getGuideGridStep(arena);
  node.style.backgroundImage = [
    `linear-gradient(to right, ${theme.grid} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${theme.grid} 1px, transparent 1px)`,
  ].join(",");
  node.style.backgroundSize = `${step}px ${step}px`;
};

export const getLilacChaserOuterRadiusPx = (arena: Arena, scale: number) =>
  Math.min(arena.width, arena.height) *
  (LILAC_CHASER_ORBIT_RATIO + LILAC_CHASER_DOT_RATIO) *
  scale;

export const drawLilacChaserFrame = (
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  scale: number,
  ballColor: string,
  hiddenIndex: number
) => {
  const centerX = arena.width / 2;
  const centerY = arena.height / 2;
  const minSide = Math.min(arena.width, arena.height);
  const dotRadius = minSide * LILAC_CHASER_DOT_RATIO * scale;
  const orbitRadius = getLilacChaserOuterRadiusPx(arena, scale) - dotRadius;
  const crossRadius = minSide * LILAC_CHASER_CROSS_ARM_RATIO * scale;

  ctx.fillStyle = LILAC_CHASER_THEME.background;
  ctx.fillRect(0, 0, arena.width, arena.height);

  ctx.fillStyle = ballColor;
  for (let index = 0; index < LILAC_CHASER_DOT_COUNT; index += 1) {
    if (index === hiddenIndex) {
      continue;
    }
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

export const getLilacChaserHiddenIndex = (elapsedSec: number) =>
  Math.floor(elapsedSec / LILAC_CHASER_STEP_SEC) % LILAC_CHASER_DOT_COUNT;

const getLetterFontSize = (
  radiusPx: number,
  targetForm: TargetForm,
  letterScale: number
) => Math.max(6, radiusPx * letterScaleByTargetForm[targetForm] * letterScale);

const drawLetterGlyph = (
  ctx: CanvasRenderingContext2D,
  letter: string,
  frame: TargetFrame,
  settings: Pick<
    TrainerSettings,
    "letterColor" | "letterWeight" | "letterScale" | "targetForm"
  >
) => {
  const fontSize = getLetterFontSize(
    frame.radiusPx,
    settings.targetForm,
    settings.letterScale
  );
  ctx.save();
  ctx.fillStyle = settings.letterColor;
  ctx.font = `${settings.letterWeight} ${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(frame.x, frame.y + fontSize * 0.04);
  ctx.fillText(letter, 0, 0);
  ctx.restore();
};

const getFrameLetter = (
  settings: Pick<TrainerSettings, "presetId">,
  index: number,
  { elapsedSec, travelPx, seed, reactionJumpDistancePx }: LetterContext
) => {
  if (settings.presetId === "reactionTime") {
    const bucket = getReactionLetterBucket(travelPx, reactionJumpDistancePx);
    return getLetterForBucket(seed, index, bucket);
  }

  return getLetterForBucket(seed, index, getLetterBucket(elapsedSec));
};

const drawStimulusForm = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusPx: number,
  targetForm: TargetForm
) => {
  if (targetForm === "square") {
    ctx.fillRect(x - radiusPx, y - radiusPx, radiusPx * 2, radiusPx * 2);
    return;
  }

  ctx.beginPath();

  if (targetForm === "diamond") {
    ctx.moveTo(x, y - radiusPx * 1.25);
    ctx.lineTo(x + radiusPx * 1.25, y);
    ctx.lineTo(x, y + radiusPx * 1.25);
    ctx.lineTo(x - radiusPx * 1.25, y);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (targetForm === "triangle") {
    ctx.moveTo(x, y - radiusPx * 1.25);
    ctx.lineTo(x + radiusPx * 1.15, y + radiusPx);
    ctx.lineTo(x - radiusPx * 1.15, y + radiusPx);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (targetForm === "cross") {
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
  if (targetForm === "ring") {
    ctx.lineWidth = Math.max(3, radiusPx * 0.28);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.stroke();
    return;
  }

  ctx.fill();
};

const drawTargetForm = (
  ctx: CanvasRenderingContext2D,
  frame: TargetFrame,
  targetForm: TargetForm,
  alpha: number
) => {
  if (alpha !== 1) {
    ctx.globalAlpha = alpha;
  }
  ctx.fillStyle = frame.color;
  drawStimulusForm(ctx, frame.x, frame.y, frame.radiusPx, targetForm);
  if (alpha !== 1) {
    ctx.globalAlpha = 1;
  }
};

export const drawTargetFrame = (
  ctx: CanvasRenderingContext2D,
  frame: TargetFrame,
  index: number,
  settings: TrainerSettings,
  letterContext: LetterContext
) => {
  if (!frame.visible) {
    return;
  }

  const alpha = frame.alpha * settings.targetOpacity;
  if (alpha <= 0) {
    return;
  }

  if (!settings.letterEnabled) {
    drawTargetForm(ctx, frame, settings.targetForm, alpha);
    return;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = frame.color;
  drawStimulusForm(ctx, frame.x, frame.y, frame.radiusPx, settings.targetForm);
  drawLetterGlyph(
    ctx,
    getFrameLetter(settings, index, letterContext),
    frame,
    settings
  );
  ctx.restore();
};

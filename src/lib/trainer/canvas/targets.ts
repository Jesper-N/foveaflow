import { letterAt } from "../engine/letters";
import { TAU } from "../engine/math";
import type { TargetForm } from "../settings/options";
import type { TrainerSettings } from "../settings/settings";
import type { FrameSample } from "./frame-sampler";

/** Narrow shapes get smaller letters so the letter stays inside the outline. */
const letterScaleByForm = {
  circle: 1,
  cross: 0.72,
  diamond: 0.86,
  ring: 0.82,
  square: 1.05,
  triangle: 0.76,
} satisfies Record<TargetForm, number>;

const MIN_LETTER_FONT_PX = 6;
/** Optical nudge: glyphs sit slightly high when centered on their middle baseline. */
const LETTER_BASELINE_SHIFT = 0.04;
const POINTED_FORM_REACH = 1.25;

const crossStrokeWidth = (radiusPx: number) => Math.max(3, radiusPx * 0.45);
const ringStrokeWidth = (radiusPx: number) => Math.max(3, radiusPx * 0.28);

/** How far a target's outline reaches from its center, including strokes. */
export const targetExtentPx = (radiusPx: number, form: TargetForm) => {
  const radius = Number.isFinite(radiusPx) ? Math.max(0, radiusPx) : 0;
  switch (form) {
    case "diamond":
    case "triangle": {
      return radius * POINTED_FORM_REACH;
    }
    case "cross": {
      return radius + crossStrokeWidth(radius) / 2;
    }
    case "ring": {
      return radius + ringStrokeWidth(radius) / 2;
    }
    default: {
      return radius;
    }
  }
};

/** Paints one shape in the current fill style. */
const drawForm = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusPx: number,
  form: TargetForm
) => {
  if (form === "square") {
    ctx.fillRect(x - radiusPx, y - radiusPx, radiusPx * 2, radiusPx * 2);
    return;
  }

  const reach = radiusPx * POINTED_FORM_REACH;
  ctx.beginPath();
  switch (form) {
    case "diamond": {
      ctx.moveTo(x, y - reach);
      ctx.lineTo(x + reach, y);
      ctx.lineTo(x, y + reach);
      ctx.lineTo(x - reach, y);
      ctx.closePath();
      ctx.fill();
      return;
    }
    case "triangle": {
      ctx.moveTo(x, y - reach);
      ctx.lineTo(x + radiusPx * 1.15, y + radiusPx);
      ctx.lineTo(x - radiusPx * 1.15, y + radiusPx);
      ctx.closePath();
      ctx.fill();
      return;
    }
    case "cross": {
      ctx.lineWidth = crossStrokeWidth(radiusPx);
      ctx.lineCap = "round";
      ctx.strokeStyle = ctx.fillStyle;
      ctx.moveTo(x - radiusPx, y);
      ctx.lineTo(x + radiusPx, y);
      ctx.moveTo(x, y - radiusPx);
      ctx.lineTo(x, y + radiusPx);
      ctx.stroke();
      return;
    }
    case "ring": {
      ctx.arc(x, y, radiusPx, 0, TAU);
      ctx.lineWidth = ringStrokeWidth(radiusPx);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
      return;
    }
    default: {
      ctx.arc(x, y, radiusPx, 0, TAU);
      ctx.fill();
    }
  }
};

const letterFontSize = (radiusPx: number, settings: TrainerSettings) =>
  Math.max(
    MIN_LETTER_FONT_PX,
    radiusPx * letterScaleByForm[settings.targetForm] * settings.letterScale
  );

export interface TargetPaint {
  targetColor: string;
  distractorColor: string;
  fontFamily: string;
}

export const drawTargets = (
  ctx: CanvasRenderingContext2D,
  { frames, count, seed, letterBucket }: FrameSample,
  settings: TrainerSettings,
  paint: TargetPaint
) => {
  const { letterEnabled, targetOpacity, targetForm } = settings;
  // Assigning a font makes the canvas parse it, so only assign when it changes.
  let font = "";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let index = 0; index < count; index += 1) {
    const { x, y, radiusPx, role, alpha } = frames[index];
    const opacity = alpha * targetOpacity;
    if (opacity <= 0) {
      continue;
    }

    ctx.globalAlpha = opacity;
    ctx.fillStyle =
      role === "target" ? paint.targetColor : paint.distractorColor;
    drawForm(ctx, x, y, radiusPx, targetForm);

    if (letterEnabled) {
      const fontSize = letterFontSize(radiusPx, settings);
      const letterFont = `${settings.letterWeight} ${fontSize}px ${paint.fontFamily}`;
      if (letterFont !== font) {
        font = letterFont;
        ctx.font = font;
      }
      ctx.fillStyle = settings.letterColor;
      ctx.fillText(
        letterAt(seed, index, letterBucket),
        x,
        y + fontSize * LETTER_BASELINE_SHIFT
      );
    }
  }

  ctx.restore();
};

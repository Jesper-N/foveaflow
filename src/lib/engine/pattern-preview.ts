import { patternOptions } from "./presets";
import { samplePatternInto, withIsolatedPatternSampling } from "./patterns";
import { createRng } from "./random";
import type { Arena, PatternId, PatternParams, TargetFrame } from "./types";

const previewArena: Arena = {
  width: 48,
  height: 32,
};

const previewParams: PatternParams = {
  radiusPx: 2,
  pathMarginPx: 4,
  speedPxPerSec: 1,
  travelPx: 0,
};

const previewSeed = 73_521;
const previewSampleCount = 80;
const previewCache = new Map<PatternId, string>();

const previewTravelPxByPattern: Partial<Record<PatternId, number>> = {
  randomWalk: 780,
  circle: 76,
  ellipse: 104,
  figureEight: 112,
  wave: 118,
  diagonal: 58,
  bounce: 96,
  directionChange: 900,
  horizontalSweep: 112,
  verticalSweep: 68,
  perimeterLoop: 206,
  diamondLoop: 138,
  spiralBloom: 124,
  clover: 146,
  zigZag: 170,
  stairStep: 300,
  lissajous: 148,
  hourglass: 138,
  orbitShift: 120,
  cornerTour: 164,
};

const defaultPreviewTravelPx = 140;

const formatPoint = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "0.0";

const getPreviewTravelPx = (patternId: PatternId) =>
  previewTravelPxByPattern[patternId] ?? defaultPreviewTravelPx;

const buildPreviewPath = (patternId: PatternId) => {
  return withIsolatedPatternSampling(() => {
    const frames: TargetFrame[] = [];
    const rng = createRng(previewSeed);
    const travelPx = getPreviewTravelPx(patternId);

    const points = Array.from({ length: previewSampleCount }, (_, index) => {
      const progress = index / Math.max(1, previewSampleCount - 1);

      samplePatternInto(
        frames,
        patternId,
        0,
        previewArena,
        {
          ...previewParams,
          travelPx: progress * travelPx,
        },
        rng,
      );

      const frame = frames.find((targetFrame) => targetFrame.role === "target");
      return frame ? [frame.x, frame.y] : null;
    }).filter((point): point is [number, number] => Boolean(point));

    if (points.length === 0) return "";

    return points
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command}${formatPoint(point[0])} ${formatPoint(point[1])}`;
      })
      .join(" ");
  });
};

export const getPatternPreviewPath = (patternId: PatternId) => {
  const cachedPath = previewCache.get(patternId);
  if (cachedPath !== undefined) return cachedPath;

  const previewPath = buildPreviewPath(patternId);
  previewCache.set(patternId, previewPath);
  return previewPath;
};

export const previewablePatternIds = patternOptions
  .filter((patternOption) => patternOption.id !== "multipleObjectTracking")
  .map((patternOption) => patternOption.id);

import { createPatternSampler } from "./patterns";
import { createRng } from "./random";
import type { Arena, PatternId, PatternParams, TargetFrame } from "./types";

const previewArena: Arena = {
  width: 48,
  height: 32,
};

const defaultPreviewParams: PatternParams = {
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
  downRightSweep: 118,
  downLeftSweep: 118,
  perimeterLoop: 206,
  diamondLoop: 138,
  clover: 146,
  zigZag: 170,
  stairStep: 300,
  lissajous: 148,
  hourglass: 138,
  cornerTour: 164,
};

const defaultPreviewTravelPx = 140;

const formatPoint = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "0.0";

const getPreviewTravelPx = (patternId: PatternId) =>
  previewTravelPxByPattern[patternId] ?? defaultPreviewTravelPx;

const buildPreviewPath = (patternId: PatternId) => {
  const sampler = createPatternSampler();
  return sampler.run(() => {
    const frames: TargetFrame[] = [];
    const rng = createRng(previewSeed);
    const travelPx = getPreviewTravelPx(patternId);
    const previewParams = { ...defaultPreviewParams };
    const points: Array<[number, number]> = [];

    for (let index = 0; index < previewSampleCount; index += 1) {
      const progress = index / Math.max(1, previewSampleCount - 1);
      previewParams.travelPx = progress * travelPx;

      sampler.sampleInto(
        frames,
        patternId,
        0,
        previewArena,
        previewParams,
        rng,
      );

      const frame = frames.find((targetFrame) => targetFrame.role === "target");
      if (frame) points.push([frame.x, frame.y]);
    }

    return points
      .map(([x, y], index) => {
        const command = index === 0 ? "M" : "L";
        return `${command}${formatPoint(x)} ${formatPoint(y)}`;
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

import { resolvePatternBounds } from "$lib/engine/pattern-paths";
import {
  createPatternSampler,
  getTeleportJumpDistancePx,
} from "$lib/engine/patterns";
import type { TrainerSettings } from "$lib/engine/presets";
import {
  getMaximumSizeProfileRadius,
  sampleSizeProfile,
} from "$lib/engine/profiles";
import type { Rng } from "$lib/engine/random";
import type { Arena, PatternParams, TargetFrame } from "$lib/engine/types";
import { getTargetVisualExtentPx } from "$lib/trainer/target-geometry";

interface TrainerLetterContext {
  elapsedSec: number;
  travelPx: number;
  seed: number;
  reactionJumpDistancePx: number;
}

interface TrainerFrameSample {
  frames: TargetFrame[];
  count: number;
  letterContext: TrainerLetterContext;
}

export interface TrainerFrameInput {
  settings: TrainerSettings;
  arena: Arena;
  elapsedSec: number;
  travelPx: number;
  safeBallColor: string;
  distractorColor: string;
  pathMarginPx: number;
  rng: Rng;
  seed: number;
}

export const createTrainerFrameSampler = () => {
  const sampler = createPatternSampler();
  let activePatternId: TrainerSettings["patternId"] | null = null;
  const frames: TargetFrame[] = [];
  const params: PatternParams = {
    pathMarginPx: 16,
    radiusPx: 1,
    speedPxPerSec: 1,
    travelPx: 0,
  };
  const letterContext: TrainerLetterContext = {
    elapsedSec: 0,
    reactionJumpDistancePx: 420,
    seed: 0,
    travelPx: 0,
  };
  // The result and its target buffer are borrowed until the next sample.
  const sample: TrainerFrameSample = { count: 0, frames, letterContext };

  return {
    reset() {
      sampler.reset();
      activePatternId = null;
    },
    sample(input: TrainerFrameInput): TrainerFrameSample {
      const {
        settings,
        arena,
        elapsedSec,
        travelPx,
        safeBallColor,
        distractorColor,
        pathMarginPx,
        rng,
        seed,
      } = input;
      if (settings.patternId !== activePatternId) {
        sampler.reset();
        activePatternId = settings.patternId;
      }

      const radiusPx = sampleSizeProfile(
        settings.sizeProfile,
        elapsedSec,
        settings.baseRadiusPx
      );
      const pathRadiusPx = getMaximumSizeProfileRadius(
        settings.sizeProfile,
        settings.baseRadiusPx
      );

      params.radiusPx = radiusPx;
      params.pathMarginPx = Math.max(
        pathMarginPx,
        getTargetVisualExtentPx(pathRadiusPx, settings.targetForm) + 8
      );
      params.travelPx = travelPx;
      params.targetCount = settings.targetCount;
      params.distractorCount = settings.distractorCount;
      params.colorA = safeBallColor;
      params.colorB = distractorColor;

      const count = sampler.sampleInto(
        frames,
        settings.patternId,
        elapsedSec,
        arena,
        params,
        rng
      );

      letterContext.elapsedSec = elapsedSec;
      letterContext.travelPx = travelPx;
      letterContext.seed = seed;
      if (settings.presetId === "reactionTime") {
        letterContext.reactionJumpDistancePx = getTeleportJumpDistancePx(
          resolvePatternBounds(arena, radiusPx, params.pathMarginPx)
        );
      }

      sample.count = count;
      return sample;
    },
  };
};

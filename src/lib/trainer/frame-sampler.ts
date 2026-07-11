import type { TrainerSettings } from "$lib/engine/presets";
import {
  createPatternSampler,
  getTeleportJumpDistancePx,
} from "$lib/engine/patterns";
import {
  getMaximumSizeProfileRadius,
  sampleSizeProfile,
} from "$lib/engine/profiles";
import type { Rng } from "$lib/engine/random";
import type { Arena, PatternParams, TargetFrame } from "$lib/engine/types";
import { getTargetVisualExtentPx } from "$lib/trainer/target-geometry";

type TrainerLetterContext = {
  elapsedSec: number;
  travelPx: number;
  seed: number;
  reactionJumpDistancePx: number;
};

type TrainerFrameSample = {
  frames: TargetFrame[];
  count: number;
  letterContext: TrainerLetterContext;
};

export type TrainerFrameInput = {
  settings: TrainerSettings;
  arena: Arena;
  elapsedSec: number;
  travelPx: number;
  safeBallColor: string;
  distractorColor: string;
  pathMarginPx: number;
  rng: Rng;
  seed: number;
};

export const createTrainerFrameSampler = () => {
  const sampler = createPatternSampler();
  let activePatternId: TrainerSettings["patternId"] | null = null;
  const frames: TargetFrame[] = [];
  const params: PatternParams = {
    radiusPx: 1,
    pathMarginPx: 16,
    speedPxPerSec: 1,
    travelPx: 0,
  };
  const letterContext: TrainerLetterContext = {
    elapsedSec: 0,
    travelPx: 0,
    seed: 0,
    reactionJumpDistancePx: 420,
  };

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
        settings.baseRadiusPx,
      );
      const pathRadiusPx = getMaximumSizeProfileRadius(
        settings.sizeProfile,
        settings.baseRadiusPx,
      );

      params.radiusPx = radiusPx;
      params.pathMarginPx = Math.max(
        pathMarginPx,
        getTargetVisualExtentPx(pathRadiusPx, settings.targetShape) + 8,
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
        rng,
      );

      letterContext.elapsedSec = elapsedSec;
      letterContext.travelPx = travelPx;
      letterContext.seed = seed;
      if (settings.presetId === "reactionTime") {
        letterContext.reactionJumpDistancePx = getTeleportJumpDistancePx(
          arena,
          radiusPx,
          params.pathMarginPx,
        );
      }

      return { frames, count, letterContext };
    },
  };
};

import type { TrainerSettings } from "$lib/engine/presets";
import { createPatternSampler } from "$lib/engine/patterns";
import { sampleSizeProfile, sampleSpeedProfile } from "$lib/engine/profiles";
import type { Rng } from "$lib/engine/random";
import type { Arena, PatternParams, TargetFrame } from "$lib/engine/types";

export type TrainerLetterContext = {
  arena: Arena;
  elapsedSec: number;
  travelPx: number;
  seed: number;
};

export type TrainerFrameSample = {
  frames: TargetFrame[];
  count: number;
  letterContext: TrainerLetterContext;
};

type TrainerFrameInput = {
  settings: TrainerSettings;
  arena: Arena;
  elapsedSec: number;
  travelPx: number;
  currentSpeedPxPerSec: number;
  baseSpeedPxPerSec: number;
  safeBallColor: string;
  distractorColor: string;
  pathMarginPx: number;
  rng: Rng;
  seed: number;
};

export const createTrainerFrameSampler = () => {
  const sampler = createPatternSampler();
  const frames: TargetFrame[] = [];
  const params: PatternParams = {
    radiusPx: 1,
    pathMarginPx: 16,
    speedPxPerSec: 1,
    travelPx: 0,
  };
  const letterContext: TrainerLetterContext = {
    arena: { width: 1, height: 1 },
    elapsedSec: 0,
    travelPx: 0,
    seed: 0,
  };

  return {
    reset() {
      sampler.reset();
    },
    sample(input: TrainerFrameInput): TrainerFrameSample {
      const {
        settings,
        arena,
        elapsedSec,
        travelPx,
        currentSpeedPxPerSec,
        baseSpeedPxPerSec,
        safeBallColor,
        distractorColor,
        pathMarginPx,
        rng,
        seed,
      } = input;
      const speedPxPerSec =
        currentSpeedPxPerSec ||
        sampleSpeedProfile(
          settings.speedProfile,
          elapsedSec,
          baseSpeedPxPerSec,
        );
      const radiusPx = sampleSizeProfile(
        settings.sizeProfile,
        elapsedSec,
        settings.baseRadiusPx,
      );

      params.radiusPx = radiusPx;
      params.pathMarginPx = pathMarginPx;
      params.speedPxPerSec = speedPxPerSec;
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

      letterContext.arena = arena;
      letterContext.elapsedSec = elapsedSec;
      letterContext.travelPx = travelPx;
      letterContext.seed = seed;

      return { frames, count, letterContext };
    },
  };
};

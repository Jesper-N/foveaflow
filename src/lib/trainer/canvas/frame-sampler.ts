import { resolvePathMargin } from "../engine/bounds";
import { timeLetterBucket } from "../engine/letters";
import { PatternSampler } from "../engine/pattern-sampler";
import type { PatternParams } from "../engine/pattern-sampler";
import { maxSizeProfileRadius, sampleSizeProfile } from "../engine/profiles";
import type { Rng } from "../engine/random";
import type { Arena, TargetFrame } from "../engine/types";
import type { TrainerSettings } from "../settings/settings";
import { targetExtentPx } from "./targets";

export interface FrameSample {
  frames: TargetFrame[];
  count: number;
  /** Seed and bucket that pick the letter on each target. */
  seed: number;
  letterBucket: number;
}

/** Turns settings and elapsed motion into the targets to draw this frame. */
export class FrameSampler {
  readonly #patterns = new PatternSampler();
  readonly #params: PatternParams = {
    distractorCount: 0,
    pathMarginPx: 0,
    radiusPx: 1,
    targetCount: 1,
    travelPx: 0,
  };
  readonly #sample: FrameSample = {
    count: 0,
    frames: [],
    letterBucket: 0,
    seed: 0,
  };

  /** Starts the pattern over, for a new seed or a reset. */
  reset() {
    this.#patterns.reset();
  }

  /** The returned sample and its frames are reused by the next call. */
  sample(
    settings: TrainerSettings,
    arena: Arena,
    elapsedSec: number,
    travelPx: number,
    rng: Rng
  ): FrameSample {
    const params = this.#params;
    params.radiusPx = sampleSizeProfile(
      settings.sizeProfile,
      elapsedSec,
      settings.baseRadiusPx
    );
    // Size the route for the largest radius, so pulsing targets never clip.
    const largestRadiusPx = maxSizeProfileRadius(
      settings.sizeProfile,
      settings.baseRadiusPx
    );
    params.pathMarginPx = resolvePathMargin(
      targetExtentPx(largestRadiusPx, settings.targetForm)
    );
    params.travelPx = travelPx;
    params.targetCount = settings.targetCount;
    params.distractorCount = settings.distractorCount;

    const sample = this.#sample;
    sample.count = this.#patterns.sample(
      sample.frames,
      settings.patternId,
      arena,
      params,
      rng
    );
    sample.seed = rng.seed;
    // Reaction Jumps show a new letter with each jump, other drills every two seconds.
    sample.letterBucket =
      settings.patternId === "teleport"
        ? this.#patterns.jumpIndex
        : timeLetterBucket(elapsedSec);
    return sample;
  }
}

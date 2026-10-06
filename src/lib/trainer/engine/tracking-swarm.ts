import type { Box } from "./bounds";
import { createRng } from "./random";
import { RandomWalker } from "./random-walk";
import { writeTargetFrame } from "./target-frames";
import type { TargetFrame } from "./types";

/** Seed spacing that gives every object its own independent walk. */
const SEED_OFFSET = 120_000;
const SEED_STRIDE = 9973;

/** Targets and distractors for Multiple Distractions, each on its own random walk. */
export class TrackingSwarm {
  readonly seed: number;
  #lastTravelPx: number;
  readonly #walkers: RandomWalker[] = [];

  constructor(seed: number, travelPx: number) {
    this.seed = seed;
    this.#lastTravelPx = travelPx;
  }

  get lastTravelPx() {
    return this.#lastTravelPx;
  }

  /** Writes targets first, then distractors, and returns how many it wrote. */
  sample(
    frames: TargetFrame[],
    box: Box,
    travelPx: number,
    radiusPx: number,
    targetCount: number,
    distractorCount: number
  ) {
    const total = targetCount + distractorCount;
    const walkers = this.#walkers;
    this.#lastTravelPx = travelPx;
    if (walkers.length > total) {
      walkers.length = total;
    }
    // Objects added mid-drill start walking from the current distance.
    for (let index = walkers.length; index < total; index += 1) {
      const rng = createRng(this.seed + SEED_OFFSET + index * SEED_STRIDE);
      walkers.push(new RandomWalker(rng, travelPx, box));
    }

    for (let index = 0; index < total; index += 1) {
      const { x, y } = walkers[index].advance(travelPx, box);
      writeTargetFrame(
        frames,
        index,
        x,
        y,
        radiusPx,
        1,
        index < targetCount ? "target" : "distractor"
      );
    }
    return total;
  }
}

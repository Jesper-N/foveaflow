import { integrateSpeedProfile } from "./profiles";
import type { SpeedProfile } from "./profiles";
import type { MotionDirection } from "./types";

/** Longer gaps, like a dropped frame or a background tab, count as this long. */
const MAX_FRAME_DELTA_MS = 80;

/** Elapsed drill time and the distance travelled along the route. */
export class MotionClock {
  elapsedSec = 0;
  travelPx = 0;
  /** Timestamp of the last advance, or 0 while the clock is stopped. */
  #lastTimestamp = 0;

  get isStopped() {
    return this.#lastTimestamp === 0;
  }

  /** Counts time from `timestamp`, without moving. */
  start(timestamp: number) {
    this.#lastTimestamp = timestamp;
  }

  stop() {
    this.#lastTimestamp = 0;
  }

  reset() {
    this.elapsedSec = 0;
    this.travelPx = 0;
    this.#lastTimestamp = 0;
  }

  /** Moves along the route for the time since the last advance. */
  advance(
    timestamp: number,
    basePxPerSec: number,
    speedProfile: SpeedProfile,
    direction: MotionDirection
  ) {
    const deltaSec = this.isStopped
      ? 0
      : Math.min(
          MAX_FRAME_DELTA_MS,
          Math.max(0, timestamp - this.#lastTimestamp)
        ) / 1000;
    const nextElapsedSec = this.elapsedSec + deltaSec;
    const distancePx = integrateSpeedProfile(
      speedProfile,
      this.elapsedSec,
      nextElapsedSec,
      basePxPerSec
    );

    this.#lastTimestamp = timestamp;
    this.elapsedSec = nextElapsedSec;
    this.travelPx += distancePx * direction;
  }

  /**
   * Advances time without travel, for drills that change in discrete steps.
   * Lilac Chaser sleeps about 100 ms between calls, so gaps are not capped
   * like in `advance`. The first call after a stop only starts the clock.
   */
  advanceTime(timestamp: number) {
    if (!this.isStopped) {
      this.elapsedSec += Math.max(0, timestamp - this.#lastTimestamp) / 1000;
    }
    this.#lastTimestamp = timestamp;
  }
}

import { resolvePathMargin, resolvePatternBounds } from "./bounds";
import type { PatternBounds } from "./bounds";
import { HardTurnPath } from "./hard-turns";
import { clamp, pingPong } from "./math";
import { PathSampler, isPathPattern } from "./paths";
import type { Rng } from "./random";
import { RandomWalker } from "./random-walk";
import { ScaledTravel } from "./scaled-travel";
import { writeTargetFrame } from "./target-frames";
import { TrackingSwarm } from "./tracking-swarm";
import type { Arena, PatternId, TargetFrame } from "./types";

// Diagonal and Bounce move on both axes at once. The scales keep the speed
// along the route equal to the requested speed.
const DIAGONAL_X_RATE = 0.72;
const DIAGONAL_Y_RATE = 1;
const DIAGONAL_SPEED_SCALE = 1 / Math.hypot(DIAGONAL_X_RATE, DIAGONAL_Y_RATE);
const BOUNCE_X_RATE = 0.93;
const BOUNCE_Y_RATE = 0.67;
const BOUNCE_SPEED_SCALE = 1 / Math.hypot(BOUNCE_X_RATE, BOUNCE_Y_RATE);

/** Each jump fades in at reduced opacity for this share of its interval. */
const TELEPORT_FADE_IN_PHASE = 0.08;
const TELEPORT_FADE_IN_ALPHA = 0.35;

/** Hard caps on swarm size, above what the settings allow, to bound allocations. */
const MAX_SWARM_TARGETS = 12;
const MAX_SWARM_DISTRACTORS = 20;

export interface PatternParams {
  radiusPx: number;
  pathMarginPx: number;
  travelPx: number;
  targetCount: number;
  distractorCount: number;
}

interface SizedBounds extends PatternBounds {
  diagonalLength: number;
}

/** Distance the target travels between two Reaction Jumps. */
const teleportJumpDistancePx = ({
  width,
  height,
}: Pick<PatternBounds, "width" | "height">) =>
  clamp(Math.min(width, height) * 0.55, 420, 820);

/**
 * Positions targets for every motion pattern. Positions depend only on the
 * distance travelled and the seed, so a drill replays identically at any
 * frame rate. Stateful patterns keep their progress between samples and
 * start over when the pattern changes.
 */
export class PatternSampler {
  #jumpIndex = 0;
  #patternId: PatternId | null = null;
  #boundsCache: {
    width: number;
    height: number;
    margin: number;
    bounds: SizedBounds;
  } | null = null;
  #path: PathSampler | null = null;
  #travel = new ScaledTravel();
  #travelX = new ScaledTravel();
  #travelY = new ScaledTravel();
  #walker: RandomWalker | null = null;
  #hardTurns: HardTurnPath | null = null;
  #swarm: TrackingSwarm | null = null;

  /** Which Reaction Jump is showing. Its letters change with each jump. */
  get jumpIndex() {
    return this.#jumpIndex;
  }

  /** Forgets all progress, so the next sample starts the pattern over. */
  reset() {
    this.#jumpIndex = 0;
    this.#patternId = null;
    this.#path = null;
    this.#travel = new ScaledTravel();
    this.#travelX = new ScaledTravel();
    this.#travelY = new ScaledTravel();
    this.#walker = null;
    this.#hardTurns = null;
    this.#swarm = null;
  }

  /** Writes this frame's objects into `frames` and returns how many it wrote. */
  sample(
    frames: TargetFrame[],
    id: PatternId,
    arena: Arena,
    params: PatternParams,
    rng: Rng
  ): number {
    if (id !== this.#patternId) {
      this.reset();
      this.#patternId = id;
    }
    const radiusPx = Number.isFinite(params.radiusPx)
      ? Math.max(1, params.radiusPx)
      : 1;
    const travelPx = Number.isFinite(params.travelPx) ? params.travelPx : 0;
    const bounds = this.#resolveBounds(arena, radiusPx, params.pathMarginPx);

    if (isPathPattern(id)) {
      this.#path ??= new PathSampler(id);
      const [x, y] = this.#path.sample(travelPx, bounds);
      return writeTargetFrame(frames, 0, x, y, radiusPx);
    }

    switch (id) {
      case "circle": {
        return this.#sampleCircle(frames, bounds, travelPx, radiusPx);
      }
      case "diagonal": {
        return this.#sampleDiagonal(frames, bounds, travelPx, radiusPx);
      }
      case "bounce": {
        return this.#sampleBounce(frames, bounds, travelPx, radiusPx);
      }
      case "horizontalSweep":
      case "verticalSweep":
      case "downRightSweep":
      case "downLeftSweep": {
        return this.#sampleSweep(frames, id, bounds, travelPx, radiusPx);
      }
      case "randomWalk": {
        return this.#sampleRandomWalk(frames, bounds, travelPx, radiusPx, rng);
      }
      case "directionChange": {
        return this.#sampleHardTurns(frames, bounds, travelPx, radiusPx, rng);
      }
      case "teleport": {
        return this.#sampleTeleport(frames, bounds, travelPx, radiusPx, rng);
      }
      case "multipleObjectTracking": {
        return this.#sampleSwarm(
          frames,
          bounds,
          travelPx,
          radiusPx,
          params,
          rng
        );
      }
      default: {
        throw new Error(`Unsupported pattern: ${id satisfies never}`);
      }
    }
  }

  #resolveBounds(arena: Arena, radiusPx: number, pathMarginPx: number) {
    const margin = resolvePathMargin(radiusPx, pathMarginPx);
    const cache = this.#boundsCache;
    if (
      cache?.width === arena.width &&
      cache.height === arena.height &&
      cache.margin === margin
    ) {
      return cache.bounds;
    }

    const bounds = resolvePatternBounds(arena, radiusPx, pathMarginPx);
    this.#boundsCache = {
      bounds: {
        ...bounds,
        diagonalLength: Math.max(1, Math.hypot(bounds.width, bounds.height)),
      },
      height: arena.height,
      margin,
      width: arena.width,
    };
    return this.#boundsCache.bounds;
  }

  #sampleCircle(
    frames: TargetFrame[],
    { centerX, centerY, radiusX, radiusY }: PatternBounds,
    travelPx: number,
    radiusPx: number
  ) {
    const radius = Math.min(radiusX, radiusY);
    const angleRadius = Math.max(1, radius);
    const angle = this.#travel.resolve(travelPx, angleRadius) / angleRadius;
    return writeTargetFrame(
      frames,
      0,
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
      radiusPx
    );
  }

  #sampleDiagonal(
    frames: TargetFrame[],
    { left, top, width, height }: PatternBounds,
    travelPx: number,
    radiusPx: number
  ) {
    const travelX = this.#travelX.resolve(
      travelPx * DIAGONAL_X_RATE * DIAGONAL_SPEED_SCALE,
      width
    );
    const travelY = this.#travelY.resolve(
      travelPx * DIAGONAL_Y_RATE * DIAGONAL_SPEED_SCALE,
      height
    );
    return writeTargetFrame(
      frames,
      0,
      left + pingPong(travelX, width),
      top + pingPong(travelY, height),
      radiusPx
    );
  }

  #sampleBounce(
    frames: TargetFrame[],
    { left, top, width, height }: PatternBounds,
    travelPx: number,
    radiusPx: number
  ) {
    const travelX = this.#travelX.resolve(
      travelPx * BOUNCE_X_RATE * BOUNCE_SPEED_SCALE,
      width
    );
    const travelY = this.#travelY.resolve(
      travelPx * BOUNCE_Y_RATE * BOUNCE_SPEED_SCALE,
      height
    );
    // The offsets start the ball away from a corner.
    return writeTargetFrame(
      frames,
      0,
      left + pingPong(travelX + width * 0.18, width),
      top + pingPong(travelY + height * 0.41, height),
      radiusPx
    );
  }

  #sampleSweep(
    frames: TargetFrame[],
    id:
      | "horizontalSweep"
      | "verticalSweep"
      | "downRightSweep"
      | "downLeftSweep",
    bounds: SizedBounds,
    travelPx: number,
    radiusPx: number
  ) {
    const { left, top, right, width, height, centerX, centerY } = bounds;
    if (id === "horizontalSweep") {
      const sweepTravelPx = this.#travel.resolve(travelPx, width);
      return writeTargetFrame(
        frames,
        0,
        left + pingPong(sweepTravelPx, width),
        centerY,
        radiusPx
      );
    }
    if (id === "verticalSweep") {
      const sweepTravelPx = this.#travel.resolve(travelPx, height);
      return writeTargetFrame(
        frames,
        0,
        centerX,
        top + pingPong(sweepTravelPx, height),
        radiusPx
      );
    }

    const { diagonalLength } = bounds;
    const sweepTravelPx = this.#travel.resolve(travelPx, diagonalLength);
    const progress = pingPong(sweepTravelPx, diagonalLength) / diagonalLength;
    return writeTargetFrame(
      frames,
      0,
      id === "downRightSweep"
        ? left + width * progress
        : right - width * progress,
      top + height * progress,
      radiusPx
    );
  }

  #sampleRandomWalk(
    frames: TargetFrame[],
    bounds: PatternBounds,
    travelPx: number,
    radiusPx: number,
    rng: Rng
  ) {
    // The walk only moves forward, so a new seed or a rewind restarts it.
    if (
      this.#walker?.seed !== rng.seed ||
      travelPx < this.#walker.lastTravelPx
    ) {
      this.#walker = new RandomWalker(rng, travelPx, bounds);
    }
    const { x, y } = this.#walker.advance(travelPx, bounds);
    return writeTargetFrame(frames, 0, x, y, radiusPx);
  }

  #sampleHardTurns(
    frames: TargetFrame[],
    bounds: PatternBounds,
    travelPx: number,
    radiusPx: number,
    rng: Rng
  ) {
    const distancePx = Math.max(0, travelPx);
    if (
      this.#hardTurns?.seed !== rng.seed ||
      distancePx < this.#hardTurns.lastTravelPx
    ) {
      this.#hardTurns = new HardTurnPath(rng, distancePx, bounds);
    }
    const { x, y } = this.#hardTurns.advance(distancePx, bounds);
    return writeTargetFrame(frames, 0, x, y, radiusPx);
  }

  #sampleTeleport(
    frames: TargetFrame[],
    bounds: PatternBounds,
    travelPx: number,
    radiusPx: number,
    rng: Rng
  ) {
    const jumpPx = teleportJumpDistancePx(bounds);
    const jumpTravelPx = this.#travel.resolve(travelPx, jumpPx);
    const jumpIndex = Math.floor(jumpTravelPx / jumpPx);
    const phase = (jumpTravelPx - jumpIndex * jumpPx) / jumpPx;
    this.#jumpIndex = jumpIndex;
    return writeTargetFrame(
      frames,
      0,
      rng.rangeAt(jumpIndex * 2, bounds.left, bounds.right),
      rng.rangeAt(jumpIndex * 2 + 1, bounds.top, bounds.bottom),
      radiusPx,
      phase < TELEPORT_FADE_IN_PHASE ? TELEPORT_FADE_IN_ALPHA : 1
    );
  }

  #sampleSwarm(
    frames: TargetFrame[],
    bounds: PatternBounds,
    travelPx: number,
    radiusPx: number,
    { targetCount, distractorCount }: PatternParams,
    rng: Rng
  ) {
    if (this.#swarm?.seed !== rng.seed || travelPx < this.#swarm.lastTravelPx) {
      this.#swarm = new TrackingSwarm(rng.seed, travelPx);
    }
    return this.#swarm.sample(
      frames,
      bounds,
      travelPx,
      radiusPx,
      clamp(Math.round(targetCount), 1, MAX_SWARM_TARGETS),
      clamp(Math.round(distractorCount), 0, MAX_SWARM_DISTRACTORS)
    );
  }
}

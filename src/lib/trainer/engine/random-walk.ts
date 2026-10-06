import type { Box } from "./bounds";
import { TAU, clamp } from "./math";
import type { Rng } from "./random";

/**
 * The walk is integrated in fixed steps so the route depends only on the
 * distance travelled, never on the frame rate.
 */
const STEP_PX = 5;

// Indexes into the seeded random stream. Turn streams add the turn number.
// They overlap after 1000 turns, which recorded routes already depend on.
const START_HEADING_INDEX = 90_001;
const START_X_INDEX = 90_002;
const START_Y_INDEX = 90_003;
const FIRST_TURN_INDEX = 90_004;
const TURN_SWERVE_INDEX = 91_000;
const TURN_DISTANCE_INDEX = 92_000;

interface WalkState {
  x: number;
  y: number;
  heading: number;
  targetHeading: number;
  turnCount: number;
  nextTurnTravelPx: number;
  /** Distance covered by whole steps. */
  committedTravelPx: number;
}

const copyWalkState = (target: WalkState, source: WalkState) => {
  target.x = source.x;
  target.y = source.y;
  target.heading = source.heading;
  target.targetHeading = source.targetHeading;
  target.turnCount = source.turnCount;
  target.nextTurnTravelPx = source.nextTurnTravelPx;
  target.committedTravelPx = source.committedTravelPx;
};

const shortestAngleDelta = (from: number, to: number) => {
  const delta = to - from;
  return delta > -Math.PI && delta < Math.PI
    ? delta
    : Math.atan2(Math.sin(delta), Math.cos(delta));
};

/** Mirrors a walker that left the box back inside and flips its heading. */
const reflectIntoBox = (state: WalkState, box: Box) => {
  const { left, top, right, bottom } = box;
  let reflectedX = false;
  let reflectedY = false;

  if (right - left < 1) {
    state.x = (left + right) / 2;
  } else {
    while (state.x < left || state.x > right) {
      state.x =
        state.x < left ? left + (left - state.x) : right - (state.x - right);
      reflectedX = !reflectedX;
    }
  }

  if (bottom - top < 1) {
    state.y = (top + bottom) / 2;
  } else {
    while (state.y < top || state.y > bottom) {
      state.y =
        state.y < top ? top + (top - state.y) : bottom - (state.y - bottom);
      reflectedY = !reflectedY;
    }
  }

  if (reflectedX) {
    state.heading = Math.PI - state.heading;
    state.targetHeading = state.heading;
  }
  if (reflectedY) {
    state.heading = -state.heading;
    state.targetHeading = state.heading;
  }
};

/**
 * Picks a new heading at each turn: a random swerve plus slow wander, pulled
 * back toward the center the closer the walker gets to an edge.
 */
const turn = (state: WalkState, rng: Rng, travelPx: number, box: Box) => {
  state.turnCount += 1;
  const wander =
    Math.sin((travelPx + rng.seed * 0.17) / 180) * 0.28 +
    Math.sin((travelPx + rng.seed * 0.31) / 310) * 0.18;
  const randomHeading =
    state.heading +
    wander +
    rng.rangeAt(TURN_SWERVE_INDEX + state.turnCount, -1.85, 1.85);

  const centerX = (box.left + box.right) / 2;
  const centerY = (box.top + box.bottom) / 2;
  const offsetX = (state.x - centerX) / Math.max(1, (box.right - box.left) / 2);
  const offsetY = (state.y - centerY) / Math.max(1, (box.bottom - box.top) / 2);
  const centerBias =
    clamp((Math.hypot(offsetX, offsetY) - 0.35) / 0.65, 0, 1) * 0.75;
  const centerHeading = Math.atan2(centerY - state.y, centerX - state.x);

  state.targetHeading =
    randomHeading +
    shortestAngleDelta(randomHeading, centerHeading) * centerBias;
  state.nextTurnTravelPx =
    travelPx + rng.rangeAt(TURN_DISTANCE_INDEX + state.turnCount, 160, 360);
};

const step = (
  state: WalkState,
  rng: Rng,
  travelPx: number,
  stepPx: number,
  box: Box
) => {
  if (travelPx >= state.nextTurnTravelPx) {
    turn(state, rng, travelPx, box);
  }

  const drift =
    Math.sin((travelPx + rng.seed * 0.41) / 220) * 0.0018 +
    Math.sin((travelPx + rng.seed * 0.73) / 380) * 0.0012;
  state.heading +=
    shortestAngleDelta(state.heading, state.targetHeading) *
      Math.min(1, stepPx / 150) +
    drift * stepPx;
  state.x += Math.cos(state.heading) * stepPx;
  state.y += Math.sin(state.heading) * stepPx;
  reflectIntoBox(state, box);
};

/** A target that wanders smoothly around the box without repeating itself. */
export class RandomWalker {
  readonly #rng: Rng;
  readonly #state: WalkState;
  /** Scratch state for the partial step between the last whole step and now. */
  readonly #preview: WalkState;
  #lastTravelPx: number;

  constructor(rng: Rng, travelPx: number, box: Box) {
    const heading = rng.rangeAt(START_HEADING_INDEX, 0, TAU);
    this.#rng = rng;
    this.#state = {
      committedTravelPx: travelPx,
      heading,
      nextTurnTravelPx: travelPx + rng.rangeAt(FIRST_TURN_INDEX, 150, 340),
      targetHeading: heading,
      turnCount: 0,
      x: rng.rangeAt(START_X_INDEX, box.left, box.right),
      y: rng.rangeAt(START_Y_INDEX, box.top, box.bottom),
    };
    this.#preview = { ...this.#state };
    this.#lastTravelPx = travelPx;
  }

  get seed() {
    return this.#rng.seed;
  }

  get lastTravelPx() {
    return this.#lastTravelPx;
  }

  /** Returns the position at `travelPx`. The next call may reuse the returned object. */
  advance(travelPx: number, box: Box): Readonly<WalkState> {
    const state = this.#state;
    this.#lastTravelPx = travelPx;
    reflectIntoBox(state, box);
    if (travelPx <= state.committedTravelPx) {
      return state;
    }

    while (state.committedTravelPx + STEP_PX <= travelPx) {
      const nextTravelPx = state.committedTravelPx + STEP_PX;
      step(state, this.#rng, nextTravelPx, STEP_PX, box);
      state.committedTravelPx = nextTravelPx;
    }

    const remainderPx = travelPx - state.committedTravelPx;
    if (remainderPx <= 0) {
      return state;
    }

    // Finish the partial step on a copy so the committed walk stays on the grid.
    copyWalkState(this.#preview, state);
    step(this.#preview, this.#rng, travelPx, remainderPx, box);
    return this.#preview;
  }
}

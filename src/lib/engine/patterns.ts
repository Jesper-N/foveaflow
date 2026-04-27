import type {
  Arena,
  PatternId,
  PatternParams,
  TargetFrame,
  TargetRole,
} from "./types";
import type { Rng } from "./random";

const TAU = Math.PI * 2;
const DEFAULT_TARGET_COLOR = "#76d900";
const DEFAULT_SECONDARY_COLOR = "#3ddbd9";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const pingPong = (value: number, length: number) => {
  if (length <= 0) return 0;
  const wrapped = positiveModulo(value, length * 2);
  return wrapped <= length ? wrapped : length * 2 - wrapped;
};

type RandomWalkState = {
  key: string;
  x: number;
  y: number;
  heading: number;
  targetHeading: number;
  turnIndex: number;
  nextTurnTravel: number;
  lastTravelPx: number;
};

const randomWalkStates = new Map<number, RandomWalkState>();

const shortestAngleDelta = (from: number, to: number) => {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
};

const initializeRandomWalk = (
  rng: Rng,
  key: string,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  const heading = rng.rangeAt(90_001, 0, TAU);
  const state: RandomWalkState = {
    key,
    x: rng.rangeAt(90_002, left, right),
    y: rng.rangeAt(90_003, top, bottom),
    heading,
    targetHeading: heading,
    turnIndex: 0,
    nextTurnTravel: travelPx + rng.rangeAt(90_004, 150, 340),
    lastTravelPx: travelPx,
  };
  randomWalkStates.set(rng.seed, state);
  return state;
};

const advanceRandomWalk = (
  state: RandomWalkState,
  rng: Rng,
  travelPx: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  let remainingPx = Math.min(260, Math.max(0, travelPx - state.lastTravelPx));
  state.lastTravelPx = travelPx;

  while (remainingPx > 0) {
    const stepPx = Math.min(remainingPx, 5);
    remainingPx -= stepPx;

    if (travelPx >= state.nextTurnTravel) {
      state.turnIndex += 1;
      const wander =
        Math.sin((travelPx + rng.seed * 0.17) / 180) * 0.28 +
        Math.sin((travelPx + rng.seed * 0.31) / 310) * 0.18;
      state.targetHeading =
        state.heading +
        wander +
        rng.rangeAt(91_000 + state.turnIndex, -1.85, 1.85);
      state.nextTurnTravel =
        travelPx + rng.rangeAt(92_000 + state.turnIndex, 160, 360);
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

    if (state.x < left || state.x > right) {
      state.x = clamp(state.x, left, right);
      state.heading = Math.PI - state.heading;
      state.targetHeading = state.heading;
    }
    if (state.y < top || state.y > bottom) {
      state.y = clamp(state.y, top, bottom);
      state.heading = -state.heading;
      state.targetHeading = state.heading;
    }
  }
};

const writeTarget = (
  frames: TargetFrame[],
  index: number,
  id: string,
  x: number,
  y: number,
  params: PatternParams,
  role: TargetRole = "target",
  radiusPx = params.radiusPx,
  color = params.colorA ?? DEFAULT_TARGET_COLOR,
  alpha = 1,
  visible = true,
) => {
  let frame = frames[index];
  if (!frame) {
    frame = {
      id,
      x,
      y,
      radiusPx,
      color,
      alpha,
      visible,
      role,
    };
    frames[index] = frame;
    return index + 1;
  }

  frame.id = id;
  frame.x = x;
  frame.y = y;
  frame.radiusPx = radiusPx;
  frame.color = color;
  frame.alpha = alpha;
  frame.visible = visible;
  frame.role = role;
  frame.label = undefined;
  return index + 1;
};

export const samplePatternInto = (
  frames: TargetFrame[],
  id: PatternId,
  elapsedSec: number,
  arena: Arena,
  params: PatternParams,
  rng: Rng,
): number => {
  const radiusPx = Math.max(1, params.radiusPx);
  const boundsRadiusPx = Math.max(1, params.boundsRadiusPx ?? radiusPx);
  const margin = Math.max(boundsRadiusPx + 8, 16);
  const left = margin;
  const top = margin;
  const right = Math.max(left, arena.width - margin);
  const bottom = Math.max(top, arena.height - margin);
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const cx = arena.width / 2;
  const cy = arena.height / 2;
  const rx = Math.max(1, width / 2);
  const ry = Math.max(1, height / 2);
  const speedPxPerSec = Math.max(1, params.speedPxPerSec);
  const travelPx = params.travelPx || elapsedSec * speedPxPerSec;
  const primaryColor = params.colorA ?? DEFAULT_TARGET_COLOR;
  const secondaryColor = params.colorB ?? DEFAULT_SECONDARY_COLOR;

  if (id === "circle") {
    const radius = Math.max(1, Math.min(rx, ry));
    const angle = travelPx / radius;
    return writeTarget(
      frames,
      0,
      "target",
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "ellipse") {
    const arcScale = Math.max(1, (rx + ry) / 2);
    const angle = travelPx / arcScale;
    return writeTarget(
      frames,
      0,
      "target",
      cx + Math.cos(angle) * rx,
      cy + Math.sin(angle) * ry,
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "figureEight") {
    const arcScale = Math.max(1, (rx + ry) / 2);
    const angle = travelPx / arcScale;
    return writeTarget(
      frames,
      0,
      "target",
      cx + Math.sin(angle) * rx,
      cy + Math.sin(angle * 2) * ry * 0.72,
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "wave") {
    const x = left + positiveModulo(travelPx, width);
    const wavePhase = (x / width) * TAU * 2.5 + elapsedSec * 0.35;
    return writeTarget(
      frames,
      0,
      "target",
      x,
      cy + Math.sin(wavePhase) * ry * 0.82,
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "diagonal") {
    return writeTarget(
      frames,
      0,
      "target",
      left + pingPong(travelPx * 0.72, width),
      top + pingPong(travelPx, height),
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "bounce") {
    return writeTarget(
      frames,
      0,
      "target",
      left + pingPong(travelPx * 0.93 + width * 0.18, width),
      top + pingPong(travelPx * 0.67 + height * 0.41, height),
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "randomWalk") {
    const stateKey = `${Math.round(arena.width)}:${Math.round(arena.height)}:${Math.round(boundsRadiusPx)}`;
    let state = randomWalkStates.get(rng.seed);
    if (!state || state.key !== stateKey || travelPx < state.lastTravelPx) {
      state = initializeRandomWalk(
        rng,
        stateKey,
        travelPx,
        left,
        top,
        right,
        bottom,
      );
    }
    advanceRandomWalk(state, rng, travelPx, left, top, right, bottom);

    return writeTarget(
      frames,
      0,
      "target",
      state.x,
      state.y,
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "directionChange") {
    const segmentPx = Math.max(90, Math.min(arena.width, arena.height) * 0.22);
    const segment = Math.floor(travelPx / segmentPx);
    const partial = (travelPx - segment * segmentPx) / segmentPx;
    const x1 = rng.rangeAt(segment * 4, left, right);
    const y1 = rng.rangeAt(segment * 4 + 1, top, bottom);
    const x2 = rng.rangeAt(segment * 4 + 2, left, right);
    const y2 = rng.rangeAt(segment * 4 + 3, top, bottom);

    return writeTarget(
      frames,
      0,
      "target",
      x1 + (x2 - x1) * partial,
      y1 + (y2 - y1) * partial,
      params,
      "target",
      radiusPx,
      primaryColor,
    );
  }

  if (id === "teleport") {
    const intervalSec = 0.86;
    const bucket = Math.floor(elapsedSec / intervalSec);
    const phase = (elapsedSec - bucket * intervalSec) / intervalSec;
    return writeTarget(
      frames,
      0,
      "target",
      rng.rangeAt(bucket * 2, left, right),
      rng.rangeAt(bucket * 2 + 1, top, bottom),
      params,
      "target",
      radiusPx,
      primaryColor,
      phase < 0.08 ? 0.35 : 1,
    );
  }

  if (id === "multipleObjectTracking") {
    const targetCount = clamp(Math.round(params.targetCount ?? 3), 1, 12);
    const distractorCount = clamp(
      Math.round(params.distractorCount ?? 5),
      0,
      20,
    );
    const total = targetCount + distractorCount;
    let count = 0;

    for (let index = 0; index < total; index += 1) {
      const base = index * 10;
      const speedScaleX = rng.rangeAt(base, 0.52, 1.26);
      const speedScaleY = rng.rangeAt(base + 1, 0.48, 1.18);
      const phaseX = rng.rangeAt(base + 2, 0, width * 2);
      const phaseY = rng.rangeAt(base + 3, 0, height * 2);
      const role: TargetRole = index < targetCount ? "target" : "distractor";
      count = writeTarget(
        frames,
        count,
        `${role}-${index}`,
        left + pingPong(travelPx * speedScaleX + phaseX, width),
        top + pingPong(travelPx * speedScaleY + phaseY, height),
        params,
        role,
        radiusPx,
        role === "target" ? primaryColor : secondaryColor,
        1,
      );
    }

    return count;
  }

  return samplePatternInto(frames, "ellipse", elapsedSec, arena, params, rng);
};

export const samplePattern = (
  id: PatternId,
  elapsedSec: number,
  arena: Arena,
  params: PatternParams,
  rng: Rng,
) => {
  const frames: TargetFrame[] = [];
  const count = samplePatternInto(frames, id, elapsedSec, arena, params, rng);
  return frames.slice(0, count);
};

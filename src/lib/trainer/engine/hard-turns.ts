import type { Box } from "./bounds";
import { clamp } from "./math";
import type { Rng } from "./random";

const RANDOM_INDEX_OFFSET = 40_000;
const RANDOM_INDEX_STRIDE = 60;
const WAYPOINT_CANDIDATES = 24;
/** A new waypoint must be at least this share of the shorter side away. */
const MIN_WAYPOINT_DISTANCE_RATIO = 0.55;

/** Picks a waypoint far enough from the current position to force a sharp turn. */
const pickWaypoint = (
  rng: Rng,
  waypointIndex: number,
  fromX: number,
  fromY: number,
  box: Box
): [x: number, y: number] => {
  const { left, top, right, bottom } = box;
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const minDistance = Math.min(width, height) * MIN_WAYPOINT_DISTANCE_RATIO;
  let bestX = fromX;
  let bestY = fromY;
  let bestDistance = -1;

  for (let candidate = 0; candidate < WAYPOINT_CANDIDATES; candidate += 1) {
    const randomIndex =
      RANDOM_INDEX_OFFSET + waypointIndex * RANDOM_INDEX_STRIDE + candidate * 2;
    const x = rng.rangeAt(randomIndex, left, right);
    const y = rng.rangeAt(randomIndex + 1, top, bottom);
    const distance = Math.hypot(x - fromX, y - fromY);
    if (distance >= minDistance) {
      return [x, y];
    }
    if (distance > bestDistance) {
      bestX = x;
      bestY = y;
      bestDistance = distance;
    }
  }

  if (bestDistance <= Number.EPSILON) {
    // Every candidate landed on the current point, so head for the far corner.
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    return [fromX <= centerX ? right : left, fromY <= centerY ? bottom : top];
  }

  return [bestX, bestY];
};

/** Distance from a point along a unit direction until it leaves the box. */
const distanceToEdge = (
  x: number,
  y: number,
  directionX: number,
  directionY: number,
  { left, top, right, bottom }: Box
) => {
  let distance = Number.POSITIVE_INFINITY;
  if (directionX > Number.EPSILON) {
    distance = Math.min(distance, (right - x) / directionX);
  } else if (directionX < -Number.EPSILON) {
    distance = Math.min(distance, (left - x) / directionX);
  }
  if (directionY > Number.EPSILON) {
    distance = Math.min(distance, (bottom - y) / directionY);
  } else if (directionY < -Number.EPSILON) {
    distance = Math.min(distance, (top - y) / directionY);
  }
  return Number.isFinite(distance) ? Math.max(0, distance) : 0;
};

/** Straight runs between random waypoints, with abrupt turns at each one. */
export class HardTurnPath {
  readonly #rng: Rng;
  readonly #position = { x: 0, y: 0 };
  #targetX: number;
  #targetY: number;
  /** Waypoint 0 is the start and waypoint 1 the first target. */
  #nextWaypointIndex = 2;
  #lastTravelPx: number;
  readonly #box: Box;

  constructor(rng: Rng, travelPx: number, box: Box) {
    const position = this.#position;
    this.#rng = rng;
    position.x = rng.rangeAt(RANDOM_INDEX_OFFSET, box.left, box.right);
    position.y = rng.rangeAt(RANDOM_INDEX_OFFSET + 1, box.top, box.bottom);
    [this.#targetX, this.#targetY] = pickWaypoint(
      rng,
      1,
      position.x,
      position.y,
      box
    );
    this.#lastTravelPx = travelPx;
    this.#box = {
      bottom: box.bottom,
      left: box.left,
      right: box.right,
      top: box.top,
    };
  }

  get seed() {
    return this.#rng.seed;
  }

  get lastTravelPx() {
    return this.#lastTravelPx;
  }

  /** Returns the position at `travelPx`. The next call reuses the returned object. */
  advance(travelPx: number, box: Box): Readonly<{ x: number; y: number }> {
    const position = this.#position;
    this.#fitToBox(box);
    if (box.right - box.left < 1 && box.bottom - box.top < 1) {
      this.#lastTravelPx = travelPx;
      return position;
    }

    let remainingPx = travelPx - this.#lastTravelPx;
    while (remainingPx > 0) {
      const deltaX = this.#targetX - position.x;
      const deltaY = this.#targetY - position.y;
      const segmentLength = Math.hypot(deltaX, deltaY);
      if (segmentLength <= Number.EPSILON) {
        this.#pickNextWaypoint(box);
        continue;
      }

      const directionX = deltaX / segmentLength;
      const directionY = deltaY / segmentLength;
      const edgeDistance = distanceToEdge(
        position.x,
        position.y,
        directionX,
        directionY,
        box
      );
      if (edgeDistance <= Number.EPSILON) {
        this.#pickNextWaypoint(box);
        continue;
      }

      const stepPx = Math.min(remainingPx, segmentLength, edgeDistance);
      position.x = clamp(position.x + directionX * stepPx, box.left, box.right);
      position.y = clamp(position.y + directionY * stepPx, box.top, box.bottom);
      remainingPx -= stepPx;

      // A waypoint outside a shrunken box is unreachable: turn at the edge.
      if (
        edgeDistance < segmentLength &&
        stepPx >= edgeDistance - Number.EPSILON
      ) {
        this.#pickNextWaypoint(box);
      }
    }

    this.#lastTravelPx = travelPx;
    return position;
  }

  #pickNextWaypoint(box: Box) {
    [this.#targetX, this.#targetY] = pickWaypoint(
      this.#rng,
      this.#nextWaypointIndex,
      this.#position.x,
      this.#position.y,
      box
    );
    this.#nextWaypointIndex += 1;
  }

  /** Shifts the route into a resized box so the target keeps its heading. */
  #fitToBox(box: Box) {
    const current = this.#box;
    if (
      current.left === box.left &&
      current.top === box.top &&
      current.right === box.right &&
      current.bottom === box.bottom
    ) {
      return;
    }

    const position = this.#position;
    const shiftX = clamp(position.x, box.left, box.right) - position.x;
    const shiftY = clamp(position.y, box.top, box.bottom) - position.y;
    position.x += shiftX;
    position.y += shiftY;
    this.#targetX += shiftX;
    this.#targetY += shiftY;
    current.left = box.left;
    current.top = box.top;
    current.right = box.right;
    current.bottom = box.bottom;
  }
}

import type { TrainerSettings } from "$lib/engine/presets";

export type MotionTickState = {
  timestamp: number;
  lastTimestamp: number;
  elapsedSec: number;
  travelPx: number;
  speedPxPerSec: number;
  canToggleDirection: boolean;
  motionDirection: TrainerSettings["motionDirection"];
};

export type MotionTickResult = {
  lastTimestamp: number;
  elapsedSec: number;
  travelPx: number;
};

export const getMotionDeltaSec = (timestamp: number, lastTimestamp: number) => {
  const deltaMs =
    lastTimestamp === 0 ? 16.7 : Math.min(80, timestamp - lastTimestamp);
  return deltaMs / 1000;
};

export const getMotionDirectionMultiplier = (
  canToggleDirection: boolean,
  motionDirection: TrainerSettings["motionDirection"],
) => {
  return canToggleDirection ? motionDirection : 1;
};

export const advanceMotionTick = (
  {
    timestamp,
    lastTimestamp,
    elapsedSec,
    travelPx,
    speedPxPerSec,
    canToggleDirection,
    motionDirection,
  }: MotionTickState,
  result: MotionTickResult = {
    lastTimestamp: 0,
    elapsedSec: 0,
    travelPx: 0,
  },
) => {
  const deltaSec = getMotionDeltaSec(timestamp, lastTimestamp);
  const directionMultiplier = getMotionDirectionMultiplier(
    canToggleDirection,
    motionDirection,
  );

  result.lastTimestamp = timestamp;
  result.elapsedSec = elapsedSec + deltaSec;
  result.travelPx = travelPx + speedPxPerSec * deltaSec * directionMultiplier;
  return result;
};

import type { TrainerSettings } from "$lib/engine/presets";
import { integrateSpeedProfile, type SpeedProfile } from "$lib/engine/profiles";

type MotionTickState = {
  timestamp: number;
  lastTimestamp: number;
  elapsedSec: number;
  travelPx: number;
  baseSpeedPxPerSec: number;
  speedProfile: SpeedProfile;
  canToggleDirection: boolean;
  motionDirection: TrainerSettings["motionDirection"];
};

export type MotionTickResult = {
  lastTimestamp: number;
  elapsedSec: number;
  travelPx: number;
};

const getMotionDeltaSec = (timestamp: number, lastTimestamp: number) => {
  if (lastTimestamp <= 0) return 0;
  const deltaMs = Math.min(80, Math.max(0, timestamp - lastTimestamp));
  return deltaMs / 1000;
};

const getMotionDirectionMultiplier = (
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
    baseSpeedPxPerSec,
    speedProfile,
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
  const nextElapsedSec = elapsedSec + deltaSec;
  const distancePx = integrateSpeedProfile(
    speedProfile,
    elapsedSec,
    nextElapsedSec,
    baseSpeedPxPerSec,
  );

  result.lastTimestamp = timestamp;
  result.elapsedSec = nextElapsedSec;
  result.travelPx = travelPx + distancePx * directionMultiplier;
  return result;
};

import type { TrainerSettings } from "$lib/engine/presets";
import { integrateSpeedProfile, type SpeedProfile } from "$lib/engine/profiles";

export type MotionState = {
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
  state: MotionState,
  timestamp: number,
  baseSpeedPxPerSec: number,
  speedProfile: SpeedProfile,
  canToggleDirection: boolean,
  motionDirection: TrainerSettings["motionDirection"],
) => {
  const deltaSec = getMotionDeltaSec(timestamp, state.lastTimestamp);
  const directionMultiplier = getMotionDirectionMultiplier(
    canToggleDirection,
    motionDirection,
  );
  const nextElapsedSec = state.elapsedSec + deltaSec;
  const distancePx = integrateSpeedProfile(
    speedProfile,
    state.elapsedSec,
    nextElapsedSec,
    baseSpeedPxPerSec,
  );

  state.lastTimestamp = timestamp;
  state.elapsedSec = nextElapsedSec;
  state.travelPx += distancePx * directionMultiplier;
};

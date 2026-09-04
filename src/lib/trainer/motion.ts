import type { TrainerSettings } from "$lib/engine/presets";
import { integrateSpeedProfile } from "$lib/engine/profiles";
import type { SpeedProfile } from "$lib/engine/profiles";

export interface MotionState {
  lastTimestamp: number;
  elapsedSec: number;
  travelPx: number;
}

export const advanceMotionTick = (
  state: MotionState,
  timestamp: number,
  baseSpeedPxPerSec: number,
  speedProfile: SpeedProfile,
  canToggleDirection: boolean,
  motionDirection: TrainerSettings["motionDirection"]
) => {
  const deltaSec =
    state.lastTimestamp <= 0
      ? 0
      : Math.min(80, Math.max(0, timestamp - state.lastTimestamp)) / 1000;
  const directionMultiplier = canToggleDirection ? motionDirection : 1;
  const nextElapsedSec = state.elapsedSec + deltaSec;
  const distancePx = integrateSpeedProfile(
    speedProfile,
    state.elapsedSec,
    nextElapsedSec,
    baseSpeedPxPerSec
  );

  state.lastTimestamp = timestamp;
  state.elapsedSec = nextElapsedSec;
  state.travelPx += distancePx * directionMultiplier;
};

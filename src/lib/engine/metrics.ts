import type { FpsStats } from "./types";

export const calculateFpsStats = (frameTimesMs: number[]): FpsStats => {
  if (frameTimesMs.length === 0) {
    return { average: 0, p95FrameMs: 0, droppedFrames: 0 };
  }

  let total = 0;
  let droppedFrames = 0;
  for (let index = 0; index < frameTimesMs.length; index += 1) {
    const value = frameTimesMs[index];
    total += value;
    if (value > 34) droppedFrames += 1;
  }
  const sorted = frameTimesMs.slice().sort((a, b) => a - b);
  const p95Index = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * 0.95),
  );
  const averageFrameMs = total / frameTimesMs.length;

  return {
    average: Math.round(1000 / averageFrameMs),
    p95FrameMs: Number(sorted[p95Index].toFixed(2)),
    droppedFrames,
  };
};

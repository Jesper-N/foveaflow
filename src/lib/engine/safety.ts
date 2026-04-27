export const MAX_SAFE_FLASHES_PER_SECOND = 3;

export const clampFlashFrequency = (requestedHz: number) => {
  return Math.min(MAX_SAFE_FLASHES_PER_SECOND, Math.max(0, requestedHz));
};

export const isFlashSequenceSafe = (flashTimesMs: number[]) => {
  const sortedTimes = [...flashTimesMs].sort((a, b) => a - b);
  return sortedTimes.every((start, index) => {
    const end = start + 1000;
    const flashesInWindow = sortedTimes
      .slice(index)
      .filter((time) => time >= start && time < end).length;
    return flashesInWindow <= MAX_SAFE_FLASHES_PER_SECOND;
  });
};

export const isSaturatedRed = (hexColor: string) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hexColor.trim());
  if (!match) return false;

  const value = match[1];
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return red >= 240 && green <= 32 && blue <= 32;
};

export const safeStimulusColor = (hexColor: string) => {
  if (isSaturatedRed(hexColor)) return "#ffb020";
  return hexColor;
};

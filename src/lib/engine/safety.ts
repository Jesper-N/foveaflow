const MAX_SAFE_FLASHES_PER_SECOND = 3;

export const isFlashSequenceSafe = (flashTimesMs: number[]) => {
  const sortedTimes = [...flashTimesMs].sort((a, b) => a - b);
  let windowStart = 0;

  for (let windowEnd = 0; windowEnd < sortedTimes.length; windowEnd += 1) {
    while (sortedTimes[windowEnd] - sortedTimes[windowStart] >= 1000) {
      windowStart += 1;
    }

    if (windowEnd - windowStart + 1 > MAX_SAFE_FLASHES_PER_SECOND) {
      return false;
    }
  }

  return true;
};

const parseHexColor = (hexColor: string) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hexColor.trim());
  if (!match) return null;

  const value = match[1];
  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
};

const toHexChannel = (value: number) => {
  return value.toString(16).padStart(2, "0");
};

const isSaturatedRed = (hexColor: string) => {
  const color = parseHexColor(hexColor);
  if (!color) return false;

  return color.red >= 240 && color.green <= 32 && color.blue <= 32;
};

export const safeStimulusColor = (hexColor: string) => {
  if (isSaturatedRed(hexColor)) return "#ffb020";
  return hexColor;
};

export const darkenHexColor = (hexColor: string, amount = 0.65) => {
  const color = parseHexColor(hexColor);
  if (!color) return "#4c8a00";

  const red = Math.round(color.red * amount);
  const green = Math.round(color.green * amount);
  const blue = Math.round(color.blue * amount);

  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`;
};

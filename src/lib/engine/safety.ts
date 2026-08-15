const parseHexColor = (hexColor: string) => {
  const match = /^#?(?<hex>[0-9a-f]{6})$/iu.exec(hexColor.trim());
  if (!match) {
    return null;
  }

  const [, value] = match;
  return {
    blue: Number.parseInt(value.slice(4, 6), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    red: Number.parseInt(value.slice(0, 2), 16),
  };
};

const toHexChannel = (value: number) => value.toString(16).padStart(2, "0");

const isSaturatedRed = (hexColor: string) => {
  const color = parseHexColor(hexColor);
  if (!color) {
    return false;
  }

  return color.red >= 240 && color.green <= 32 && color.blue <= 32;
};

export const safeStimulusColor = (hexColor: string) => {
  if (isSaturatedRed(hexColor)) {
    return "#ffb020";
  }
  return hexColor;
};

export const darkenHexColor = (hexColor: string, amount = 0.65) => {
  const color = parseHexColor(hexColor);
  if (!color) {
    return "#4c8a00";
  }

  const red = Math.round(color.red * amount);
  const green = Math.round(color.green * amount);
  const blue = Math.round(color.blue * amount);

  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`;
};

const HEX_COLOR_PATTERN = /^#(?<hex>[0-9a-f]{6})$/iu;

/** Replacement for saturated red, the color most likely to trigger photosensitive reactions. */
const SAFE_RED_REPLACEMENT = "#ffb020";
/** Used when a color to darken cannot be parsed. */
const FALLBACK_DARK_COLOR = "#4c8a00";

export const isHexColor = (value: string | null | undefined): value is string =>
  typeof value === "string" && HEX_COLOR_PATTERN.test(value);

const parseHexColor = (hexColor: string) => {
  const hex = HEX_COLOR_PATTERN.exec(hexColor)?.groups?.hex;
  if (!hex) {
    return null;
  }

  return {
    blue: Number.parseInt(hex.slice(4, 6), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    red: Number.parseInt(hex.slice(0, 2), 16),
  };
};

const toHexChannel = (value: number) => value.toString(16).padStart(2, "0");

/** Keeps moving targets away from saturated red. */
export const safeStimulusColor = (hexColor: string) => {
  const color = parseHexColor(hexColor);
  const isSaturatedRed =
    color !== null && color.red >= 240 && color.green <= 32 && color.blue <= 32;
  return isSaturatedRed ? SAFE_RED_REPLACEMENT : hexColor;
};

export const darkenHexColor = (hexColor: string, amount: number) => {
  const color = parseHexColor(hexColor);
  if (!color) {
    return FALLBACK_DARK_COLOR;
  }

  const red = toHexChannel(Math.round(color.red * amount));
  const green = toHexChannel(Math.round(color.green * amount));
  const blue = toHexChannel(Math.round(color.blue * amount));
  return `#${red}${green}${blue}`;
};

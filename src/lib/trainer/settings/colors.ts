const HEX_COLOR_PATTERN = /^#(?<hex>[0-9a-f]{6})$/iu;

/** Used when a color to fade cannot be parsed. */
const FALLBACK_FADED_COLOR = "#8a8a8a";

export const isHexColor = (value: string | null | undefined): value is string =>
  typeof value === "string" && HEX_COLOR_PATTERN.test(value);

const parseHexColor = (hexColor: string) => {
  const hex = HEX_COLOR_PATTERN.exec(hexColor)?.groups?.["hex"];

  if (hex === undefined) {
    return null;
  }

  return {
    blue: Number.parseInt(hex.slice(4, 6), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    red: Number.parseInt(hex.slice(0, 2), 16),
  };
};

const toHexChannel = (value: number) => value.toString(16).padStart(2, "0");

export const fadeHexColor = (
  hexColor: string,
  towardColor: string,
  amount: number
) => {
  const color = parseHexColor(hexColor);
  const toward = parseHexColor(towardColor);

  if (!color || !toward) {
    return FALLBACK_FADED_COLOR;
  }

  const mix = (from: number, to: number) =>
    toHexChannel(Math.round(to + (from - to) * amount));

  return `#${mix(color.red, toward.red)}${mix(color.green, toward.green)}${mix(color.blue, toward.blue)}`;
};

/** Ink that stays readable on top of a swatch of this color. */
export const inkOn = (hexColor: string) => {
  const color = parseHexColor(hexColor);

  if (!color) {
    return "#17181a";
  }

  const luminance =
    (0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue) / 255;

  return luminance > 0.6 ? "#17181a" : "#ffffff";
};

/** Near-white or near-black, so it can vanish into a light or dark surface. */
export const isNearlyNeutralEdge = (hexColor: string) => {
  const color = parseHexColor(hexColor);

  if (!color) {
    return false;
  }

  const luminance =
    (0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue) / 255;

  return luminance > 0.92 || luminance < 0.12;
};

export type Rng = {
  seed: number;
  next: () => number;
  range: (min: number, max: number) => number;
  randomAt: (index: number) => number;
  rangeAt: (index: number, min: number, max: number) => number;
};

export const normalizeSeed = (seed: number) => {
  const normalized = Math.trunc(Math.abs(seed)) % 2_147_483_647;
  return normalized === 0 ? 1 : normalized;
};

export const seededRandom = (seed: number, index: number) => {
  let value = normalizeSeed(seed + index * 374_761_393);
  value = (value ^ (value >>> 13)) * 1_274_126_177;
  value = (value ^ (value >>> 16)) >>> 0;
  return value / 4_294_967_295;
};

export const createRng = (seed: number): Rng => {
  let state = normalizeSeed(seed);

  const next = () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };

  const randomAt = (index: number) => seededRandom(seed, index);

  return {
    seed: normalizeSeed(seed),
    next,
    range: (min, max) => min + (max - min) * next(),
    randomAt,
    rangeAt: (index, min, max) => min + (max - min) * randomAt(index),
  };
};

export const seededRange = (
  seed: number,
  index: number,
  min: number,
  max: number,
) => {
  return min + (max - min) * seededRandom(seed, index);
};

export type Rng = {
  seed: number;
  randomAt: (index: number) => number;
  rangeAt: (index: number, min: number, max: number) => number;
};

const normalizeSeed = (seed: number) => {
  const normalized = Math.trunc(Math.abs(seed)) % 2_147_483_647;
  return normalized === 0 ? 1 : normalized;
};

export const createSessionSeed = (random = Math.random) => {
  return Math.floor(random() * 2_147_483_646) + 1;
};

const seededRandom = (seed: number, index: number) => {
  let value = normalizeSeed(seed + index * 374_761_393);
  value = Math.imul(value ^ (value >>> 13), 1_274_126_177);
  value = (value ^ (value >>> 16)) >>> 0;
  return value / 4_294_967_296;
};

export const createRng = (seed: number): Rng => {
  const randomAt = (index: number) => seededRandom(seed, index);

  return {
    seed: normalizeSeed(seed),
    randomAt,
    rangeAt: (index, min, max) => min + (max - min) * randomAt(index),
  };
};

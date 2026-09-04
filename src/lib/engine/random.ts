export interface Rng {
  seed: number;
  randomAt: (index: number) => number;
  rangeAt: (index: number, min: number, max: number) => number;
}

const normalizeSeed = (seed: number) => {
  const normalized = Math.trunc(Math.abs(seed)) % 2_147_483_647;
  return normalized === 0 ? 1 : normalized;
};

const RANDOM_MODULUS = 67_108_859;
const SEED_MULTIPLIER = 40_699;
const INDEX_MULTIPLIER = 48_271;
const RANDOM_OFFSET = 1_234_567;

export const createSessionSeed = (random = Math.random) =>
  Math.floor(random() * 2_147_483_646) + 1;

const seededRandom = (seedOffset: number, index: number) => {
  const normalizedIndex = Number.isFinite(index)
    ? Math.trunc(Math.abs(index)) % RANDOM_MODULUS
    : 0;
  const value =
    (seedOffset + normalizedIndex * INDEX_MULTIPLIER) % RANDOM_MODULUS;
  const squared = (value * value) % RANDOM_MODULUS;
  const cubed = (squared * value) % RANDOM_MODULUS;
  return cubed / RANDOM_MODULUS;
};

export const createRng = (seed: number): Rng => {
  const normalizedSeed = normalizeSeed(seed);
  const seedOffset = normalizedSeed * SEED_MULTIPLIER + RANDOM_OFFSET;
  const randomAt = (index: number) => seededRandom(seedOffset, index);

  return {
    randomAt,
    rangeAt: (index, min, max) => min + (max - min) * randomAt(index),
    seed: normalizedSeed,
  };
};

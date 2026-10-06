/**
 * Stateless seeded random numbers. The value at each index is fixed for a
 * seed, so samplers can read any number in any order and a drill replays
 * identically from the same seed.
 */
export interface Rng {
  readonly seed: number;
  /** Value in `[min, max)` for this index. */
  rangeAt: (index: number, min: number, max: number) => number;
}

const MAX_SEED = 2_147_483_647;
const RANDOM_MODULUS = 67_108_859;
const SEED_MULTIPLIER = 40_699;
const INDEX_MULTIPLIER = 48_271;
const RANDOM_OFFSET = 1_234_567;

const normalizeSeed = (seed: number) => {
  const normalized = Math.trunc(Math.abs(seed)) % MAX_SEED;
  return normalized === 0 ? 1 : normalized;
};

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

export const createSessionSeed = (random = Math.random) =>
  Math.floor(random() * (MAX_SEED - 1)) + 1;

export const createRng = (seed: number): Rng => {
  const normalizedSeed = normalizeSeed(seed);
  const seedOffset = normalizedSeed * SEED_MULTIPLIER + RANDOM_OFFSET;
  return {
    rangeAt: (index, min, max) =>
      min + (max - min) * seededRandom(seedOffset, index),
    seed: normalizedSeed,
  };
};

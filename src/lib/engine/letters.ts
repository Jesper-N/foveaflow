const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTER_INTERVAL_SEC = 2;
const DEFAULT_REACTION_JUMP_DISTANCE_PX = 420;

export const getLetterForBucket = (
  seed: number,
  objectIndex: number,
  bucket: number,
) => {
  const index = Math.abs(
    Math.trunc(seed) + Math.trunc(objectIndex) * 11 + Math.trunc(bucket) * 7,
  );
  return LETTERS[index % LETTERS.length];
};

export const getLetterBucket = (elapsedSec: number) =>
  Math.floor(Math.max(0, elapsedSec) / LETTER_INTERVAL_SEC);

export const getReactionLetterBucket = (
  travelPx: number,
  jumpDistancePx = DEFAULT_REACTION_JUMP_DISTANCE_PX,
) => Math.floor(Math.max(0, travelPx) / Math.max(1, jumpDistancePx));

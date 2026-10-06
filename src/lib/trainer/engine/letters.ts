const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTER_INTERVAL_SEC = 2;

/**
 * The letter shown on an object while `bucket` is current. Every object gets
 * its own letter, and all letters change together when the bucket changes.
 */
export const letterAt = (seed: number, objectIndex: number, bucket: number) => {
  const index = Math.abs(
    Math.trunc(seed) + Math.trunc(objectIndex) * 11 + Math.trunc(bucket) * 7
  );
  return LETTERS[index % LETTERS.length];
};

/** Letters on moving targets change every two seconds. */
export const timeLetterBucket = (elapsedSec: number) =>
  Math.floor(Math.max(0, elapsedSec) / LETTER_INTERVAL_SEC);

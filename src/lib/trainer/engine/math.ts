export const TAU = Math.PI * 2;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Remainder that is never negative, unlike the `%` operator. */
export const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

/** Folds `value` back and forth across `[0, length]`, like a ball between two walls. */
export const pingPong = (value: number, length: number) => {
  if (length <= 0) {
    return 0;
  }
  const wrapped = positiveModulo(value, length * 2);
  return wrapped <= length ? wrapped : length * 2 - wrapped;
};

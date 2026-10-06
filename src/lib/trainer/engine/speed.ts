// Speed is a whole number from 1 to 100: degrees of visual angle per second
// at a 60 cm viewing distance on a standard 96 dpi screen (37.8 CSS px per cm).
const VIEWING_DISTANCE_CM = 60;
const CSS_PX_PER_CM = 37.8;

export const speedToPixelsPerSecond = (speed: number) => {
  const degrees = Number.isFinite(speed) ? Math.max(0, speed) : 0;
  const cm = 2 * VIEWING_DISTANCE_CM * Math.tan((degrees * Math.PI) / 360);
  return cm * CSS_PX_PER_CM;
};

/** Converts a speed saved in cm/s, before speed became a plain number. */
export const centimetersPerSecondToSpeed = (cmPerSecond: number) =>
  (Math.atan(cmPerSecond / (2 * VIEWING_DISTANCE_CM)) * 360) / Math.PI;

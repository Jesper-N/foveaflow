/**
 * Keeps a target at the same relative spot along its route when the route
 * changes size, for example when the window is resized mid-drill.
 * `PatternSampler` checks that every input is finite.
 */
export class ScaledTravel {
  #routeSizePx: number | null = null;
  #offsetPx = 0;

  /**
   * Returns `travelPx` adjusted for every resize so far. `routeSizePx` is any
   * length that scales with the route, such as its width or radius.
   */
  resolve(travelPx: number, routeSizePx: number) {
    const previousSizePx = this.#routeSizePx;
    if (previousSizePx === null) {
      this.#routeSizePx = routeSizePx;
      return travelPx;
    }

    if (routeSizePx !== previousSizePx) {
      this.#offsetPx =
        previousSizePx > 0 && routeSizePx > 0
          ? ((travelPx + this.#offsetPx) / previousSizePx) * routeSizePx -
            travelPx
          : 0;
      this.#routeSizePx = routeSizePx;
    }

    return travelPx + this.#offsetPx;
  }
}

const IDLE_DELAY_MS = 2000;

/** Hides the mouse cursor over the drill once it rests for two seconds. */
export class IdleCursor {
  hidden = $state(false);
  #timeout: number | undefined;
  #deadline = 0;

  /** Shows the cursor and restarts the idle countdown. */
  wake() {
    this.hidden = false;
    this.#deadline = performance.now() + IDLE_DELAY_MS;
    // Movement only pushes the deadline back, so one timer runs per idle period.
    this.#timeout ??= window.setTimeout(this.#hideWhenIdle, IDLE_DELAY_MS);
  }

  stop() {
    window.clearTimeout(this.#timeout);
    this.#timeout = undefined;
    this.#deadline = 0;
  }

  #hideWhenIdle = () => {
    const remainingMs = this.#deadline - performance.now();
    if (remainingMs > 0) {
      this.#timeout = window.setTimeout(this.#hideWhenIdle, remainingMs);
      return;
    }
    this.#timeout = undefined;
    this.hidden = true;
  };
}

import { bind, play, setEnabled, setTheme, unlock } from "cuelume";
import type { PlayOptions, SoundName } from "cuelume";
import { on } from "svelte/events";

const STORAGE_KEY = "foveaflow-sound";
const MUTE_AFTER_MS = 400;
const SLIDE_GAP_MS = 150;

/** bencho's slider tick sits under Cuelume's cues once it is 1.2× louder. */
const SLIDE_MIX = 1.2;

/** bencho's slider tick: one soft sine that glides down a little as it fades. */
const DRAG = {
  attackMs: 28,
  fromHz: 174,
  gain: 0.034,
  lowpassHz: 640,
  ms: 250,
  toHz: 155,
} as const;

/** Value changes that come from code or the browser, not from a person. */
const silentReasons = new Set(["imperative", "reset", "restore"]);

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

class Sound {
  enabled = $state(true);
  #started = false;
  #lastSlide = Number.NEGATIVE_INFINITY;
  #muteTimer: number | undefined;
  #context: AudioContext | undefined;
  #stopWarmUp: (() => void) | undefined;

  /** Reads the saved choice and binds the `data-cuelume-*` fields. Runs once per page. */
  start() {
    if (this.#started) {
      return;
    }

    this.#started = true;

    this.enabled = readSaved();
    setEnabled(this.enabled);
    setTheme("bubble");
    bind();

    const stops = ["pointerdown", "keydown"].map((type) =>
      on(window, type, this.#warmUp, { capture: true })
    );

    this.#stopWarmUp = () => {
      for (const stop of stops) {
        stop();
      }
    };
  }

  /**
   * Browsers start audio only after a press or a key, never on hover. The
   * first one starts both engines, so every later sound, hover included,
   * plays at once.
   */
  readonly #warmUp = () => {
    this.#stopWarmUp?.();

    if (this.enabled) {
      void unlock();
      this.#context ??= new AudioContext();
      void this.#context.resume();
    }
  };

  /** Turning sound off lets the switch's own off cue finish first. */
  setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
    window.clearTimeout(this.#muteTimer);

    if (enabled) {
      setEnabled(true);
      void unlock();
      play("toggle");
    } else {
      this.#muteTimer = window.setTimeout(() => {
        setEnabled(false);
      }, MUTE_AFTER_MS);
    }

    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // Browser privacy settings can block storage.
    }
  };

  /**
   * A slider moved, at `position` from 0 (its start) to 1 (its end). The
   * pitch follows the thumb, from 0.75× at the start to 1.5× at the end, and
   * moves closer than the gap stay silent, so a slow drag ticks with each step
   * and a fast one rolls at about seven a second.
   */
  slide = (position: number) => {
    const now = performance.now();

    if (now - this.#lastSlide < SLIDE_GAP_MS) {
      return;
    }

    this.#lastSlide = now;
    this.#playTone(0.75 + Math.min(1, Math.max(0, position)) * 0.75);
  };

  #playTone(bend: number) {
    if (!this.enabled) {
      return;
    }

    this.#context ??= new AudioContext();

    const context = this.#context;

    if (context.state !== "running") {
      void context.resume();
    }

    const start = context.currentTime;
    const end = start + DRAG.ms / 1000;
    const oscillator = context.createOscillator();
    const lowpass = context.createBiquadFilter();
    const envelope = context.createGain();

    oscillator.frequency.setValueAtTime(DRAG.fromHz * bend, start);
    oscillator.frequency.exponentialRampToValueAtTime(DRAG.toHz * bend, end);
    lowpass.type = "lowpass";
    lowpass.frequency.value = DRAG.lowpassHz;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      DRAG.gain * SLIDE_MIX,
      start + DRAG.attackMs / 1000
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(lowpass).connect(envelope).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

export const sound = new Sound();

export const cue = (name: SoundName, options?: PlayOptions) => {
  play(name, options);
};

/** A choice in a row or list: later options rise, earlier ones fall. */
export const cueChoice = (from: number, to: number) => {
  if (from !== to) {
    play("select", { direction: to < from ? "back" : "forward" });
  }
};

export const isPersonChange = (details: { reason: string }) =>
  !silentReasons.has(details.reason);

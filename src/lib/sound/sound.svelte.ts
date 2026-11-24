import { bind, play, setEnabled, unlock } from "cuelume";
import type { PlayOptions, SoundName } from "cuelume";

const STORAGE_KEY = "foveaflow-sound";
const STEP_GAP_MS = 150;
const MUTE_AFTER_MS = 400;

type Direction = NonNullable<PlayOptions["direction"]>;

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
  #lastStep = 0;
  #muteTimer: number | undefined;

  /** Reads the saved choice and binds the `data-cuelume-*` fields. Runs once per page. */
  start() {
    if (this.#started) {
      return;
    }

    this.#started = true;

    this.enabled = readSaved();
    setEnabled(this.enabled);
    bind();
  }

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

  /** One step of a slider or a held arrow key. Steps closer than the gap stay silent. */
  step = (direction: Direction) => {
    const now = performance.now();

    if (now - this.#lastStep < STEP_GAP_MS) {
      return;
    }

    this.#lastStep = now;
    play("select", { direction, emphasis: "subtle" });
  };
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

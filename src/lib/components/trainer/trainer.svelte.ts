import {
  findDrillRoute,
  routeForDrill,
  slugFromPath,
} from "$lib/content/drill-routes";
import { homeCopy } from "$lib/content/home";
import { siteMetadata } from "$lib/content/site";
import { languageState } from "$lib/i18n/state.svelte";
import { syncDocumentHead } from "$lib/seo/document-head";
import { getCanvasTheme } from "$lib/trainer/canvas/theme";
import type { ColorMode } from "$lib/trainer/canvas/theme";
import { TrainerCanvas } from "$lib/trainer/canvas/trainer-canvas";
import type { CanvasScene } from "$lib/trainer/canvas/trainer-canvas";
import {
  behaviorFromProfiles,
  isBehaviorId,
  profilesForBehavior,
} from "$lib/trainer/settings/behaviors";
import {
  darkenHexColor,
  isHexColor,
  safeStimulusColor,
} from "$lib/trainer/settings/colors";
import {
  isLetterWeight,
  isLilacChaserColor,
  isTargetForm,
} from "$lib/trainer/settings/options";
import { isPursuitPattern, isReversible } from "$lib/trainer/settings/patterns";
import {
  clampSetting,
  createDefaultSettings,
  resetToDefaults,
  withDrill,
  withPattern,
  withRoute,
} from "$lib/trainer/settings/settings";
import type {
  RangedSetting,
  TrainerSettings,
} from "$lib/trainer/settings/settings";
import { SettingsSaver, loadSettings } from "$lib/trainer/settings/storage";
import { createSelectController } from "@ui-sdk/svelte/select";
import { mode, setMode } from "mode-watcher";
import { untrack } from "svelte";
import type { Attachment } from "svelte/attachments";

import { startAgentBridge } from "../agent-bridge";
import { IdleCursor } from "./idle-cursor.svelte";
import { getShortcutAction, isKeyCapturedBy } from "./shortcuts";
import type { ShortcutAction } from "./shortcuts";

/**
 * State and actions for the trainer page: the settings, the drill canvas,
 * the URL, and every panel and menu. Components get it from context and call
 * its methods instead of changing settings directly where a change needs
 * validation or side effects.
 */
export class Trainer {
  settings = $state<TrainerSettings>(createDefaultSettings());
  /** Slug of the page the browser is on, like `circle`. Empty on the homepage. */
  routeSlug = $state("");
  motionPaused = $state(false);
  controlsOpen = $state(false);
  guideOpen = $state(false);
  islandExpanded = $state(false);
  panelReturnFocus = $state.raw<HTMLElement | "none">("none");

  readonly cursor = new IdleCursor();
  /** Open the drill and path menus from the M and P shortcuts. */
  readonly drillSelect = createSelectController<unknown>();
  readonly patternSelect = createSelectController<unknown>();

  /** Settings save only after the saved ones have loaded, so defaults never overwrite them. */
  #settingsLoaded = $state(false);
  readonly #saver = new SettingsSaver();
  readonly #canvas = new TrainerCanvas(() => this.#scene);

  colorMode = $derived.by((): ColorMode => {
    const { current } = mode;

    if (current === "light" || current === "dark") {
      return current;
    }

    // Before mode-watcher resolves, trust the class its head script set.
    const root = globalThis.document?.documentElement;

    return root !== undefined && !root.classList.contains("dark")
      ? "light"
      : "dark";
  });

  targetColor = $derived(
    safeStimulusColor(
      this.settings.ballColor ?? getCanvasTheme(this.colorMode).targetColor
    )
  );

  distractorColor = $derived(
    darkenHexColor(this.targetColor, this.settings.distractorBrightness)
  );

  route = $derived(findDrillRoute(this.routeSlug));
  pageCopy = $derived(this.route?.copy ?? homeCopy);
  /** On a drill page, the guide follows the drill that is actually selected. */
  guideRoute = $derived.by(() => {
    const { route, settings } = this;

    if (!route) {
      return null;
    }

    const isCurrent =
      route.drillId === settings.drillId &&
      (route.patternId === undefined || route.patternId === settings.patternId);

    return isCurrent
      ? route
      : (routeForDrill(settings.drillId, settings.patternId) ?? route);
  });

  guideLastModified = $derived(
    this.guideRoute?.lastModified ?? siteMetadata.homepageLastModified
  );

  behavior = $derived(
    behaviorFromProfiles(this.settings.speedProfile, this.settings.sizeProfile)
  );

  canReverse = $derived(isReversible(this.settings.patternId));
  isPursuit = $derived(this.settings.drillId === "pursuit");
  isDistractions = $derived(this.settings.drillId === "mot");
  isLilacChaser = $derived(this.settings.drillId === "lilacChaser");

  /** The panels cover the drill, so it holds still while one is open. */
  readonly #canvasPaused = $derived(
    this.motionPaused || this.controlsOpen || this.guideOpen
  );
  readonly #snapshot = $derived($state.snapshot(this.settings));
  readonly #scene = $derived<CanvasScene>({
    colorMode: this.colorMode,
    distractorColor: this.distractorColor,
    paused: this.#canvasPaused,
    settings: this.#snapshot,
    targetColor: this.targetColor,
  });

  constructor(routeSlug: string) {
    this.routeSlug = routeSlug;
    this.settings = withRoute(this.settings, findDrillRoute(routeSlug));

    $effect(() => {
      if (this.#settingsLoaded) {
        this.#saver.schedule(this.#snapshot);
      }
    });

    // The canvas runs its own loop; these effects keep it in step with state.
    $effect(() => {
      // Reading the paused state subscribes this effect to it.
      void this.#canvasPaused;
      untrack(() => {
        this.#canvas.syncPlayback();
      });
    });
    $effect(() => {
      const { paused, settings } = this.#scene;

      // Moving drills repaint every frame anyway. A paused drill, or the
      // stepping Lilac Chaser, repaints only when asked, so ask on each change.
      // A paused drill also drops its old trail.
      if (paused || settings.drillId === "lilacChaser") {
        untrack(() => {
          this.#canvas.requestDraw({ clearTrail: paused });
        });
      }
    });
  }

  /** Loads saved settings and starts browser-only work. Returns the cleanup. */
  mount() {
    this.#followBrowserRoute(loadSettings() ?? this.settings);
    this.#settingsLoaded = true;

    void languageState.init();
    startAgentBridge();
    this.cursor.wake();

    // Pause for visitors who ask for less motion. They can still press play.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const pauseForReducedMotion = () => {
      if (reducedMotion.matches) {
        this.motionPaused = true;
      }
    };

    pauseForReducedMotion();
    reducedMotion.addEventListener("change", pauseForReducedMotion);

    return () => {
      reducedMotion.removeEventListener("change", pauseForReducedMotion);
      this.#saver.flush();
      this.cursor.stop();
    };
  }

  // Untracked so the canvas attaches once, not again on every state change
  // the canvas reads while starting.
  attachCanvas: Attachment<HTMLCanvasElement> = (canvas) =>
    untrack(() => this.#canvas.attach(canvas));

  selectDrill = (drillId: string) => {
    this.settings = withDrill(this.settings, drillId);
    this.#startNewPattern();
  };

  selectPattern = (patternId: string) => {
    if (isPursuitPattern(patternId)) {
      this.settings = withPattern(this.settings, patternId);
      this.#startNewPattern();
    }
  };

  selectBehavior = (behavior: string) => {
    if (isBehaviorId(behavior)) {
      Object.assign(this.settings, profilesForBehavior(behavior));
    }
  };

  setRanged = (setting: RangedSetting, value: number) => {
    if (Number.isFinite(value)) {
      this.settings[setting] = clampSetting(setting, value);
    }
  };

  setBallColor = (color: string) => {
    this.settings.ballColor = safeStimulusColor(color);
  };

  setLetterColor = (color: string) => {
    if (isHexColor(color)) {
      this.settings.letterColor = color;
    }
  };

  setLetterWeight = (weight: string) => {
    const value = Number(weight);

    if (isLetterWeight(value)) {
      this.settings.letterWeight = value;
    }
  };

  setTargetForm = (form: string) => {
    if (isTargetForm(form)) {
      this.settings.targetForm = form;
    }
  };

  setLilacChaserColor = (color: string) => {
    if (isLilacChaserColor(color)) {
      this.settings.lilacChaserBallColor = color;
    }
  };

  setDirection = (direction: string) => {
    if (
      this.canReverse &&
      (direction === "forward" || direction === "reverse")
    ) {
      this.settings.motionDirection = direction === "forward" ? 1 : -1;
    }
  };

  toggleDirection = () => {
    if (this.canReverse) {
      this.settings.motionDirection =
        this.settings.motionDirection === 1 ? -1 : 1;
    }
  };

  togglePaused = () => {
    this.motionPaused = !this.motionPaused;
  };

  resetSettings = () => {
    this.settings = resetToDefaults(this.settings);
    this.#canvas.restart();
    this.#pushRoute();
  };

  openControls = () => {
    this.#rememberFocus();
    this.controlsOpen = true;
  };

  openGuide = () => {
    this.#rememberFocus();
    this.guideOpen = true;
  };

  #rememberFocus() {
    const { activeElement } = document;

    this.panelReturnFocus =
      activeElement instanceof HTMLElement &&
      activeElement !== document.body &&
      activeElement.closest("[role='dialog']") === null
        ? activeElement
        : "none";
  }

  handleKeydown = (event: KeyboardEvent) => {
    const action = getShortcutAction(event);

    if (!action || isKeyCapturedBy(event.target)) {
      return;
    }

    if (this.#runShortcut(action)) {
      event.preventDefault();
    }
  };

  /** Wakes the hidden cursor when the mouse moves. */
  handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      this.cursor.wake();
    }
  };

  handlePopState = () => {
    this.#followBrowserRoute(this.settings);
    this.#canvas.requestDraw({ clearTrail: true });
  };

  handleVisibilityChange = () => {
    this.#canvas.handleVisibilityChange();
  };

  /** Saves pending settings right away, for when the page goes away. */
  flushSettings = () => {
    this.#saver.flush();
  };

  #runShortcut(action: ShortcutAction) {
    switch (action) {
      case "togglePause": {
        this.togglePaused();

        return true;
      }

      case "growTarget":
      case "shrinkTarget": {
        const delta = action === "growTarget" ? 1 : -1;
        this.setRanged("baseRadiusPx", this.settings.baseRadiusPx + delta);

        return true;
      }

      case "speedUp":
      case "slowDown": {
        const delta = action === "speedUp" ? 1 : -1;
        this.setRanged("speed", this.settings.speed + delta);

        return true;
      }

      case "toggleTheme": {
        setMode(this.colorMode === "dark" ? "light" : "dark");

        return true;
      }

      case "openDrillSelect": {
        this.islandExpanded = true;
        this.drillSelect.setOpen(true);

        return true;
      }

      case "openPatternSelect": {
        if (!this.isPursuit) {
          return false;
        }

        this.islandExpanded = true;
        this.patternSelect.setOpen(true);

        return true;
      }

      case "openControls": {
        this.openControls();

        return true;
      }

      case "openGuide": {
        this.openGuide();

        return true;
      }

      default: {
        throw new Error(
          `Unsupported shortcut: ${String(action satisfies never)}`
        );
      }
    }
  }

  /** Restarts motion after the drill or path changed, and updates the URL. */
  #startNewPattern() {
    this.#canvas.resetPattern();
    this.#canvas.requestDraw({ clearTrail: true });
    this.#pushRoute();
  }

  /** Applies the drill of the page the browser is on, like after Back. */
  #followBrowserRoute(baseSettings: TrainerSettings) {
    const { pathname } = window.location;
    this.routeSlug = slugFromPath(pathname);
    this.settings = withRoute(baseSettings, findDrillRoute(this.routeSlug));
    this.#canvas.resetPattern();
    syncDocumentHead(pathname);
  }

  /** Puts the selected drill in the URL so it can be shared and bookmarked. */
  #pushRoute() {
    const route = routeForDrill(this.settings.drillId, this.settings.patternId);
    const path = route?.path ?? "/";
    this.routeSlug = slugFromPath(path);

    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }

    syncDocumentHead(path);
  }
}

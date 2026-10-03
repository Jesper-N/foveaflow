import { homepageSeoContent } from "$lib/content/page-copy";
import { siteMetadata } from "$lib/content/site";
import {
  findTrainerRoute,
  getRouteSlugFromPath,
  getTrainerRoute,
} from "$lib/content/trainer-routes";
import type { TrainerRoute } from "$lib/content/trainer-routes";
import { getTrainingModeGuide } from "$lib/content/training";
import { firstPreset, settingsFromPreset } from "$lib/engine/presets";
import type { TrainerSettings } from "$lib/engine/presets";
import { darkenHexColor, safeStimulusColor } from "$lib/engine/safety";
import {
  createDebouncedSettingsSaver,
  loadSettings,
} from "$lib/engine/storage";
import type { PatternId } from "$lib/engine/types";
import { languageState } from "$lib/i18n/state.svelte";
import { t } from "$lib/i18n/translate";
import { buildStructuredData, buildTrainerRouteStructuredData } from "$lib/seo";
import {
  createCursorAutoHideTimer,
  createHudAutoHideTimer,
} from "$lib/trainer/auto-hide";
import {
  createBehaviorProfiles,
  getBehaviorId,
  isBehaviorId,
} from "$lib/trainer/behavior";
import { createTrainerCanvasRuntime } from "$lib/trainer/canvas-runtime";
import type {
  TrainerDialogActions,
  TrainerHudActions,
} from "$lib/trainer/control-actions";
import { getHudPointerIntent } from "$lib/trainer/hud";
import type { HudBounds } from "$lib/trainer/hud";
import {
  getTrainerShortcutAction,
  isTrainerShortcutCapturedByTarget,
} from "$lib/trainer/keyboard";
import type { TrainerShortcutAction } from "$lib/trainer/keyboard";
import {
  canPatternToggleDirection,
  controlSections,
} from "$lib/trainer/options";
import type { ControlSectionId } from "$lib/trainer/options";
import type { CanvasColorMode } from "$lib/trainer/rendering";
import { getThemeTargetColor } from "$lib/trainer/rendering";
import {
  adjustSpeedBySteps,
  applyPresetToSettings,
  applyRouteToSettings,
  isHexColor,
  isLetterWeight,
  isLilacChaserBallColor,
  isPatternId,
  isTargetForm,
  resolveSliderInteger,
  resolveSliderNumber,
  resetSettingsToPresetDefaults,
  resolveStoredSettings,
  trainerSettingBounds,
} from "$lib/trainer/settings";
import type { TrainerSliderValue } from "$lib/trainer/settings";
import {
  focusHeaderSelectTriggerFromShortcut,
  getHeaderSelectOpenState,
  runTrainerShortcutAction,
  shortcutPrioritySurfaceSelector,
} from "$lib/trainer/shortcut-runner";
import type { HeaderShortcutSelect } from "$lib/trainer/shortcut-runner";
import { mode, setMode } from "mode-watcher";
import { tick as flushSvelte, untrack } from "svelte";
import type { Attachment } from "svelte/attachments";

const applySliderInteger = (
  value: TrainerSliderValue,
  bounds: { min: number; max: number },
  applyValue: (value: number) => void
) => {
  const next = resolveSliderInteger(value, bounds.min, bounds.max);
  if (next !== null) {
    applyValue(next);
  }
};

const applySliderNumber = (
  value: TrainerSliderValue,
  bounds: { min: number; max: number },
  applyValue: (value: number) => void
) => {
  const next = resolveSliderNumber(value, bounds.min, bounds.max);
  if (next !== null) {
    applyValue(next);
  }
};

const setMetaContent = (selector: string, content: string) => {
  document.head
    .querySelector<HTMLMetaElement>(selector)
    ?.setAttribute("content", content);
};

const syncDocumentRouteMetadata = (path: string) => {
  const route = findTrainerRoute(getRouteSlugFromPath(path));
  const title = route?.title ?? siteMetadata.title;
  const description = route?.description ?? siteMetadata.description;
  const siteOrigin = new URL(window.location.origin);
  const canonicalUrl = new URL(route?.path ?? "/", siteOrigin).toString();
  const robots =
    route?.indexable === false
      ? "noindex,follow"
      : "index,follow,max-image-preview:large";

  document.title = title;
  document.head
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute("href", canonicalUrl);
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[name="robots"]', robots);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', canonicalUrl);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);

  let structuredData:
    | ReturnType<typeof buildStructuredData>
    | ReturnType<typeof buildTrainerRouteStructuredData>
    | undefined = buildStructuredData(siteOrigin);
  if (route) {
    structuredData = route.indexable
      ? buildTrainerRouteStructuredData(route, siteOrigin)
      : undefined;
  }

  let structuredDataElement = document.head.querySelector<HTMLScriptElement>(
    "script[data-seo-structured-data]"
  );
  if (!structuredData) {
    structuredDataElement?.remove();
    return;
  }
  if (!structuredDataElement) {
    structuredDataElement = document.createElement("script");
    structuredDataElement.type = "application/ld+json";
    structuredDataElement.dataset.seoStructuredData = "";
    document.head.append(structuredDataElement);
  }
  structuredDataElement.textContent = JSON.stringify(structuredData);
};

const getGuideRoute = (route: TrainerRoute, settings: TrainerSettings) =>
  route.mode === settings.presetId &&
  (route.patternId === undefined || route.patternId === settings.patternId)
    ? route
    : (getTrainerRoute(settings.presetId, settings.patternId) ?? route);

export const createTrainerAppController = (getRouteSlug: () => string) => {
  const hudAutoHideDelayMs = 3500;
  const hudInitialRevealMs = 1800;
  const hudPointerRevealDelayMs = 120;
  const cursorHideDelayMs = 2000;

  let settings = $state<TrainerSettings>(
    applyRouteToSettings(settingsFromPreset(firstPreset), untrack(getRouteSlug))
  );
  let currentRouteSlug = $state(untrack(getRouteSlug));
  let panelOpen = $state(false);
  let activeControlSection = $state<ControlSectionId>("targets");
  let guideOpen = $state(false);
  let hudBounds = $state<HudBounds | null>(null);
  let motionPaused = $state(false);
  let storageReady = $state(false);
  let hudAutoHideReady = $state(false);
  let hudVisible = $state(true);
  let hudElementInteractionActive = $state(false);
  let lastPointerWasTouch = false;
  let hudPointerRevealTimeout: number | undefined;
  let cursorHidden = $state(false);
  const headerSelects = $state({
    lilacChaserColorSelectOpen: false,
    patternSelectOpen: false,
    presetSelectOpen: false,
  });
  let languageSelectOpen = $state(false);
  const overlayOpen = $derived(
    panelOpen ||
      guideOpen ||
      languageSelectOpen ||
      Object.values(headerSelects).some(Boolean)
  );
  const colorMode = $derived.by<CanvasColorMode>(() => {
    const nextMode = mode.current;
    if (nextMode === "light" || nextMode === "dark") {
      return nextMode;
    }

    const browserDocument = globalThis.document;
    return browserDocument &&
      !browserDocument.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
  });

  let themeTargetColor = $state("#000000");
  const safeBallColor = $derived(
    safeStimulusColor(settings.ballColor ?? themeTargetColor)
  );
  const locale = $derived(languageState.locale);
  const localeReady = $derived(languageState.ready);
  const activeRoute = $derived(findTrainerRoute(currentRouteSlug));
  const pageSeoContent = $derived(
    activeRoute?.seoContent ?? homepageSeoContent
  );
  const guideRoute = $derived(
    activeRoute ? getGuideRoute(activeRoute, settings) : null
  );
  const guideSeoContent = $derived(guideRoute?.seoContent ?? pageSeoContent);
  const guideLastModified = $derived(
    guideRoute?.lastModified ?? siteMetadata.homepageLastModified
  );
  const canToggleDirection = $derived(
    canPatternToggleDirection(settings.patternId)
  );
  const motionDirectionLabel = $derived(
    settings.motionDirection === 1 ? t(locale, "forward") : t(locale, "reverse")
  );
  const motionDirectionToggleLabel = $derived(
    settings.motionDirection === 1
      ? t(locale, "Reverse motion direction")
      : t(locale, "Use forward motion direction")
  );
  const distractorColor = $derived(
    darkenHexColor(safeBallColor, settings.distractorBrightness)
  );
  const isMotMode = $derived(settings.presetId === "mot");
  const isLilacChaserMode = $derived(settings.presetId === "lilacChaser");
  const localizedControlSections = $derived(
    controlSections.map((section) => ({
      ...section,
      label: t(locale, section.label),
    }))
  );
  const currentControlSection = $derived(
    localizedControlSections.find(
      (section) => section.id === activeControlSection
    ) ?? localizedControlSections[0]
  );
  const activeTrainingModeGuide = $derived(
    getTrainingModeGuide(settings.presetId)
  );
  const isDarkMode = $derived(colorMode === "dark");
  const settingsSnapshot = $derived($state.snapshot(settings));
  // The controls and the guide cover the drill with a blurred overlay, so the
  // canvas holds its frame instead of animating under them.
  const canvasPaused = $derived(motionPaused || panelOpen || guideOpen);
  const canvasState = $derived({
    canToggleDirection,
    distractorColor,
    isLilacChaserMode,
    motionPaused: canvasPaused,
    safeBallColor,
    settings: settingsSnapshot,
  });
  const canvasRuntime = createTrainerCanvasRuntime({
    getColorMode: () => colorMode,
    getState: () => canvasState,
  });
  const {
    attachCanvas,
    drawFrame,
    handleVisibilityChange,
    invalidateLilacChaserFrame,
    normalizeMotionDirection,
    redrawForTheme,
    resetMotion,
    resetPatternState,
    syncPlayback,
  } = canvasRuntime;
  const attachCanvasOnce: Attachment<HTMLCanvasElement> = (node) =>
    untrack(() => {
      themeTargetColor = getThemeTargetColor(node);
      return attachCanvas(node);
    });

  const behaviorValue = $derived(
    getBehaviorId(settings.speedProfile, settings.sizeProfile)
  );
  const hudInteractionOpen = $derived(
    hudElementInteractionActive || overlayOpen
  );
  const hudHidden = $derived(
    hudAutoHideReady && !hudVisible && !hudInteractionOpen
  );
  const hudAutoHideTimer = createHudAutoHideTimer({
    delayMs: hudAutoHideDelayMs,
    isInteractionOpen: () => hudInteractionOpen,
    setReady: (ready) => {
      hudAutoHideReady = ready;
    },
    setVisible: (visible) => {
      hudVisible = visible;
    },
  });
  const cursorAutoHideTimer = createCursorAutoHideTimer({
    delayMs: cursorHideDelayMs,
    setHidden: (hidden) => {
      cursorHidden = hidden;
    },
  });
  let hudShell: HTMLDivElement | undefined;
  const settingsSaver = createDebouncedSettingsSaver();

  const resetDirectionForFixedPatterns = (patternId: PatternId) => {
    settings.motionDirection = normalizeMotionDirection(
      patternId,
      settings.motionDirection
    );
  };

  const setMotionPaused = (paused: boolean) => {
    motionPaused = paused;
    syncPlayback();
  };

  const handleReduceMotionChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      setMotionPaused(true);
    }
  };

  const setPanelOpen = (open: boolean) => {
    panelOpen = open;
    syncPlayback();
  };

  const setGuideOpen = (open: boolean) => {
    guideOpen = open;
    syncPlayback();
  };

  const revealHud = () => {
    hudVisible = true;
  };

  const cancelHudPointerReveal = () => {
    window.clearTimeout(hudPointerRevealTimeout);
    hudPointerRevealTimeout = undefined;
  };

  // A short hover intent keeps a cursor drifting past the top edge from
  // popping the controls over the drill.
  const revealHudAfterPointerIntent = () => {
    if (hudVisible || hudPointerRevealTimeout !== undefined) {
      return;
    }
    hudPointerRevealTimeout = window.setTimeout(() => {
      hudPointerRevealTimeout = undefined;
      revealHud();
    }, hudPointerRevealDelayMs);
  };

  $effect(() => {
    if (!storageReady) {
      return;
    }
    settingsSaver.schedule(settingsSnapshot);
  });

  const syncSettingsFromBrowserRoute = (baseSettings = settings) => {
    const browserRouteSlug = getRouteSlugFromPath(window.location.pathname);
    currentRouteSlug = browserRouteSlug;
    settings = applyRouteToSettings(baseSettings, browserRouteSlug);
    resetPatternState();
    resetDirectionForFixedPatterns(settings.patternId);
    syncDocumentRouteMetadata(window.location.pathname);
  };

  const handlePopState = () => {
    syncSettingsFromBrowserRoute();
    drawFrame({ clearTrail: true });
  };

  const attachTrainer: Attachment<HTMLElement> = () =>
    untrack(() => {
      let mounted = true;
      const startHudWhenLanguageReady = async () => {
        await languageState.init();
        if (mounted) {
          hudAutoHideTimer.start(hudInitialRevealMs);
        }
      };
      const savedSettings = loadSettings();
      syncSettingsFromBrowserRoute(
        savedSettings ? resolveStoredSettings(savedSettings) : settings
      );

      storageReady = true;
      const themeObserver = new MutationObserver(() => {
        themeTargetColor = getThemeTargetColor(document.documentElement);
      });
      themeObserver.observe(document.documentElement, {
        attributeFilter: ["class", "style"],
      });
      void startHudWhenLanguageReady();
      cursorAutoHideTimer.start();

      const reduceMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );
      if (reduceMotionQuery.matches) {
        setMotionPaused(true);
      }
      reduceMotionQuery.addEventListener("change", handleReduceMotionChange);

      return () => {
        mounted = false;
        themeObserver.disconnect();
        settingsSaver.flush();
        hudAutoHideTimer.clear();
        cancelHudPointerReveal();
        cursorAutoHideTimer.clear();
        reduceMotionQuery.removeEventListener(
          "change",
          handleReduceMotionChange
        );
      };
    });

  const speedSliderValue = () => [settings.speed];

  const attachHudShell: Attachment<HTMLDivElement> = (node) => {
    hudShell = node;
    const updateBounds = () => {
      const rect = node.getBoundingClientRect();
      hudBounds = { left: rect.left, right: rect.right };
    };
    const resizeObserver = new ResizeObserver(updateBounds);
    const measurementFrame = requestAnimationFrame(updateBounds);

    resizeObserver.observe(node);
    window.addEventListener("resize", updateBounds);

    return () => {
      if (hudShell === node) {
        hudShell = undefined;
      }
      if (!hudShell) {
        hudBounds = null;
      }
      cancelAnimationFrame(measurementFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  };

  const setSpeedSliderValue = (value: TrainerSliderValue) => {
    const next = resolveSliderInteger(
      value,
      trainerSettingBounds.speed.min,
      trainerSettingBounds.speed.max
    );
    if (next !== null) {
      settings.speed = next;
    }
  };

  const sizeSliderValue = () => [settings.baseRadiusPx];

  const setSizeSliderValue = (value: TrainerSliderValue) => {
    applySliderNumber(value, trainerSettingBounds.baseRadiusPx, (next) => {
      settings.baseRadiusPx = next;
    });
  };

  const lilacChaserScaleSliderValue = () => [settings.lilacChaserScale];

  const setLilacChaserScaleSliderValue = (value: TrainerSliderValue) => {
    applySliderNumber(value, trainerSettingBounds.lilacChaserScale, (next) => {
      settings.lilacChaserScale = next;
      invalidateLilacChaserFrame();
      if (isLilacChaserMode) {
        drawFrame();
      }
    });
  };

  const toggleMotionPaused = () => {
    setMotionPaused(!motionPaused);
  };

  const toggleMotionDirection = () => {
    if (!canToggleDirection) {
      return;
    }
    settings.motionDirection = settings.motionDirection === 1 ? -1 : 1;
    drawFrame();
  };

  const handleMotionDirectionChange = (value: string) => {
    if (value !== "forward" && value !== "reverse") {
      return;
    }
    const direction = value === "forward" ? 1 : -1;
    if (direction !== settings.motionDirection) {
      toggleMotionDirection();
    }
  };

  const adjustTargetSize = (deltaPx: number) => {
    setSizeSliderValue([settings.baseRadiusPx + deltaPx]);
  };

  const adjustSpeed = (delta: number) => {
    settings.speed = adjustSpeedBySteps(settings.speed, delta);
  };

  const syncBrowserPath = () => {
    const route = getTrainerRoute(settings.presetId, settings.patternId);
    const path = route?.path ?? "/";
    currentRouteSlug = getRouteSlugFromPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    syncDocumentRouteMetadata(path);
  };

  const resetSettings = () => {
    settings = resetSettingsToPresetDefaults(settings);
    resetMotion();
    syncBrowserPath();
  };

  const handleGuideClose = () => {
    setGuideOpen(false);
  };

  const setHudInteractionActive = (active: boolean) => {
    if (hudElementInteractionActive === active) {
      return;
    }
    hudElementInteractionActive = active;

    if (active) {
      revealHud();
      return;
    }

    if (hudAutoHideReady) {
      hudVisible = false;
    }
  };

  const hideHud = () => {
    if (!hudAutoHideReady || hudInteractionOpen) {
      return;
    }
    hudVisible = false;
  };

  const handleHeaderSelectOpenChange = (open: boolean) => {
    if (open) {
      hudAutoHideTimer.clear();
      revealHud();
      return;
    }
    if (lastPointerWasTouch) {
      hudAutoHideTimer.start();
      return;
    }

    hudAutoHideReady = false;
    revealHud();
    requestAnimationFrame(() => {
      hudAutoHideReady = true;
      hudVisible = false;
    });
  };

  const handleWindowPointerDown = (event: PointerEvent) => {
    lastPointerWasTouch = event.pointerType === "touch";
    if (
      event.pointerType !== "touch" ||
      !(event.target instanceof HTMLCanvasElement) ||
      overlayOpen
    ) {
      return;
    }

    hudAutoHideTimer.clear();
    hudAutoHideReady = true;
    hudVisible = false;
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      cursorAutoHideTimer.start();
    }
    if (!hudAutoHideReady || event.pointerType === "touch") {
      return;
    }

    const pointerIntent = getHudPointerIntent(
      event.pointerType,
      hudAutoHideReady,
      event.clientX,
      event.clientY,
      hudBounds
    );

    if (pointerIntent === "reveal") {
      revealHudAfterPointerIntent();
      return;
    }

    cancelHudPointerReveal();
    if (pointerIntent === "hide") {
      hideHud();
    }
  };

  const handleColorInput = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    settings.ballColor = safeStimulusColor(target.value);
  };

  const handleLetterColorInput = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement) || !isHexColor(target.value)) {
      return;
    }
    settings.letterColor = target.value;
  };

  const patternSelectContentClass =
    "max-h-[min(65dvh,26rem)] overscroll-contain";

  const handleTargetFormChange = (value: string) => {
    if (isTargetForm(value)) {
      settings.targetForm = value;
    }
  };

  const handleLetterWeightChange = (value: string) => {
    const weight = Number(value);
    if (isLetterWeight(weight)) {
      settings.letterWeight = weight;
    }
  };

  const openControlsPanel = () => {
    revealHud();
    setPanelOpen(true);
  };

  const openHeaderSelectFromShortcut = (select: HeaderShortcutSelect) => {
    Object.assign(headerSelects, getHeaderSelectOpenState(select));
    revealHud();

    void focusHeaderSelectTriggerFromShortcut({
      flushSvelte,
      select,
    });
  };

  const openGuideDialog = () => {
    const guide = document.querySelector("#trainer-guide");
    if (!(guide instanceof HTMLDialogElement)) {
      return false;
    }

    revealHud();
    if (!guide.open) {
      guide.showModal();
      setGuideOpen(true);
    }
    return true;
  };

  const hasPriorityKeyboardSurface = () =>
    overlayOpen ||
    Boolean(document.querySelector(shortcutPrioritySurfaceSelector));

  const runTrainerShortcut = (action: TrainerShortcutAction) =>
    runTrainerShortcutAction(action, {
      adjustSpeed,
      adjustTargetSize,
      canOpenPatternSelect: () => settings.presetId === "pursuit",
      hasPriorityKeyboardSurface,
      openControlsPanel,
      openGuideDialog,
      openHeaderSelect: openHeaderSelectFromShortcut,
      toggleMotionPaused,
      toggleTheme: () => setMode(isDarkMode ? "light" : "dark"),
    });

  const handleWindowKeydown = (event: KeyboardEvent) => {
    const action = getTrainerShortcutAction(event);
    if (!action) {
      return;
    }
    if (isTrainerShortcutCapturedByTarget(event.target, action)) {
      return;
    }
    if (!runTrainerShortcut(action)) {
      return;
    }

    event.preventDefault();
  };

  const handlePresetChange = (value: string) => {
    settings = applyPresetToSettings(settings, value);
    resetPatternState();
    resetDirectionForFixedPatterns(settings.patternId);
    drawFrame({ clearTrail: true });
    syncBrowserPath();
  };

  const handlePatternChange = (value: string) => {
    if (!isPatternId(value)) {
      return;
    }
    settings.patternId = value;
    resetPatternState();
    resetDirectionForFixedPatterns(value);
    drawFrame({ clearTrail: true });
    syncBrowserPath();
  };

  const handleBehaviorChange = (value: string) => {
    if (!isBehaviorId(value)) {
      return;
    }
    const { speedProfile, sizeProfile } = createBehaviorProfiles(value);
    settings.speedProfile = speedProfile;
    settings.sizeProfile = sizeProfile;
  };

  const handleLilacChaserColorChange = (value: string) => {
    if (!isLilacChaserBallColor(value)) {
      return;
    }
    settings.lilacChaserBallColor = value;
    invalidateLilacChaserFrame();
    if (isLilacChaserMode) {
      drawFrame();
    }
  };

  const hudActions: TrainerHudActions = {
    handleHeaderSelectOpenChange,
    handleLilacChaserColorChange,
    handlePatternChange,
    handlePresetChange,
    lilacChaserScaleSlider: {
      set: setLilacChaserScaleSliderValue,
      value: lilacChaserScaleSliderValue,
    },
    openControlsPanel,
    openGuide: () => {
      openGuideDialog();
    },
    revealHud,
    revealHudTemporarily: () => hudAutoHideTimer.start(),
    setHudInteractionActive,
    sizeSlider: {
      set: setSizeSliderValue,
      value: sizeSliderValue,
    },
    speedSlider: {
      set: setSpeedSliderValue,
      value: speedSliderValue,
    },
    toggleMotionDirection,
    toggleMotionPaused,
  };

  const dialogActions: TrainerDialogActions = {
    distractorBrightnessSlider: {
      set: (value) => {
        applySliderNumber(
          value,
          trainerSettingBounds.distractorBrightness,
          (next) => {
            settings.distractorBrightness = next;
          }
        );
      },
      value: () => [settings.distractorBrightness],
    },
    distractorCountSlider: {
      set: (value) => {
        applySliderInteger(
          value,
          trainerSettingBounds.distractorCount,
          (next) => {
            settings.distractorCount = next;
          }
        );
      },
      value: () => [settings.distractorCount],
    },
    handleBehaviorChange,
    handleColorInput,
    handleLetterColorInput,
    handleLetterWeightChange,
    handleLilacChaserColorChange,
    handleMotionDirectionChange,
    handlePatternChange,
    handlePresetChange,
    handleTargetFormChange,
    letterScaleSlider: {
      set: (value) => {
        applySliderNumber(value, trainerSettingBounds.letterScale, (next) => {
          settings.letterScale = next;
        });
      },
      value: () => [settings.letterScale],
    },
    lilacChaserScaleSlider: hudActions.lilacChaserScaleSlider,
    onControlSectionChange: (section) => {
      activeControlSection = section;
    },
    opacitySlider: {
      set: (value) => {
        applySliderNumber(value, trainerSettingBounds.targetOpacity, (next) => {
          settings.targetOpacity = next;
        });
      },
      value: () => [settings.targetOpacity],
    },
    resetSettings,
    sizeSlider: hudActions.sizeSlider,
    speedSlider: hudActions.speedSlider,
    targetCountSlider: {
      set: (value) => {
        applySliderInteger(value, trainerSettingBounds.targetCount, (next) => {
          settings.targetCount = next;
        });
      },
      value: () => [settings.targetCount],
    },
  };

  $effect(() => {
    if (!canvasPaused) {
      return;
    }

    void settingsSnapshot;
    void safeBallColor;
    untrack(() => drawFrame({ clearTrail: true }));
  });

  $effect(() => {
    redrawForTheme(colorMode);
  });

  return {
    get activeRoute() {
      return activeRoute;
    },
    get activeTrainingModeGuide() {
      return activeTrainingModeGuide;
    },
    attachCanvasOnce,
    attachHudShell,
    attachTrainer,
    get ballColor() {
      return safeBallColor;
    },
    get behaviorValue() {
      return behaviorValue;
    },
    get canToggleDirection() {
      return canToggleDirection;
    },
    get currentControlSection() {
      return currentControlSection.id;
    },
    get currentControlSectionLabel() {
      return currentControlSection.label;
    },
    get cursorHidden() {
      return cursorHidden;
    },
    dialogActions,
    flushSettings: settingsSaver.flush,
    get guideLastModified() {
      return guideLastModified;
    },
    get guideSeoContent() {
      return guideSeoContent;
    },
    handleGuideClose,
    handlePopState,
    handleVisibilityChange,
    handleWindowKeydown,
    handleWindowPointerDown,
    handleWindowPointerMove,
    headerSelects,
    hudActions,
    get hudHidden() {
      return hudHidden;
    },
    get isLilacChaserMode() {
      return isLilacChaserMode;
    },
    get isMotMode() {
      return isMotMode;
    },
    get languageSelectOpen() {
      return languageSelectOpen;
    },
    set languageSelectOpen(open: boolean) {
      languageSelectOpen = open;
    },
    get locale() {
      return locale;
    },
    get localeReady() {
      return localeReady;
    },
    get localizedControlSections() {
      return localizedControlSections;
    },
    get motionDirectionLabel() {
      return motionDirectionLabel;
    },
    get motionDirectionToggleLabel() {
      return motionDirectionToggleLabel;
    },
    get motionPaused() {
      return motionPaused;
    },
    get pageSeoContent() {
      return pageSeoContent;
    },
    get panelOpen() {
      return panelOpen;
    },
    set panelOpen(open: boolean) {
      setPanelOpen(open);
    },
    patternSelectContentClass,
    get settings() {
      return settings;
    },
    set settings(nextSettings: TrainerSettings) {
      settings = nextSettings;
    },
  };
};

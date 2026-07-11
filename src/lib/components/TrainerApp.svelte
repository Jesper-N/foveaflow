<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { ModeWatcher, mode, setMode } from "mode-watcher";

  import TrainerControlsDialog from "$lib/components/trainer/TrainerControlsDialog.svelte";
  import TrainerGuidePopover from "$lib/components/trainer/TrainerGuidePopover.svelte";
  import TrainerHud from "$lib/components/trainer/TrainerHud.svelte";
  import { DEFAULT_CALIBRATION } from "$lib/engine/calibration";
  import {
    firstPreset,
    settingsFromPreset,
    type TrainerSettings,
  } from "$lib/engine/presets";
  import { darkenHexColor, safeStimulusColor } from "$lib/engine/safety";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import {
    buildStructuredData,
    buildTrainerRouteStructuredData,
  } from "$lib/seo";
  import {
    findTrainerRoute,
    getRouteSlugFromPath,
    getTrainerRoute,
  } from "$lib/content/trainer-routes";
  import { getTrainingModeGuide } from "$lib/content/training";
  import {
    createDebouncedSettingsSaver,
    loadSettings,
  } from "$lib/engine/storage";
  import type { PatternId, SpeedUnit } from "$lib/engine/types";
  import {
    canPatternToggleDirection,
    getAvailableControlSections,
    getControlSectionLabel,
    guideUseCasesByMode,
    homepageGuideUseCases,
    resolveControlSection,
    type ControlSectionId,
  } from "$lib/trainer/options";
  import {
    createBehaviorProfiles,
    getBehaviorId,
    isBehaviorId,
    type BehaviorId,
  } from "$lib/trainer/behavior";
  import {
    canAutoHideHud,
    getHudHidden,
    getHudInteractionOpen,
    getHudPointerIntent,
    type HudBounds,
  } from "$lib/trainer/hud";
  import type {
    TrainerDialogActions,
    TrainerHudActions,
  } from "$lib/trainer/control-actions";
  import {
    getTrainerShortcutAction,
    isTrainerShortcutCapturedByTarget,
    type TrainerShortcutAction,
  } from "$lib/trainer/keyboard";
  import {
    createCursorAutoHideTimer,
    createHudAutoHideTimer,
  } from "$lib/trainer/auto-hide";
  import {
    runTrainerShortcutAction,
    shortcutPrioritySurfaceSelector,
  } from "$lib/trainer/shortcut-runner";
  import {
    adjustSpeedBySteps,
    applyPresetToSettings,
    applyRouteToSettings,
    isHexColor,
    isLetterWeight,
    isLilacChaserBallColor,
    isPatternId,
    isSpeedUnit,
    isTargetShape,
    resolveSliderInteger,
    resolveSliderNumber,
    resolveSpeedSliderValue,
    resolveSpeedUnit,
    resetSettingsToPresetDefaults,
    resolveStoredSettings,
    trainerSettingBounds,
    updateCalibrationField,
    type CalibrationField,
    type TrainerSliderValue,
  } from "$lib/trainer/settings";
  import { createTrainerCanvasRuntime } from "$lib/trainer/canvas-runtime";
  import type { CanvasColorMode } from "$lib/trainer/rendering";
  import { createHudControlTransition } from "$lib/trainer/transitions";

  let { routeSlug = "" }: { routeSlug?: string } = $props();

  const hudAutoHideDelayMs = 5000;
  const cursorHideDelayMs = 2000;

  let settings = $state<TrainerSettings>(
    applyRouteToSettings(
      settingsFromPreset(firstPreset, DEFAULT_CALIBRATION),
      untrack(() => routeSlug),
    ),
  );
  let currentRouteSlug = $state(untrack(() => routeSlug));
  let panelOpen = $state(false);
  let activeControlSection = $state<ControlSectionId>("drill");
  let guidePopoverOpen = $state(false);
  let openGuideFaqQuestion = $state<string | null>(null);
  let hudContentWidth = $state<number | null>(null);
  let hudBounds = $state<HudBounds | null>(null);
  let motionPaused = $state(false);
  let storageReady = $state(false);
  let hudAutoHideReady = $state(false);
  let hudVisible = $state(true);
  let hudElementInteractionActive = $state(false);
  let cursorHidden = $state(false);
  let mobilePresetSelectOpen = $state(false);
  let mobilePatternSelectOpen = $state(false);
  let mobileLilacChaserColorSelectOpen = $state(false);
  let desktopPresetSelectOpen = $state(false);
  let desktopPatternSelectOpen = $state(false);
  let desktopLilacChaserColorSelectOpen = $state(false);
  let languageSelectOpen = $state(false);
  let headerPresetSelectOpen = $derived(
    mobilePresetSelectOpen || desktopPresetSelectOpen,
  );
  let headerPatternSelectOpen = $derived(
    mobilePatternSelectOpen || desktopPatternSelectOpen,
  );
  let headerLilacChaserColorSelectOpen = $derived(
    mobileLilacChaserColorSelectOpen || desktopLilacChaserColorSelectOpen,
  );
  let colorMode = $derived.by<CanvasColorMode>(() => {
    const nextMode = mode.current;
    if (nextMode === "light" || nextMode === "dark") return nextMode;

    return typeof document !== "undefined" &&
      !document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
  });

  let safeBallColor = $derived(safeStimulusColor(settings.ballColor));
  let locale = $derived(languageState.locale);
  let localeReady = $derived(languageState.ready);
  let activeRoute = $derived(findTrainerRoute(currentRouteSlug));
  let pageSeoContent = $derived(activeRoute?.seoContent ?? homepageSeoContent);
  let activeGuideRoute = $derived(
    getTrainerRoute(settings.presetId, settings.patternId),
  );
  let guideSeoContent = $derived(
    activeRoute
      ? (activeGuideRoute?.seoContent ?? pageSeoContent)
      : pageSeoContent,
  );
  let canToggleDirection = $derived(
    canPatternToggleDirection(settings.patternId),
  );
  let motionDirectionLabel = $derived(
    settings.motionDirection === 1
      ? t(locale, "forward")
      : t(locale, "reverse"),
  );
  let motionDirectionToggleLabel = $derived(
    settings.motionDirection === 1
      ? t(locale, "Reverse motion direction")
      : t(locale, "Use forward motion direction"),
  );
  let distractorColor = $derived(
    darkenHexColor(safeBallColor, settings.distractorBrightness),
  );
  let isMotMode = $derived(settings.presetId === "mot");
  let isLilacChaserMode = $derived(settings.presetId === "lilacChaser");
  let availableControlSections = $derived(
    getAvailableControlSections(isLilacChaserMode),
  );
  let localizedControlSections = $derived(
    availableControlSections.map((section) => ({
      ...section,
      label: t(locale, section.label),
    })),
  );
  let currentControlSection = $derived(
    resolveControlSection(activeControlSection, availableControlSections),
  );
  let currentControlSectionLabel = $derived(
    t(
      locale,
      getControlSectionLabel(currentControlSection, availableControlSections),
    ),
  );
  let activeTrainingModeGuide = $derived(
    getTrainingModeGuide(settings.presetId),
  );
  let guideUseCases = $derived(
    activeRoute
      ? guideUseCasesByMode[settings.presetId]
      : homepageGuideUseCases,
  );
  let isDarkMode = $derived(colorMode === "dark");
  const canvasRuntime = createTrainerCanvasRuntime({
    getColorMode: () => colorMode,
    getState: () => ({
      settings,
      motionPaused,
      canToggleDirection,
      isLilacChaserMode,
      safeBallColor,
      distractorColor,
    }),
  });
  const {
    attachCanvas,
    drawFrame,
    getArena,
    handleVisibilityChange,
    invalidateLilacChaserFrame,
    normalizeMotionDirection,
    redrawForTheme,
    refreshBaseSpeed,
    resetMotion,
    resetPatternState,
    syncPlayback,
  } = canvasRuntime;
  const attachCanvasOnce: Attachment<HTMLCanvasElement> = (node) =>
    untrack(() => attachCanvas(node));

  let behaviorValue = $derived(
    getBehaviorId(settings.speedProfile, settings.sizeProfile),
  );
  let hudInteractionOpen = $derived(
    hudElementInteractionActive ||
      getHudInteractionOpen(
        panelOpen,
        guidePopoverOpen,
        headerPresetSelectOpen,
        headerPatternSelectOpen,
        headerLilacChaserColorSelectOpen,
        languageSelectOpen,
      ),
  );
  let hudHidden = $derived(
    getHudHidden(hudAutoHideReady, hudVisible, hudInteractionOpen),
  );
  const hudAutoHideTimer = createHudAutoHideTimer({
    delayMs: hudAutoHideDelayMs,
    setReady: (ready) => {
      hudAutoHideReady = ready;
    },
    setVisible: (visible) => {
      hudVisible = visible;
    },
    isInteractionOpen: () => hudInteractionOpen,
  });
  const cursorAutoHideTimer = createCursorAutoHideTimer({
    delayMs: cursorHideDelayMs,
    setHidden: (hidden) => {
      cursorHidden = hidden;
    },
  });
  let hudShell: HTMLDivElement | undefined;
  const settingsSaver = createDebouncedSettingsSaver();

  $effect(() => {
    if (!storageReady) return;
    settingsSaver.schedule($state.snapshot(settings));
  });

  const syncSettingsFromBrowserRoute = (baseSettings = settings) => {
    const browserRouteSlug = getBrowserRouteSlug();
    currentRouteSlug = browserRouteSlug;
    settings = applyRouteToSettings(baseSettings, browserRouteSlug);
    resetPatternState();
    resetDirectionForFixedPatterns(settings.patternId);
    refreshBaseSpeed();
    syncDocumentRouteMetadata(window.location.pathname);
  };

  const handlePopState = () => {
    syncSettingsFromBrowserRoute();
    drawFrame({ clearTrail: true });
  };

  const flushSettings = () => {
    settingsSaver.flush();
  };

  onMount(() => {
    let mounted = true;
    const savedSettings = loadSettings();
    syncSettingsFromBrowserRoute(
      savedSettings ? resolveStoredSettings(savedSettings) : settings,
    );

    storageReady = true;
    void languageState.init().then(() => {
      if (!mounted) return;
      hudAutoHideTimer.start();
    });
    cursorAutoHideTimer.start();

    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reduceMotionQuery.matches) setMotionPaused(true);
    const handleReduceMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMotionPaused(true);
    };
    reduceMotionQuery.addEventListener("change", handleReduceMotionChange);

    return () => {
      mounted = false;
      settingsSaver.flush();
      hudAutoHideTimer.clear();
      cursorAutoHideTimer.clear();
      reduceMotionQuery.removeEventListener("change", handleReduceMotionChange);
    };
  });

  const speedSliderValue = () => [settings.speed.value];

  const hudControlTransition = createHudControlTransition(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const attachHudContentSizer: Attachment<HTMLDivElement> = (node) => {
    const updateWidth = () => {
      hudContentWidth = Math.ceil(node.getBoundingClientRect().width);
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    const measurementFrame = requestAnimationFrame(updateWidth);

    resizeObserver.observe(node);

    return () => {
      cancelAnimationFrame(measurementFrame);
      resizeObserver.disconnect();
    };
  };

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
      if (hudShell === node) hudShell = undefined;
      if (!hudShell) hudBounds = null;
      cancelAnimationFrame(measurementFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  };

  const applySliderNumber = (
    value: TrainerSliderValue,
    bounds: { min: number; max: number },
    applyValue: (value: number) => void,
  ) => {
    const next = resolveSliderNumber(value, bounds.min, bounds.max);
    if (next !== null) applyValue(next);
  };

  const applySliderInteger = (
    value: TrainerSliderValue,
    bounds: { min: number; max: number },
    applyValue: (value: number) => void,
  ) => {
    const next = resolveSliderInteger(value, bounds.min, bounds.max);
    if (next !== null) applyValue(next);
  };

  const setSpeedSliderValue = (value: TrainerSliderValue) => {
    const next = resolveSpeedSliderValue(value, settings.speed.unit);
    if (next === null) return;

    settings.speed = {
      ...settings.speed,
      value: next,
    };
    refreshBaseSpeed();
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
      if (isLilacChaserMode) drawFrame();
    });
  };

  const opacitySliderValue = () => [settings.targetOpacity];

  const setOpacitySliderValue = (value: TrainerSliderValue) => {
    applySliderNumber(value, trainerSettingBounds.targetOpacity, (next) => {
      settings.targetOpacity = next;
    });
  };

  const targetCountSliderValue = () => [settings.targetCount];

  const setTargetCountSliderValue = (value: TrainerSliderValue) => {
    applySliderInteger(value, trainerSettingBounds.targetCount, (next) => {
      settings.targetCount = next;
    });
  };

  const distractorCountSliderValue = () => [settings.distractorCount];

  const setDistractorCountSliderValue = (value: TrainerSliderValue) => {
    applySliderInteger(value, trainerSettingBounds.distractorCount, (next) => {
      settings.distractorCount = next;
    });
  };

  const distractorBrightnessSliderValue = () => [settings.distractorBrightness];

  const setDistractorBrightnessSliderValue = (value: TrainerSliderValue) => {
    applySliderNumber(
      value,
      trainerSettingBounds.distractorBrightness,
      (next) => {
        settings.distractorBrightness = next;
      },
    );
  };

  const letterScaleSliderValue = () => [settings.letterScale];

  const setLetterScaleSliderValue = (value: TrainerSliderValue) => {
    applySliderNumber(value, trainerSettingBounds.letterScale, (next) => {
      settings.letterScale = next;
    });
  };

  const setMotionPaused = (paused: boolean) => {
    motionPaused = paused;
    syncPlayback();
  };

  const toggleMotionPaused = () => {
    setMotionPaused(!motionPaused);
  };

  const resetDirectionForFixedPatterns = (patternId: PatternId) => {
    settings.motionDirection = normalizeMotionDirection(
      patternId,
      settings.motionDirection,
    );
  };

  const toggleMotionDirection = () => {
    if (!canToggleDirection) return;
    settings.motionDirection = settings.motionDirection === 1 ? -1 : 1;
    drawFrame();
  };

  const adjustTargetSize = (deltaPx: number) => {
    setSizeSliderValue([settings.baseRadiusPx + deltaPx]);
  };

  const adjustSpeed = (delta: number) => {
    settings.speed = adjustSpeedBySteps(settings.speed, delta);
    refreshBaseSpeed();
  };

  const applyPreset = (presetId: string) => {
    settings = applyPresetToSettings(settings, presetId);
    resetPatternState();
    resetDirectionForFixedPatterns(settings.patternId);
    refreshBaseSpeed();
    drawFrame({ clearTrail: true });
  };

  const getBrowserRouteSlug = () => {
    return getRouteSlugFromPath(window.location.pathname);
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
    const setMetaContent = (selector: string, content: string) => {
      document.head
        .querySelector<HTMLMetaElement>(selector)
        ?.setAttribute("content", content);
    };

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

    const structuredData = route
      ? route.indexable
        ? buildTrainerRouteStructuredData(route, siteOrigin)
        : undefined
      : buildStructuredData(siteOrigin);
    let structuredDataElement = document.head.querySelector<HTMLScriptElement>(
      "script[data-seo-structured-data]",
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

  const setBrowserPath = (path: string) => {
    currentRouteSlug = getRouteSlugFromPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    syncDocumentRouteMetadata(path);
  };

  const syncBrowserPath = () => {
    const route = getTrainerRoute(settings.presetId, settings.patternId);
    setBrowserPath(route?.path ?? "/");
  };

  const resetSettings = () => {
    settings = resetSettingsToPresetDefaults(settings);
    resetMotion();
    syncBrowserPath();
  };

  const handleGuidePopoverToggle = (event: ToggleEvent) => {
    guidePopoverOpen = event.newState === "open";
    if (guidePopoverOpen) revealHud();
  };

  const setActiveControlSection = (section: ControlSectionId) => {
    activeControlSection = section;
  };

  const toggleGuideFaq = (question: string) => {
    openGuideFaqQuestion = openGuideFaqQuestion === question ? null : question;
  };

  const revealHud = () => {
    hudVisible = true;
  };

  const setHudInteractionActive = (active: boolean) => {
    if (hudElementInteractionActive === active) return;
    hudElementInteractionActive = active;

    if (active) {
      hudAutoHideTimer.clear();
      revealHud();
      return;
    }

    if (hudAutoHideReady) {
      hudVisible = false;
      return;
    }

    hudAutoHideTimer.start();
  };

  const hideHud = () => {
    if (!canAutoHideHud(hudAutoHideReady, hudInteractionOpen)) return;
    hudVisible = false;
  };

  const handleHeaderPresetOpenChange = (open: boolean) => {
    if (open) revealHud();
  };

  const handleHeaderPatternOpenChange = (open: boolean) => {
    if (open) revealHud();
  };

  const handleHeaderLilacChaserColorOpenChange = (open: boolean) => {
    if (open) revealHud();
  };

  const handleHeaderLanguageOpenChange = (open: boolean) => {
    if (open) revealHud();
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") cursorAutoHideTimer.start();
    if (!hudAutoHideReady || event.pointerType === "touch") return;

    const pointerIntent = getHudPointerIntent(
      event.pointerType,
      hudAutoHideReady,
      event.clientX,
      event.clientY,
      hudBounds,
    );

    if (pointerIntent === "reveal") {
      revealHud();
      return;
    }

    if (pointerIntent === "hide") hideHud();
  };

  const setPattern = (patternId: PatternId) => {
    settings.patternId = patternId;
    resetPatternState();
    resetDirectionForFixedPatterns(patternId);
    drawFrame({ clearTrail: true });
  };

  const setSpeedUnit = (unit: SpeedUnit) => {
    settings.speed = resolveSpeedUnit(
      settings.speed,
      unit,
      getArena(),
      settings.calibration,
    );
    refreshBaseSpeed();
  };

  const setBehavior = (behavior: BehaviorId) => {
    const { speedProfile, sizeProfile } = createBehaviorProfiles(behavior);
    settings.speedProfile = speedProfile;
    settings.sizeProfile = sizeProfile;
  };

  const handleColorInput = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
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

  const handleShapeChange = (value: string) => {
    if (isTargetShape(value)) settings.targetShape = value;
  };

  const handleLetterWeightChange = (value: string) => {
    const weight = Number(value);
    if (isLetterWeight(weight)) settings.letterWeight = weight;
  };

  const handleThemeCheckedChange = (checked: boolean) => {
    setMode(checked ? "dark" : "light");
  };

  const openControlsPanel = () => {
    revealHud();
    activeControlSection = "targets";
    panelOpen = true;
  };

  const hasPriorityKeyboardSurface = () => {
    return (
      panelOpen ||
      guidePopoverOpen ||
      headerPresetSelectOpen ||
      headerPatternSelectOpen ||
      headerLilacChaserColorSelectOpen ||
      languageSelectOpen ||
      Boolean(document.querySelector(shortcutPrioritySurfaceSelector))
    );
  };

  const runTrainerShortcut = (action: TrainerShortcutAction) => {
    return runTrainerShortcutAction(action, {
      hasPriorityKeyboardSurface,
      toggleMotionPaused,
      adjustTargetSize,
      adjustSpeed,
    });
  };

  const handleWindowKeydown = (event: KeyboardEvent) => {
    const action = getTrainerShortcutAction(event);
    if (!action) return;
    if (isTrainerShortcutCapturedByTarget(event.target, action)) return;
    if (!runTrainerShortcut(action)) return;

    event.preventDefault();
  };

  const handlePresetChange = (value: string) => {
    applyPreset(value);
    syncBrowserPath();
  };

  const handlePatternChange = (value: string) => {
    if (!isPatternId(value)) return;
    setPattern(value);
    syncBrowserPath();
  };

  const handleSpeedUnitChange = (value: string) => {
    if (isSpeedUnit(value)) setSpeedUnit(value);
  };

  const handleBehaviorChange = (value: string) => {
    if (isBehaviorId(value)) setBehavior(value);
  };

  const handleLilacChaserColorChange = (value: string) => {
    if (!isLilacChaserBallColor(value)) return;
    settings.lilacChaserBallColor = value;
    invalidateLilacChaserFrame();
    if (isLilacChaserMode) drawFrame();
  };

  const handleCalibrationInput = (event: Event, field: CalibrationField) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    const nextCalibration = updateCalibrationField(
      settings.calibration,
      field,
      Number(target.value),
    );
    if (!nextCalibration) return;

    settings.calibration = nextCalibration;
    refreshBaseSpeed();
  };

  const hudActions: TrainerHudActions = {
    handlePresetChange,
    handleHeaderPresetOpenChange,
    handlePatternChange,
    handleHeaderPatternOpenChange,
    handleLilacChaserColorChange,
    handleHeaderLilacChaserColorOpenChange,
    handleHeaderLanguageOpenChange,
    sizeSlider: {
      value: sizeSliderValue,
      set: setSizeSliderValue,
    },
    speedSlider: {
      value: speedSliderValue,
      set: setSpeedSliderValue,
    },
    lilacChaserScaleSlider: {
      value: lilacChaserScaleSliderValue,
      set: setLilacChaserScaleSliderValue,
    },
    hudControlTransition,
    toggleMotionPaused,
    toggleMotionDirection,
    revealHud,
    setHudInteractionActive,
    openControlsPanel,
  };

  const dialogActions: TrainerDialogActions = {
    onControlSectionChange: setActiveControlSection,
    handlePresetChange,
    handlePatternChange,
    handleBehaviorChange,
    handleLilacChaserColorChange,
    handleShapeChange,
    handleLetterWeightChange,
    handleThemeCheckedChange,
    handleSpeedUnitChange,
    handleColorInput,
    handleLetterColorInput,
    handleCalibrationInput,
    speedSlider: {
      value: speedSliderValue,
      set: setSpeedSliderValue,
    },
    sizeSlider: {
      value: sizeSliderValue,
      set: setSizeSliderValue,
    },
    lilacChaserScaleSlider: {
      value: lilacChaserScaleSliderValue,
      set: setLilacChaserScaleSliderValue,
    },
    opacitySlider: {
      value: opacitySliderValue,
      set: setOpacitySliderValue,
    },
    targetCountSlider: {
      value: targetCountSliderValue,
      set: setTargetCountSliderValue,
    },
    distractorCountSlider: {
      value: distractorCountSliderValue,
      set: setDistractorCountSliderValue,
    },
    distractorBrightnessSlider: {
      value: distractorBrightnessSliderValue,
      set: setDistractorBrightnessSliderValue,
    },
    letterScaleSlider: {
      value: letterScaleSliderValue,
      set: setLetterScaleSliderValue,
    },
    toggleMotionPaused,
    toggleMotionDirection,
    resetSettings,
  };

  $effect(() => {
    const pausedFrameSettings = $state.snapshot(settings);
    if (!untrack(() => motionPaused)) return;

    void pausedFrameSettings;
    untrack(() => drawFrame({ clearTrail: true }));
  });

  $effect(() => {
    redrawForTheme(colorMode);
  });
</script>

<ModeWatcher track={false} defaultMode="system" />
<svelte:window
  onkeydown={handleWindowKeydown}
  onpagehide={flushSettings}
  onpointermove={handleWindowPointerMove}
  onpopstate={handlePopState}
/>
<svelte:document onvisibilitychange={handleVisibilityChange} />

<main
  class="trainer-stage relative h-dvh w-dvw overflow-hidden bg-background text-foreground"
  data-cursor-hidden={cursorHidden}
  aria-label={t(locale, "FoveaFlow eye trainer app")}
>
  <h1 class="sr-only">{t(locale, pageSeoContent.heading)}</h1>
  <p id="trainer-canvas-description" class="sr-only">
    {t(
      locale,
      "FoveaFlow eye trainer animation for visual tracking practice. Use Pause motion to stop target movement before changing controls.",
    )}
  </p>
  <p id="trainer-motion-status" class="sr-only" aria-live="polite">
    {t(locale, "Motion")}
    {motionPaused ? t(locale, "paused") : t(locale, "playing")}.
    {t(locale, "Direction")}
    {motionDirectionLabel}.
  </p>

  <canvas
    {@attach attachCanvasOnce}
    class="absolute inset-0 h-full w-full touch-none bg-background"
    aria-label={t(
      locale,
      "FoveaFlow eye trainer animation for visual tracking practice",
    )}
    aria-describedby="trainer-canvas-description trainer-motion-status"
  ></canvas>

  {#if localeReady}
    <TrainerHud
      {attachHudShell}
      {hudHidden}
      {hudContentWidth}
      {attachHudContentSizer}
      {settings}
      {isLilacChaserMode}
      {motionPaused}
      {motionDirectionToggleLabel}
      {canToggleDirection}
      bind:mobilePresetSelectOpen
      bind:mobilePatternSelectOpen
      bind:mobileLilacChaserColorSelectOpen
      bind:desktopPresetSelectOpen
      bind:desktopPatternSelectOpen
      bind:desktopLilacChaserColorSelectOpen
      bind:languageSelectOpen
      guideButtonLabel={activeRoute
        ? `${t(locale, "Open")} ${t(locale, guideSeoContent.heading)} ${t(locale, "guide")}`
        : t(locale, "About FoveaFlow eye trainer")}
      guideButtonTitle={activeRoute
        ? t(locale, "Open guide")
        : t(locale, "About FoveaFlow")}
      {patternSelectContentClass}
      actions={hudActions}
    />
  {/if}

  <TrainerGuidePopover
    {activeTrainingModeGuide}
    {guideSeoContent}
    {guideUseCases}
    hasActiveRoute={Boolean(activeRoute)}
    {openGuideFaqQuestion}
    onGuidePopoverToggle={handleGuidePopoverToggle}
    {toggleGuideFaq}
  />

  <TrainerControlsDialog
    bind:open={panelOpen}
    bind:settings
    availableControlSections={localizedControlSections}
    {currentControlSection}
    {currentControlSectionLabel}
    {motionPaused}
    {motionDirectionLabel}
    {canToggleDirection}
    {colorMode}
    {isDarkMode}
    {isMotMode}
    {isLilacChaserMode}
    {behaviorValue}
    {patternSelectContentClass}
    actions={dialogActions}
  />
</main>

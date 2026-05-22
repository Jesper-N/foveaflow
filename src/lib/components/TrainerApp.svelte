<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { ModeWatcher, mode, setMode } from "mode-watcher";

  import TrainerControlsDialog from "$lib/components/trainer/TrainerControlsDialog.svelte";
  import TrainerGuidePopover from "$lib/components/trainer/TrainerGuidePopover.svelte";
  import TrainerHud from "$lib/components/trainer/TrainerHud.svelte";
  import {
    DEFAULT_CALIBRATION,
    speedToPixelsPerSecond,
  } from "$lib/engine/calibration";
  import { resolveCanvasLayout } from "$lib/engine/canvas";
  import {
    firstPreset,
    settingsFromPreset,
    type TrainerSettings,
  } from "$lib/engine/presets";
  import { samplePatternInto } from "$lib/engine/patterns";
  import { sampleSizeProfile, sampleSpeedProfile } from "$lib/engine/profiles";
  import { createRng, createSessionSeed } from "$lib/engine/random";
  import { darkenHexColor, safeStimulusColor } from "$lib/engine/safety";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import {
    findTrainerRoute,
    getRouteSlugFromPath,
    getTrainerRoute,
    indexableTrainerRoutes,
  } from "$lib/content/trainer-routes";
  import { getTrainingModeGuide } from "$lib/content/training";
  import {
    createDebouncedSettingsSaver,
    loadSettings,
  } from "$lib/engine/storage";
  import type {
    Arena,
    PatternParams,
    PatternId,
    SpeedUnit,
    TargetFrame,
  } from "$lib/engine/types";
  import {
    canPatternToggleDirection,
    getAvailableControlSections,
    getControlSectionLabel,
    guideUseCasesByMode,
    homepageGuideUseCases,
    resolveControlSection,
    type BehaviorId,
    type ControlSectionId,
  } from "$lib/trainer/options";
  import {
    canAutoHideHud,
    getHudHidden,
    getHudInteractionOpen,
    getHudPointerIntent,
    type HudBounds,
  } from "$lib/trainer/hud";
  import {
    advanceMotionTick,
    type MotionTickResult,
  } from "$lib/trainer/motion";
  import {
    applyPresetToSettings,
    applyRouteToSettings,
    createBehaviorProfiles,
    getBehaviorId,
    isBehaviorId,
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
    resetUnsupportedMotionDirection,
    resetSettingsToPresetDefaults,
    resolveStoredSettings,
    trainerSettingBounds,
    updateCalibrationField,
    type CalibrationField,
    type TrainerSliderValue,
  } from "$lib/trainer/settings";
  import {
    createGuideGridPath,
    drawGuides,
    drawLilacChaserFrame,
    drawTargetFrame,
    getCanvasTheme,
    getLilacChaserHiddenIndex,
    type CanvasColorMode,
    type CanvasTheme,
  } from "$lib/trainer/rendering";
  import { createHudControlTransition } from "$lib/trainer/transitions";

  let { routeSlug = "" }: { routeSlug?: string } = $props();

  let canvas!: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let motionFrame = 0;
  let lastTimestamp = 0;
  let arena: Arena = { width: 1, height: 1 };
  let elapsedSec = 0;
  let travelPx = 0;
  let currentSpeedPxPerSec = 0;
  let baseSpeedPxPerSec = 0;
  let seed = createSessionSeed();
  let rng = createRng(seed);
  let canvasTheme: CanvasTheme | null = null;
  let gridPath: Path2D | null = null;
  let canvasScale = 1;
  let lastLilacChaserHiddenIndex = -1;
  const targetFrames: TargetFrame[] = [];
  const patternParams: PatternParams = {
    radiusPx: 1,
    pathMarginPx: 16,
    speedPxPerSec: 1,
    travelPx: 0,
  };
  const letterContext = {
    arena,
    elapsedSec,
    travelPx,
    seed,
  };
  const motionTickResult: MotionTickResult = {
    lastTimestamp,
    elapsedSec,
    travelPx,
  };
  const pathMarginPx = 16;
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
  let cursorHidden = $state(false);
  let headerPresetSelectOpen = $state(false);
  let headerPatternSelectOpen = $state(false);
  let headerLilacChaserColorSelectOpen = $state(false);
  let colorMode = $derived.by<CanvasColorMode>(() => {
    const nextMode = mode.current;
    if (nextMode === "light" || nextMode === "dark") return nextMode;

    return typeof document !== "undefined" &&
      !document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
  });

  let safeBallColor = $derived(safeStimulusColor(settings.ballColor));
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
    settings.motionDirection === 1 ? "forward" : "reverse",
  );
  let motionDirectionToggleLabel = $derived(
    settings.motionDirection === 1
      ? "Reverse motion direction"
      : "Use forward motion direction",
  );
  let distractorColor = $derived(
    darkenHexColor(safeBallColor, settings.distractorBrightness),
  );
  let isMotMode = $derived(settings.presetId === "mot");
  let isLilacChaserMode = $derived(settings.presetId === "lilacChaser");
  let availableControlSections = $derived(
    getAvailableControlSections(isLilacChaserMode),
  );
  let currentControlSection = $derived(
    resolveControlSection(activeControlSection, availableControlSections),
  );
  let currentControlSectionLabel = $derived(
    getControlSectionLabel(currentControlSection, availableControlSections),
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

  const refreshBaseSpeed = () => {
    baseSpeedPxPerSec = speedToPixelsPerSecond(
      settings.speed,
      arena,
      settings.calibration,
    );
  };

  let behaviorValue = $derived(
    getBehaviorId(settings.speedProfile, settings.sizeProfile),
  );
  let hudInteractionOpen = $derived(
    getHudInteractionOpen(
      panelOpen,
      guidePopoverOpen,
      headerPresetSelectOpen,
      headerPatternSelectOpen,
      headerLilacChaserColorSelectOpen,
    ),
  );
  let hudHidden = $derived(
    getHudHidden(hudAutoHideReady, hudVisible, hudInteractionOpen),
  );
  let hudShell: HTMLDivElement | undefined;
  let hudHideTimeout: number | undefined;
  let cursorHideTimeout: number | undefined;
  let cursorHideDeadline = 0;
  const settingsSaver = createDebouncedSettingsSaver();

  $effect(() => {
    if (!storageReady) return;
    settingsSaver.schedule($state.snapshot(settings));
  });

  const attachCanvas: Attachment<HTMLCanvasElement> = (node) => {
    canvas = node;
    context = node.getContext("2d", { alpha: false, desynchronized: true });

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);

    canvasTheme = getCanvasTheme(node, colorMode);
    resizeCanvas();
    if (shouldAnimateMotion()) startLoop();

    return () => {
      cancelAnimationFrame(motionFrame);
      resizeObserver.disconnect();
    };
  };

  const syncSettingsFromBrowserRoute = (baseSettings = settings) => {
    const browserRouteSlug = getBrowserRouteSlug();
    currentRouteSlug = browserRouteSlug;
    settings = applyRouteToSettings(baseSettings, browserRouteSlug);
    resetDirectionForFixedPatterns(settings.patternId);
    refreshBaseSpeed();
  };

  const handlePopState = () => {
    syncSettingsFromBrowserRoute();
    drawFrame();
  };

  const flushSettings = () => {
    settingsSaver.flush();
  };

  onMount(() => {
    const savedSettings = loadSettings();
    syncSettingsFromBrowserRoute(
      savedSettings ? resolveStoredSettings(savedSettings) : settings,
    );

    storageReady = true;
    startHudAutoHideTimer();
    startCursorHideTimer();

    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reduceMotionQuery.matches) setMotionPaused(true);
    const handleReduceMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMotionPaused(true);
    };
    reduceMotionQuery.addEventListener("change", handleReduceMotionChange);

    return () => {
      settingsSaver.flush();
      clearHudAutoHideTimer();
      clearCursorHideTimer();
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

  const resizeCanvas = (entries?: ResizeObserverEntry[]) => {
    if (!context) return;
    const observedRect = entries?.[0]?.contentRect;
    const rect = observedRect ?? canvas.getBoundingClientRect();
    const layout = resolveCanvasLayout(
      rect.width,
      rect.height,
      window.devicePixelRatio,
    );
    const nextArena = layout.arena;
    const arenaChanged =
      nextArena.width !== arena.width || nextArena.height !== arena.height;
    arena = nextArena;
    const backingStoreChanged =
      canvas.width !== layout.canvasWidth ||
      canvas.height !== layout.canvasHeight;
    if (canvas.width !== layout.canvasWidth) canvas.width = layout.canvasWidth;
    if (canvas.height !== layout.canvasHeight) {
      canvas.height = layout.canvasHeight;
    }
    if (backingStoreChanged || canvasScale !== layout.scale) {
      canvasScale = layout.scale;
      context.setTransform(layout.scale, 0, 0, layout.scale, 0, 0);
    }
    if (arenaChanged) {
      refreshBaseSpeed();
      rebuildGridPath();
      invalidateLilacChaserFrame();
    }
    drawFrame();
  };

  const rebuildGridPath = () => {
    gridPath = createGuideGridPath(arena);
  };

  const shouldAnimateMotion = () => !motionPaused && !document.hidden;

  const stopLoop = () => {
    cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    lastTimestamp = 0;
  };

  const startLoop = () => {
    if (!shouldAnimateMotion()) return;
    stopLoop();
    motionFrame = requestAnimationFrame(tick);
  };

  const tick = (timestamp: number) => {
    if (!shouldAnimateMotion()) {
      stopLoop();
      return;
    }

    currentSpeedPxPerSec = getSpeedPxPerSec(elapsedSec);
    const nextMotion = advanceMotionTick(
      {
        timestamp,
        lastTimestamp,
        elapsedSec,
        travelPx,
        speedPxPerSec: currentSpeedPxPerSec,
        canToggleDirection,
        motionDirection: settings.motionDirection,
      },
      motionTickResult,
    );
    lastTimestamp = nextMotion.lastTimestamp;
    elapsedSec = nextMotion.elapsedSec;
    travelPx = nextMotion.travelPx;
    if (shouldDrawTickFrame()) drawFrame();
    motionFrame = requestAnimationFrame(tick);
  };

  const setMotionPaused = (paused: boolean) => {
    motionPaused = paused;
    if (paused) {
      stopLoop();
      drawFrame();
      return;
    }
    startLoop();
  };

  const toggleMotionPaused = () => {
    setMotionPaused(!motionPaused);
  };

  const resetDirectionForFixedPatterns = (patternId: PatternId) => {
    const directionState = resetUnsupportedMotionDirection(
      patternId,
      settings.motionDirection,
      travelPx,
    );

    settings.motionDirection = directionState.motionDirection;
    travelPx = directionState.travelPx;
  };

  const toggleMotionDirection = () => {
    if (!canToggleDirection) return;
    settings.motionDirection = settings.motionDirection === 1 ? -1 : 1;
    drawFrame();
  };

  const getSpeedPxPerSec = (timeSec: number) => {
    return sampleSpeedProfile(
      settings.speedProfile,
      timeSec,
      baseSpeedPxPerSec,
    );
  };

  const sampleFrameCount = (timeSec: number) => {
    const patternId = settings.patternId;
    const speedPxPerSec = currentSpeedPxPerSec || getSpeedPxPerSec(timeSec);
    const radiusPx = sampleSizeProfile(
      settings.sizeProfile,
      timeSec,
      settings.baseRadiusPx,
    );
    patternParams.radiusPx = radiusPx;
    patternParams.pathMarginPx = pathMarginPx;
    patternParams.speedPxPerSec = speedPxPerSec;
    patternParams.travelPx = travelPx;
    patternParams.targetCount = settings.targetCount;
    patternParams.distractorCount = settings.distractorCount;
    patternParams.colorA = safeBallColor;
    patternParams.colorB = distractorColor;

    return samplePatternInto(
      targetFrames,
      patternId,
      timeSec,
      arena,
      patternParams,
      rng,
    );
  };

  const drawFrame = () => {
    if (!context) return;
    const ctx = context;
    if (isLilacChaserMode) {
      drawCurrentLilacChaserFrame(ctx);
      return;
    }

    const theme = canvasTheme ?? getCanvasTheme(canvas, colorMode);
    ctx.fillStyle = settings.showTrail ? theme.trail : theme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);
    drawGuides(ctx, gridPath, theme);

    const frameCount = sampleFrameCount(elapsedSec);
    letterContext.arena = arena;
    letterContext.elapsedSec = elapsedSec;
    letterContext.travelPx = travelPx;
    letterContext.seed = seed;
    for (let index = 0; index < frameCount; index += 1) {
      drawTargetFrame(ctx, targetFrames[index], index, settings, letterContext);
    }
  };

  const invalidateLilacChaserFrame = () => {
    lastLilacChaserHiddenIndex = -1;
  };

  const shouldDrawTickFrame = () => {
    if (!isLilacChaserMode) return true;
    return getLilacChaserHiddenIndex(elapsedSec) !== lastLilacChaserHiddenIndex;
  };

  const drawCurrentLilacChaserFrame = (ctx: CanvasRenderingContext2D) => {
    const hiddenIndex = getLilacChaserHiddenIndex(elapsedSec);
    lastLilacChaserHiddenIndex = hiddenIndex;

    drawLilacChaserFrame(
      ctx,
      arena,
      settings.lilacChaserScale,
      settings.lilacChaserBallColor,
      hiddenIndex,
    );
  };

  const applyPreset = (presetId: string) => {
    settings = applyPresetToSettings(settings, presetId);
    resetDirectionForFixedPatterns(settings.patternId);
    refreshBaseSpeed();
    invalidateLilacChaserFrame();
    drawFrame();
  };

  const getBrowserRouteSlug = () => {
    return getRouteSlugFromPath(window.location.pathname);
  };

  const setBrowserPath = (path: string) => {
    currentRouteSlug = getRouteSlugFromPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  };

  const syncBrowserPath = () => {
    const route = getTrainerRoute(settings.presetId, settings.patternId);
    setBrowserPath(route?.path ?? "/");
  };

  const resetSettings = () => {
    settings = resetSettingsToPresetDefaults(settings);
    seed = createSessionSeed();
    rng = createRng(seed);
    elapsedSec = 0;
    travelPx = 0;
    currentSpeedPxPerSec = 0;
    refreshBaseSpeed();
    invalidateLilacChaserFrame();
    drawFrame();
    syncBrowserPath();
  };

  const clearHudAutoHideTimer = () => {
    if (hudHideTimeout === undefined) return;
    window.clearTimeout(hudHideTimeout);
    hudHideTimeout = undefined;
  };

  const clearCursorHideTimer = () => {
    if (cursorHideTimeout === undefined) return;
    window.clearTimeout(cursorHideTimeout);
    cursorHideTimeout = undefined;
    cursorHideDeadline = 0;
  };

  const startCursorHideTimer = () => {
    cursorHidden = false;
    cursorHideDeadline = performance.now() + cursorHideDelayMs;
    if (cursorHideTimeout !== undefined) return;

    const hideAfterIdle = () => {
      const remainingDelayMs = cursorHideDeadline - performance.now();
      if (remainingDelayMs > 0) {
        cursorHideTimeout = window.setTimeout(hideAfterIdle, remainingDelayMs);
        return;
      }

      cursorHideTimeout = undefined;
      cursorHidden = true;
    };

    cursorHideTimeout = window.setTimeout(hideAfterIdle, cursorHideDelayMs);
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

  const startHudAutoHideTimer = () => {
    clearHudAutoHideTimer();
    hudAutoHideReady = false;
    hudVisible = true;
    hudHideTimeout = window.setTimeout(() => {
      hudAutoHideReady = true;
      if (!hudInteractionOpen) hudVisible = false;
    }, hudAutoHideDelayMs);
  };

  const revealHud = () => {
    hudVisible = true;
  };

  const hideHud = () => {
    if (!canAutoHideHud(hudAutoHideReady, hudInteractionOpen)) return;
    hudVisible = false;
  };

  const handleHeaderPresetOpenChange = (open: boolean) => {
    headerPresetSelectOpen = open;
    if (open) revealHud();
  };

  const handleHeaderPatternOpenChange = (open: boolean) => {
    headerPatternSelectOpen = open;
    if (open) revealHud();
  };

  const handleHeaderLilacChaserColorOpenChange = (open: boolean) => {
    headerLilacChaserColorSelectOpen = open;
    if (open) revealHud();
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") startCursorHideTimer();
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
    resetDirectionForFixedPatterns(patternId);
  };

  const setSpeedUnit = (unit: SpeedUnit) => {
    settings.speed = resolveSpeedUnit(settings.speed, unit);
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

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    startLoop();
  };

  const redrawCanvasForTheme = (nextColorMode: CanvasColorMode) => {
    if (!canvas) return;
    requestAnimationFrame(() => {
      canvasTheme = getCanvasTheme(canvas, nextColorMode);
      drawFrame();
    });
  };

  $effect(() => {
    redrawCanvasForTheme(colorMode);
  });
</script>

<ModeWatcher track={false} defaultMode="system" />
<svelte:window
  onpagehide={flushSettings}
  onpointermove={handleWindowPointerMove}
  onpopstate={handlePopState}
/>
<svelte:document onvisibilitychange={handleVisibilityChange} />

<main
  class="trainer-stage relative h-dvh w-dvw overflow-hidden bg-background text-foreground"
  data-cursor-hidden={cursorHidden}
  aria-label="FoveaFlow eye trainer app"
>
  {#if activeRoute}
    <h1 class="sr-only">{pageSeoContent.heading}</h1>
  {/if}
  <p id="trainer-canvas-description" class="sr-only">
    FoveaFlow eye trainer animation for visual tracking practice. Use Pause
    motion to stop target movement before changing controls.
  </p>
  <p id="trainer-motion-status" class="sr-only" aria-live="polite">
    Motion {motionPaused ? "paused" : "playing"}. Direction {motionDirectionLabel}.
  </p>

  <canvas
    {@attach attachCanvas}
    class="absolute inset-0 h-full w-full touch-none bg-background"
    aria-label="FoveaFlow eye trainer animation for visual tracking practice"
    aria-describedby="trainer-canvas-description trainer-motion-status"
  ></canvas>

  <nav class="sr-only" aria-label="Practice pages">
    <a href="/">{siteMetadata.name} home</a>
    <a href="/guide/">{siteMetadata.name} guide</a>
    {#each indexableTrainerRoutes as route (route.slug)}
      <a href={route.path}>{route.label}</a>
    {/each}
  </nav>

  <TrainerHud
    {attachHudShell}
    {hudHidden}
    {hudContentWidth}
    {attachHudContentSizer}
    hasActiveRoute={Boolean(activeRoute)}
    {settings}
    {isLilacChaserMode}
    {motionPaused}
    {motionDirectionToggleLabel}
    {canToggleDirection}
    guideButtonLabel={activeRoute
      ? `Open ${guideSeoContent.heading} guide`
      : "About FoveaFlow eye trainer"}
    guideButtonTitle={activeRoute ? "Open guide" : "About FoveaFlow"}
    {patternSelectContentClass}
    {handlePresetChange}
    {handleHeaderPresetOpenChange}
    {handlePatternChange}
    {handleHeaderPatternOpenChange}
    {handleLilacChaserColorChange}
    {handleHeaderLilacChaserColorOpenChange}
    {sizeSliderValue}
    {setSizeSliderValue}
    {speedSliderValue}
    {setSpeedSliderValue}
    {lilacChaserScaleSliderValue}
    {setLilacChaserScaleSliderValue}
    {hudControlTransition}
    {toggleMotionPaused}
    {toggleMotionDirection}
    {revealHud}
    {openControlsPanel}
  />

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
    {availableControlSections}
    {currentControlSection}
    {currentControlSectionLabel}
    onControlSectionChange={setActiveControlSection}
    {motionPaused}
    {motionDirectionLabel}
    {canToggleDirection}
    {colorMode}
    {isDarkMode}
    {isMotMode}
    {isLilacChaserMode}
    {behaviorValue}
    {patternSelectContentClass}
    {handlePresetChange}
    {handlePatternChange}
    {handleBehaviorChange}
    {handleLilacChaserColorChange}
    {handleShapeChange}
    {handleLetterWeightChange}
    {handleThemeCheckedChange}
    {handleSpeedUnitChange}
    {handleColorInput}
    {handleLetterColorInput}
    {handleCalibrationInput}
    {speedSliderValue}
    {setSpeedSliderValue}
    {sizeSliderValue}
    {setSizeSliderValue}
    {lilacChaserScaleSliderValue}
    {setLilacChaserScaleSliderValue}
    {opacitySliderValue}
    {setOpacitySliderValue}
    {targetCountSliderValue}
    {setTargetCountSliderValue}
    {distractorCountSliderValue}
    {setDistractorCountSliderValue}
    {distractorBrightnessSliderValue}
    {setDistractorBrightnessSliderValue}
    {letterScaleSliderValue}
    {setLetterScaleSliderValue}
    {toggleMotionPaused}
    {toggleMotionDirection}
    {resetSettings}
  />
</main>

import { homepageSeoContent } from "$lib/content/page-copy";
import { siteMetadata } from "$lib/content/site";
import {
  findTrainerRoute,
  getRouteSlugFromPath,
  getTrainerRoute,
} from "$lib/content/trainer-routes";
import { getTrainingModeGuide } from "$lib/content/training";
import { DEFAULT_CALIBRATION } from "$lib/engine/calibration";
import { firstPreset, settingsFromPreset } from "$lib/engine/presets";
import type { TrainerSettings } from "$lib/engine/presets";
import { darkenHexColor, safeStimulusColor } from "$lib/engine/safety";
import {
  createDebouncedSettingsSaver,
  loadSettings,
} from "$lib/engine/storage";
import type { PatternId, SpeedUnit } from "$lib/engine/types";
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
import type { BehaviorId } from "$lib/trainer/behavior";
import { createTrainerCanvasRuntime } from "$lib/trainer/canvas-runtime";
import type {
  TrainerDialogActions,
  TrainerHudActions,
} from "$lib/trainer/control-actions";
import {
  canAutoHideHud,
  getHudHidden,
  getHudInteractionOpen,
  getHudPointerIntent,
} from "$lib/trainer/hud";
import type { HudBounds } from "$lib/trainer/hud";
import {
  getTrainerShortcutAction,
  isTrainerShortcutCapturedByTarget,
} from "$lib/trainer/keyboard";
import type { TrainerShortcutAction } from "$lib/trainer/keyboard";
import {
  canPatternToggleDirection,
  getAvailableControlSections,
  getControlSectionLabel,
  guideUseCasesByMode,
  homepageGuideUseCases,
  resolveControlSection,
} from "$lib/trainer/options";
import type { ControlSectionId } from "$lib/trainer/options";
import type { CanvasColorMode } from "$lib/trainer/rendering";
import {
  adjustSpeedBySteps,
  applyPresetToSettings,
  applyRouteToSettings,
  isHexColor,
  isLetterWeight,
  isLilacChaserBallColor,
  isPatternId,
  isSpeedUnit,
  isTargetForm,
  resolveSliderInteger,
  resolveSliderNumber,
  resolveSpeedSliderValue,
  resolveSpeedUnit,
  resetSettingsToPresetDefaults,
  resolveStoredSettings,
  trainerSettingBounds,
  updateCalibrationField,
} from "$lib/trainer/settings";
import type {
  CalibrationField,
  TrainerSliderValue,
} from "$lib/trainer/settings";
import {
  desktopHeaderQuery,
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

const getBrowserRouteSlug = () =>
  getRouteSlugFromPath(window.location.pathname);

const handleThemeCheckedChange = (checked: boolean) => {
  setMode(checked ? "dark" : "light");
};

const setMetaContent = (selector: string, content: string) => {
  document.head
    .querySelector<HTMLMetaElement>(selector)
    ?.setAttribute("content", content);
};

export const createTrainerAppController = (getRouteSlug: () => string) => {
  const hudAutoHideDelayMs = 5000;
  const cursorHideDelayMs = 2000;

  let settings = $state<TrainerSettings>(
    applyRouteToSettings(
      settingsFromPreset(firstPreset, DEFAULT_CALIBRATION),
      untrack(getRouteSlug)
    )
  );
  let currentRouteSlug = $state(untrack(getRouteSlug));
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
  const headerPresetSelectOpen = $derived(
    mobilePresetSelectOpen || desktopPresetSelectOpen
  );
  const headerPatternSelectOpen = $derived(
    mobilePatternSelectOpen || desktopPatternSelectOpen
  );
  const headerLilacChaserColorSelectOpen = $derived(
    mobileLilacChaserColorSelectOpen || desktopLilacChaserColorSelectOpen
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

  const safeBallColor = $derived(safeStimulusColor(settings.ballColor));
  const locale = $derived(languageState.locale);
  const localeReady = $derived(languageState.ready);
  const activeRoute = $derived(findTrainerRoute(currentRouteSlug));
  const pageSeoContent = $derived(
    activeRoute?.seoContent ?? homepageSeoContent
  );
  const activeGuideRoute = $derived(
    getTrainerRoute(settings.presetId, settings.patternId)
  );
  const guideSeoContent = $derived(
    activeRoute
      ? (activeGuideRoute?.seoContent ?? pageSeoContent)
      : pageSeoContent
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
  const availableControlSections = $derived(
    getAvailableControlSections(isLilacChaserMode)
  );
  const localizedControlSections = $derived(
    availableControlSections.map((section) => ({
      ...section,
      label: t(locale, section.label),
    }))
  );
  const currentControlSection = $derived(
    resolveControlSection(activeControlSection, availableControlSections)
  );
  const currentControlSectionLabel = $derived(
    t(
      locale,
      getControlSectionLabel(
        resolveControlSection(
          activeControlSection,
          getAvailableControlSections(settings.presetId === "lilacChaser")
        ),
        getAvailableControlSections(settings.presetId === "lilacChaser")
      )
    )
  );
  const activeTrainingModeGuide = $derived(
    getTrainingModeGuide(settings.presetId)
  );
  const guideUseCases = $derived(
    activeRoute ? guideUseCasesByMode[settings.presetId] : homepageGuideUseCases
  );
  const isDarkMode = $derived(colorMode === "dark");
  const canvasState = $derived({
    canToggleDirection,
    distractorColor,
    isLilacChaserMode,
    motionPaused,
    safeBallColor,
    settings: $state.snapshot(settings),
  });
  const canvasRuntime = createTrainerCanvasRuntime({
    getColorMode: () => colorMode,
    getState: () => canvasState,
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

  const behaviorValue = $derived(
    getBehaviorId(settings.speedProfile, settings.sizeProfile)
  );
  const hudInteractionOpen = $derived(
    hudElementInteractionActive ||
      getHudInteractionOpen(
        panelOpen,
        guidePopoverOpen,
        headerPresetSelectOpen,
        headerPatternSelectOpen,
        headerLilacChaserColorSelectOpen,
        languageSelectOpen
      )
  );
  const hudHidden = $derived(
    getHudHidden(hudAutoHideReady, hudVisible, hudInteractionOpen)
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

  const revealHud = () => {
    hudVisible = true;
  };

  $effect(() => {
    if (!storageReady) {
      return;
    }
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

  const attachTrainer: Attachment<HTMLElement> = () =>
    untrack(() => {
      let mounted = true;
      const startHudWhenLanguageReady = async () => {
        await languageState.init();
        if (mounted) {
          hudAutoHideTimer.start();
        }
      };
      const savedSettings = loadSettings();
      syncSettingsFromBrowserRoute(
        savedSettings ? resolveStoredSettings(savedSettings) : settings
      );

      storageReady = true;
      void startHudWhenLanguageReady();
      cursorAutoHideTimer.start();

      const reduceMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );
      if (reduceMotionQuery.matches) {
        setMotionPaused(true);
      }
      const handleReduceMotionChange = (event: MediaQueryListEvent) => {
        if (event.matches) {
          setMotionPaused(true);
        }
      };
      reduceMotionQuery.addEventListener("change", handleReduceMotionChange);

      return () => {
        mounted = false;
        settingsSaver.flush();
        hudAutoHideTimer.clear();
        cursorAutoHideTimer.clear();
        reduceMotionQuery.removeEventListener(
          "change",
          handleReduceMotionChange
        );
      };
    });

  const speedSliderValue = () => [settings.speed.value];

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
    const next = resolveSpeedSliderValue(value, settings.speed.unit);
    if (next === null) {
      return;
    }

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
      if (isLilacChaserMode) {
        drawFrame();
      }
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
      }
    );
  };

  const letterScaleSliderValue = () => [settings.letterScale];

  const setLetterScaleSliderValue = (value: TrainerSliderValue) => {
    applySliderNumber(value, trainerSettingBounds.letterScale, (next) => {
      settings.letterScale = next;
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
    if (guidePopoverOpen) {
      revealHud();
    }
  };

  const setActiveControlSection = (section: ControlSectionId) => {
    activeControlSection = section;
  };

  const toggleGuideFaq = (question: string) => {
    openGuideFaqQuestion = openGuideFaqQuestion === question ? null : question;
  };

  const revealHudTemporarily = () => {
    hudAutoHideTimer.start();
  };

  const setHudInteractionActive = (active: boolean) => {
    if (hudElementInteractionActive === active) {
      return;
    }
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
    if (!canAutoHideHud(hudAutoHideReady, hudInteractionOpen)) {
      return;
    }
    hudVisible = false;
  };

  const handleHeaderPresetOpenChange = (open: boolean) => {
    if (open) {
      revealHud();
    }
  };

  const handleHeaderPatternOpenChange = (open: boolean) => {
    if (open) {
      revealHud();
    }
  };

  const handleHeaderLilacChaserColorOpenChange = (open: boolean) => {
    if (open) {
      revealHud();
    }
  };

  const handleHeaderLanguageOpenChange = (open: boolean) => {
    if (open) {
      revealHud();
    }
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
      revealHud();
      return;
    }

    if (pointerIntent === "hide") {
      hideHud();
    }
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
      settings.calibration
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
    activeControlSection = "targets";
    panelOpen = true;
  };

  const openHeaderSelectFromShortcut = (select: HeaderShortcutSelect) => {
    const useDesktopSelect = window.matchMedia(desktopHeaderQuery).matches;
    const {
      desktopLilacChaserColorSelectOpen: nextDesktopLilacChaserColorSelectOpen,
      desktopPatternSelectOpen: nextDesktopPatternSelectOpen,
      desktopPresetSelectOpen: nextDesktopPresetSelectOpen,
      mobileLilacChaserColorSelectOpen: nextMobileLilacChaserColorSelectOpen,
      mobilePatternSelectOpen: nextMobilePatternSelectOpen,
      mobilePresetSelectOpen: nextMobilePresetSelectOpen,
    } = getHeaderSelectOpenState(select, useDesktopSelect);
    revealHud();

    mobilePresetSelectOpen = nextMobilePresetSelectOpen;
    desktopPresetSelectOpen = nextDesktopPresetSelectOpen;
    mobilePatternSelectOpen = nextMobilePatternSelectOpen;
    desktopPatternSelectOpen = nextDesktopPatternSelectOpen;
    mobileLilacChaserColorSelectOpen = nextMobileLilacChaserColorSelectOpen;
    desktopLilacChaserColorSelectOpen = nextDesktopLilacChaserColorSelectOpen;

    void focusHeaderSelectTriggerFromShortcut({
      flushSvelte,
      select,
      useDesktopSelect,
    });
  };

  const openGuideDialog = () => {
    const guidePopover = document.querySelector("#trainer-guide-popover");
    if (!(guidePopover instanceof HTMLElement)) {
      return false;
    }

    revealHud();
    if (guidePopover.matches(":popover-open")) {
      return true;
    }

    if (guidePopover.showPopover) {
      guidePopover.showPopover();
      return true;
    }

    return false;
  };

  const hasPriorityKeyboardSurface = () =>
    panelOpen ||
    guidePopoverOpen ||
    headerPresetSelectOpen ||
    headerPatternSelectOpen ||
    headerLilacChaserColorSelectOpen ||
    languageSelectOpen ||
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
    applyPreset(value);
    syncBrowserPath();
  };

  const handlePatternChange = (value: string) => {
    if (!isPatternId(value)) {
      return;
    }
    setPattern(value);
    syncBrowserPath();
  };

  const handleSpeedUnitChange = (value: string) => {
    if (isSpeedUnit(value)) {
      setSpeedUnit(value);
    }
  };

  const handleBehaviorChange = (value: string) => {
    if (isBehaviorId(value)) {
      setBehavior(value);
    }
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

  const handleCalibrationInput = (event: Event, field: CalibrationField) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const nextCalibration = updateCalibrationField(
      settings.calibration,
      field,
      Number(target.value)
    );
    if (!nextCalibration) {
      return;
    }

    settings.calibration = nextCalibration;
    refreshBaseSpeed();
  };

  const hudActions: TrainerHudActions = {
    handleHeaderLanguageOpenChange,
    handleHeaderLilacChaserColorOpenChange,
    handleHeaderPatternOpenChange,
    handleHeaderPresetOpenChange,
    handleLilacChaserColorChange,
    handlePatternChange,
    handlePresetChange,
    lilacChaserScaleSlider: {
      set: setLilacChaserScaleSliderValue,
      value: lilacChaserScaleSliderValue,
    },
    openControlsPanel,
    revealHud,
    revealHudTemporarily,
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
      set: setDistractorBrightnessSliderValue,
      value: distractorBrightnessSliderValue,
    },
    distractorCountSlider: {
      set: setDistractorCountSliderValue,
      value: distractorCountSliderValue,
    },
    handleBehaviorChange,
    handleCalibrationInput,
    handleColorInput,
    handleLetterColorInput,
    handleLetterWeightChange,
    handleLilacChaserColorChange,
    handlePatternChange,
    handlePresetChange,
    handleSpeedUnitChange,
    handleTargetFormChange,
    handleThemeCheckedChange,
    letterScaleSlider: {
      set: setLetterScaleSliderValue,
      value: letterScaleSliderValue,
    },
    lilacChaserScaleSlider: {
      set: setLilacChaserScaleSliderValue,
      value: lilacChaserScaleSliderValue,
    },
    onControlSectionChange: setActiveControlSection,
    opacitySlider: {
      set: setOpacitySliderValue,
      value: opacitySliderValue,
    },
    resetSettings,
    sizeSlider: {
      set: setSizeSliderValue,
      value: sizeSliderValue,
    },
    speedSlider: {
      set: setSpeedSliderValue,
      value: speedSliderValue,
    },
    targetCountSlider: {
      set: setTargetCountSliderValue,
      value: targetCountSliderValue,
    },
    toggleMotionDirection,
    toggleMotionPaused,
  };

  $effect(() => {
    if (!motionPaused) {
      return;
    }

    const pausedFrameSettings = $state.snapshot(settings);
    void pausedFrameSettings;
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
    attachHudContentSizer,
    attachHudShell,
    attachTrainer,
    get behaviorValue() {
      return behaviorValue;
    },
    get canToggleDirection() {
      return canToggleDirection;
    },
    get colorMode() {
      return colorMode;
    },
    get currentControlSection() {
      return currentControlSection;
    },
    get currentControlSectionLabel() {
      return currentControlSectionLabel;
    },
    get cursorHidden() {
      return cursorHidden;
    },
    get desktopLilacChaserColorSelectOpen() {
      return desktopLilacChaserColorSelectOpen;
    },
    set desktopLilacChaserColorSelectOpen(open: boolean) {
      desktopLilacChaserColorSelectOpen = open;
    },
    get desktopPatternSelectOpen() {
      return desktopPatternSelectOpen;
    },
    set desktopPatternSelectOpen(open: boolean) {
      desktopPatternSelectOpen = open;
    },
    get desktopPresetSelectOpen() {
      return desktopPresetSelectOpen;
    },
    set desktopPresetSelectOpen(open: boolean) {
      desktopPresetSelectOpen = open;
    },
    dialogActions,
    flushSettings,
    get guideSeoContent() {
      return guideSeoContent;
    },
    get guideUseCases() {
      return guideUseCases;
    },
    handleGuidePopoverToggle,
    handlePopState,
    handleVisibilityChange,
    handleWindowKeydown,
    handleWindowPointerMove,
    hudActions,
    get hudContentWidth() {
      return hudContentWidth;
    },
    get hudHidden() {
      return hudHidden;
    },
    get isDarkMode() {
      return isDarkMode;
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
    get mobileLilacChaserColorSelectOpen() {
      return mobileLilacChaserColorSelectOpen;
    },
    set mobileLilacChaserColorSelectOpen(open: boolean) {
      mobileLilacChaserColorSelectOpen = open;
    },
    get mobilePatternSelectOpen() {
      return mobilePatternSelectOpen;
    },
    set mobilePatternSelectOpen(open: boolean) {
      mobilePatternSelectOpen = open;
    },
    get mobilePresetSelectOpen() {
      return mobilePresetSelectOpen;
    },
    set mobilePresetSelectOpen(open: boolean) {
      mobilePresetSelectOpen = open;
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
    get openGuideFaqQuestion() {
      return openGuideFaqQuestion;
    },
    get pageSeoContent() {
      return pageSeoContent;
    },
    get panelOpen() {
      return panelOpen;
    },
    set panelOpen(open: boolean) {
      panelOpen = open;
    },
    patternSelectContentClass,
    get settings() {
      return settings;
    },
    set settings(nextSettings: TrainerSettings) {
      settings = nextSettings;
    },
    toggleGuideFaq,
  };
};

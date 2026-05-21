<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { TransitionConfig } from "svelte/transition";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SunIcon from "@lucide/svelte/icons/sun";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import XIcon from "@lucide/svelte/icons/x";
  import { ModeWatcher, mode, setMode } from "mode-watcher";

  import ModePathPreview from "$lib/components/ModePathPreview.svelte";
  import PatternPathPreview from "$lib/components/PatternPathPreview.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import {
    DEFAULT_CALIBRATION,
    type Calibration,
    speedToPixelsPerSecond,
  } from "$lib/engine/calibration";
  import { resolveCanvasScale } from "$lib/engine/canvas";
  import {
    getLetterBucket,
    getLetterForBucket,
    getReactionLetterBucket,
  } from "$lib/engine/letters";
  import {
    DEFAULT_BALL_COLOR,
    DEFAULT_LETTER_SCALE,
    exercisePresets,
    firstPreset,
    getPreset,
    patternOptions,
    settingsFromPreset,
    type LetterWeight,
    type TrainerSettings,
    type TrainingMode,
  } from "$lib/engine/presets";
  import {
    getTeleportJumpDistancePx,
    samplePatternInto,
  } from "$lib/engine/patterns";
  import {
    sampleSizeProfile,
    sampleSpeedProfile,
    type SizeProfile,
    type SpeedProfile,
  } from "$lib/engine/profiles";
  import { createRng } from "$lib/engine/random";
  import { darkenHexColor, safeStimulusColor } from "$lib/engine/safety";
  import { legalPageLinks } from "$lib/content/legal";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import {
    findTrainerRoute,
    getTrainerRoute,
    indexableTrainerRoutes,
  } from "$lib/content/trainer-routes";
  import {
    getTrainingModeGuide,
    trainingModeNotes,
  } from "$lib/content/training";
  import {
    createDebouncedSettingsSaver,
    loadSettings,
    type StoredSettings,
  } from "$lib/engine/storage";
  import type {
    Arena,
    PatternId,
    SpeedUnit,
    TargetFrame,
    TargetShape,
  } from "$lib/engine/types";

  const guideUseCasesByMode: Record<TrainingMode, readonly string[]> = {
    pursuit: ["Visual tracking", "Gamer warm-up", "Screen-work reset"],
    reactionTime: ["Quick refocus", "Target acquisition", "Reaction warm-up"],
    mot: ["Selective attention", "Visual clutter", "Game awareness"],
    lilacChaser: ["Steady fixation", "Peripheral awareness", "Screen reset"],
  };
  const homepageGuideUseCases = [
    "FPS warmup",
    "Screen break",
    "Visual practice",
  ] as const;

  const getRouteSlugFromPath = (path: string) =>
    path.split("?")[0]?.split("/").filter(Boolean)[0] ?? "";

  const createSessionSeed = () => Math.floor(Math.random() * 2_147_483_646) + 1;

  const withAlpha = (color: string, alpha: number) => {
    if (!color.startsWith("rgb(")) return color;
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  };

  const getCanvasTheme = (node: HTMLCanvasElement) => {
    const isDark = document.documentElement.classList.contains("dark");
    const background = getComputedStyle(node).backgroundColor;

    return isDark
      ? {
          background,
          trail: withAlpha(background, 0.35),
          grid: "rgba(255, 255, 255, 0.045)",
        }
      : {
          background,
          trail: withAlpha(background, 0.38),
          grid: "rgba(16, 18, 22, 0.075)",
        };
  };

  const FULL_CIRCLE_RADIANS = Math.PI * 2;

  type BehaviorId =
    | "constant"
    | "wavePattern"
    | "surgePattern"
    | "alternatingPattern"
    | "climbPattern"
    | "sizePulse";
  type ControlIconId =
    | "target"
    | "motion"
    | "eye"
    | "calibration"
    | "theme"
    | "reset";
  type ControlSectionId =
    | "session"
    | "drill"
    | "targets"
    | "motion"
    | "screen"
    | "defaults";
  type ControlSection = {
    id: ControlSectionId;
    label: string;
    icon: ControlIconId;
    hideForLilac?: boolean;
  };

  const behaviorOptions: Array<{ id: BehaviorId; name: string }> = [
    { id: "constant", name: "Steady speed" },
    { id: "wavePattern", name: "Speed wave" },
    { id: "surgePattern", name: "Short bursts" },
    { id: "alternatingPattern", name: "Alternating pace" },
    { id: "climbPattern", name: "Build and reset" },
    { id: "sizePulse", name: "Size pulse" },
  ];
  const controlSections: ControlSection[] = [
    {
      id: "session",
      label: "Session",
      icon: "theme",
    },
    {
      id: "drill",
      label: "Drill",
      icon: "target",
    },
    {
      id: "targets",
      label: "Targets",
      icon: "eye",
      hideForLilac: true,
    },
    {
      id: "motion",
      label: "Motion",
      icon: "motion",
      hideForLilac: true,
    },
    {
      id: "screen",
      label: "Screen",
      icon: "calibration",
      hideForLilac: true,
    },
    {
      id: "defaults",
      label: "Defaults",
      icon: "reset",
    },
  ];

  const shapeOptions: Array<{ id: TargetShape; name: string }> = [
    { id: "circle", name: "Circle" },
    { id: "ring", name: "Ring" },
    { id: "square", name: "Square" },
    { id: "diamond", name: "Diamond" },
    { id: "triangle", name: "Triangle" },
    { id: "cross", name: "Cross" },
  ];
  const letterScaleByShape: Record<TargetShape, number> = {
    circle: 1,
    ring: 0.82,
    square: 1.05,
    diamond: 0.86,
    triangle: 0.76,
    cross: 0.72,
  };
  const letterWeightOptions: Array<{ id: LetterWeight; name: string }> = [
    { id: 400, name: "Regular" },
    { id: 500, name: "Medium" },
    { id: 600, name: "Semibold" },
    { id: 700, name: "Bold" },
    { id: 800, name: "Heavy" },
  ];

  const maxSpeedByUnit: Record<SpeedUnit, number> = {
    "deg/s": 100,
    "cm/s": 143,
    "screen/s": 6,
  };

  const speedStepByUnit: Record<SpeedUnit, number> = {
    "deg/s": 1,
    "cm/s": 1,
    "screen/s": 0.05,
  };

  const pursuitPatternOptions = patternOptions.filter(
    (option) => option.id !== "multipleObjectTracking",
  );
  const unpredictivePatternIds: PatternId[] = ["randomWalk", "directionChange"];
  const directionTogglePatternIds: PatternId[] = [
    "circle",
    "ellipse",
    "figureEight",
    "wave",
    "spiralBloom",
    "clover",
    "lissajous",
    "hourglass",
    "orbitShift",
  ];
  const unpredictivePatternOptions = pursuitPatternOptions.filter((option) =>
    unpredictivePatternIds.includes(option.id),
  );
  const predictivePatternOptions = pursuitPatternOptions.filter(
    (option) => !unpredictivePatternIds.includes(option.id),
  );

  let { routeSlug = "" }: { routeSlug?: string } = $props();

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
  };

  const isFiniteNumber = (value: unknown): value is number => {
    return typeof value === "number" && Number.isFinite(value);
  };

  const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  };

  const isHexColor = (value: unknown): value is string => {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  };

  const isSpeedUnit = (value: string): value is SpeedUnit => {
    return value === "deg/s" || value === "cm/s" || value === "screen/s";
  };

  const isPatternId = (value: string): value is PatternId => {
    return patternOptions.some((option) => option.id === value);
  };

  const isBehaviorId = (value: string): value is BehaviorId => {
    return behaviorOptions.some((option) => option.id === value);
  };

  const isTargetShape = (value: string): value is TargetShape => {
    return shapeOptions.some((option) => option.id === value);
  };

  const isLetterWeight = (value: number): value is LetterWeight => {
    return letterWeightOptions.some((option) => option.id === value);
  };

  const isLilacChaserBallColor = (value: unknown): value is string => {
    return (
      typeof value === "string" &&
      lilacChaserColorOptions.some((option) => option.id === value)
    );
  };

  const resolveNumber = (
    value: unknown,
    min: number,
    max: number,
    fallback: number,
  ) => {
    return isFiniteNumber(value) ? clamp(value, min, max) : fallback;
  };

  const resolveInteger = (
    value: unknown,
    min: number,
    max: number,
    fallback: number,
  ) => Math.round(resolveNumber(value, min, max, fallback));

  const isSpeedProfile = (profile: unknown): profile is SpeedProfile => {
    if (!isRecord(profile) || typeof profile.kind !== "string") return false;
    if (profile.kind === "constant") return true;

    if (profile.kind === "sine") {
      return (
        isFiniteNumber(profile.minMultiplier) &&
        isFiniteNumber(profile.maxMultiplier) &&
        isFiniteNumber(profile.periodSec) &&
        profile.periodSec > 0
      );
    }

    if (profile.kind === "steps") {
      return (
        Array.isArray(profile.multipliers) &&
        profile.multipliers.length > 0 &&
        profile.multipliers.every(isFiniteNumber) &&
        isFiniteNumber(profile.intervalSec) &&
        profile.intervalSec > 0 &&
        isFiniteNumber(profile.transitionSec) &&
        profile.transitionSec >= 0
      );
    }

    if (profile.kind === "loopRamp") {
      return (
        isFiniteNumber(profile.fromMultiplier) &&
        isFiniteNumber(profile.toMultiplier) &&
        isFiniteNumber(profile.periodSec) &&
        profile.periodSec > 0 &&
        isFiniteNumber(profile.resetSec) &&
        profile.resetSec >= 0
      );
    }

    return false;
  };

  const isSizeProfile = (profile: unknown): profile is SizeProfile => {
    if (!isRecord(profile) || typeof profile.kind !== "string") return false;
    if (profile.kind === "constant") return true;

    return (
      profile.kind === "pulse" &&
      isFiniteNumber(profile.minMultiplier) &&
      isFiniteNumber(profile.maxMultiplier) &&
      isFiniteNumber(profile.periodSec) &&
      profile.periodSec > 0
    );
  };

  const resolveSpeed = (
    speed: unknown,
    fallback: TrainerSettings["speed"],
  ): TrainerSettings["speed"] => {
    if (!isRecord(speed)) return { ...fallback };

    const unit =
      typeof speed.unit === "string" && isSpeedUnit(speed.unit)
        ? speed.unit
        : fallback.unit;

    return {
      unit,
      value: resolveNumber(
        speed.value,
        0.5,
        maxSpeedByUnit[unit],
        fallback.value,
      ),
    };
  };

  const resolveCalibration = (calibration: unknown): Calibration => {
    if (!isRecord(calibration)) return DEFAULT_CALIBRATION;

    return {
      id: typeof calibration.id === "string" ? calibration.id : "custom",
      viewingDistanceCm: resolveNumber(
        calibration.viewingDistanceCm,
        20,
        120,
        DEFAULT_CALIBRATION.viewingDistanceCm,
      ),
      cssPxPerCm: resolveNumber(
        calibration.cssPxPerCm,
        10,
        120,
        DEFAULT_CALIBRATION.cssPxPerCm,
      ),
      createdAt: isFiniteNumber(calibration.createdAt)
        ? calibration.createdAt
        : DEFAULT_CALIBRATION.createdAt,
    };
  };

  let canvas!: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let arena: Arena = { width: 1, height: 1 };
  let elapsedSec = 0;
  let travelPx = 0;
  let currentSpeedPxPerSec = 0;
  let baseSpeedPxPerSec = 0;
  let seed = createSessionSeed();
  let rng = createRng(seed);
  let canvasTheme: ReturnType<typeof getCanvasTheme> | null = null;
  let gridPath: Path2D | null = null;
  let canvasScale = 1;
  let lastLilacChaserHiddenIndex = -1;
  const targetFrames: TargetFrame[] = [];
  const lilacChaserDotCount = 12;
  const lilacChaserStepSec = 0.1;
  const lilacChaserOrbitRatio = 0.3381;
  const lilacChaserDotRatio = 0.0399;
  const lilacChaserCrossArmRatio = 0.0132;
  const lilacChaserCrossStrokeRatio = 0.0125;
  const lilacChaserTheme = {
    background: "#d8d8da",
    cross: "#050505",
  };
  const lilacChaserColorOptions = [
    { id: "#ff00fe", name: "Magenta" },
    { id: "#ff3030", name: "Red" },
    { id: "#245cff", name: "Blue" },
    { id: "#ffcc00", name: "Gold" },
    { id: "#00d7ff", name: "Cyan" },
  ] as const;
  const lilacChaserUnitPoints = Array.from(
    { length: lilacChaserDotCount },
    (_, index) => {
      const angle =
        -Math.PI / 2 + (index / lilacChaserDotCount) * FULL_CIRCLE_RADIANS;
      return [Math.cos(angle), Math.sin(angle)] as const;
    },
  );

  const getPreservedSettings = (currentSettings: TrainerSettings) => ({
    speed: currentSettings.speed,
    baseRadiusPx: currentSettings.baseRadiusPx,
    speedProfile: currentSettings.speedProfile,
    sizeProfile: currentSettings.sizeProfile,
    targetCount: currentSettings.targetCount,
    distractorCount: currentSettings.distractorCount,
    showTrail: currentSettings.showTrail,
    ballColor: currentSettings.ballColor,
    distractorBrightness: currentSettings.distractorBrightness,
    targetOpacity: currentSettings.targetOpacity,
    targetShape: currentSettings.targetShape,
    motionDirection: currentSettings.motionDirection,
    letterEnabled: currentSettings.letterEnabled,
    letterColor: currentSettings.letterColor,
    letterWeight: currentSettings.letterWeight,
    letterScale: currentSettings.letterScale,
    lilacChaserScale: currentSettings.lilacChaserScale,
    lilacChaserBallColor: currentSettings.lilacChaserBallColor,
  });

  const applyRouteToSettings = (
    currentSettings: TrainerSettings,
    nextSlug: string | undefined,
  ) => {
    const route = findTrainerRoute(nextSlug);
    const preset = route ? getPreset(route.mode) : firstPreset;
    const nextSettings = settingsFromPreset(
      preset,
      currentSettings.calibration,
      getPreservedSettings(currentSettings),
    );

    if (route?.mode === "pursuit" && route.patternId) {
      nextSettings.patternId = route.patternId;
    }

    if (preset.id === "mot" && currentSettings.presetId !== "mot") {
      nextSettings.distractorCount = preset.distractorCount;
    }

    return nextSettings;
  };

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
  let motionPaused = $state(false);
  let storageReady = $state(false);
  let hudAutoHideReady = $state(false);
  let hudVisible = $state(true);
  let cursorHidden = $state(false);
  let headerPresetSelectOpen = $state(false);
  let headerPatternSelectOpen = $state(false);
  let headerLilacChaserColorSelectOpen = $state(false);
  let colorMode = $state<"light" | "dark">(
    typeof document !== "undefined" &&
      !document.documentElement.classList.contains("dark")
      ? "light"
      : "dark",
  );

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
    directionTogglePatternIds.includes(settings.patternId),
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
    controlSections.filter(
      (section) => !section.hideForLilac || !isLilacChaserMode,
    ),
  );
  let currentControlSection: ControlSectionId = $derived.by(() => {
    const fallback = availableControlSections[0]?.id ?? "session";
    return availableControlSections.some(
      (section) => section.id === activeControlSection,
    )
      ? activeControlSection
      : fallback;
  });
  let currentControlSectionLabel = $derived(
    availableControlSections.find(
      (section) => section.id === currentControlSection,
    )?.label ?? "Controls",
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

  const getBehaviorId = (
    speedProfile: SpeedProfile,
    sizeProfile: SizeProfile,
  ): BehaviorId => {
    if (sizeProfile.kind === "pulse") return "sizePulse";
    if (speedProfile.kind === "loopRamp") return "climbPattern";
    if (speedProfile.kind === "steps") {
      return speedProfile.intervalSec <= 0.7
        ? "surgePattern"
        : "alternatingPattern";
    }
    if (speedProfile.kind === "sine") {
      return "wavePattern";
    }
    return "constant";
  };

  let behaviorValue = $derived(
    getBehaviorId(settings.speedProfile, settings.sizeProfile),
  );
  let hudHidden = $derived(
    hudAutoHideReady &&
      !hudVisible &&
      !panelOpen &&
      !headerPresetSelectOpen &&
      !headerPatternSelectOpen &&
      !headerLilacChaserColorSelectOpen,
  );
  let hudShell: HTMLDivElement | undefined;
  let hudHideTimeout: number | undefined;
  let cursorHideTimeout: number | undefined;
  const settingsSaver = createDebouncedSettingsSaver();

  $effect(() => {
    const settingsSnapshot = $state.snapshot(settings);
    if (storageReady) settingsSaver.schedule(settingsSnapshot);
  });

  $effect(() => {
    if (motionPaused) drawFrame();
  });

  const attachCanvas: Attachment<HTMLCanvasElement> = (node) => {
    canvas = node;
    context = node.getContext("2d", { alpha: false, desynchronized: true });

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);

    canvasTheme = getCanvasTheme(node);
    resizeCanvas();
    if (shouldAnimateMotion()) startLoop();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  };

  onMount(() => {
    const savedSettings = loadSettings();
    const browserRouteSlug = getBrowserRouteSlug();
    currentRouteSlug = browserRouteSlug;
    settings = applyRouteToSettings(
      savedSettings ? mergeSettings(savedSettings) : settings,
      browserRouteSlug,
    );
    resetDirectionForFixedPatterns(settings.patternId);
    refreshBaseSpeed();

    const handlePopState = () => {
      const nextRouteSlug = getBrowserRouteSlug();
      currentRouteSlug = nextRouteSlug;
      settings = applyRouteToSettings(settings, nextRouteSlug);
      resetDirectionForFixedPatterns(settings.patternId);
      refreshBaseSpeed();
      drawFrame();
    };
    window.addEventListener("popstate", handlePopState);

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
    window.addEventListener("pagehide", settingsSaver.flush);

    return () => {
      settingsSaver.flush();
      clearHudAutoHideTimer();
      clearCursorHideTimer();
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pagehide", settingsSaver.flush);
      reduceMotionQuery.removeEventListener("change", handleReduceMotionChange);
    };
  });

  const mergeSettings = (saved: StoredSettings) => {
    const preset = getPreset(saved.presetId ?? firstPreset.id);
    const presetId = preset.id;
    const patternId =
      presetId === "pursuit" &&
      typeof saved.patternId === "string" &&
      isPatternId(saved.patternId) &&
      saved.patternId !== "multipleObjectTracking"
        ? saved.patternId
        : preset.patternId;
    let speedProfile = isSpeedProfile(saved.speedProfile)
      ? saved.speedProfile
      : preset.speedProfile;
    const sizeProfile = isSizeProfile(saved.sizeProfile)
      ? saved.sizeProfile
      : preset.sizeProfile;
    if (sizeProfile.kind === "pulse") speedProfile = { kind: "constant" };
    return settingsFromPreset(preset, resolveCalibration(saved.calibration), {
      presetId,
      patternId,
      speed: resolveSpeed(saved.speed, preset.speed),
      baseRadiusPx: resolveNumber(
        saved.baseRadiusPx,
        4,
        100,
        preset.baseRadiusPx,
      ),
      speedProfile,
      sizeProfile,
      targetCount: resolveInteger(saved.targetCount, 1, 6, preset.targetCount),
      distractorCount: resolveInteger(
        saved.distractorCount,
        0,
        10,
        preset.distractorCount,
      ),
      showTrail: saved.showTrail === true,
      ballColor: isHexColor(saved.ballColor)
        ? safeStimulusColor(saved.ballColor)
        : DEFAULT_BALL_COLOR,
      distractorBrightness: resolveNumber(
        saved.distractorBrightness,
        0.35,
        1,
        0.7,
      ),
      targetOpacity: resolveNumber(saved.targetOpacity, 0, 1, 1),
      targetShape:
        typeof saved.targetShape === "string" &&
        isTargetShape(saved.targetShape)
          ? saved.targetShape
          : "circle",
      motionDirection: saved.motionDirection === -1 ? -1 : 1,
      letterEnabled: saved.letterEnabled === true,
      letterColor: isHexColor(saved.letterColor)
        ? saved.letterColor
        : "#000000",
      letterWeight:
        isFiniteNumber(saved.letterWeight) && isLetterWeight(saved.letterWeight)
          ? saved.letterWeight
          : 600,
      letterScale: resolveNumber(
        saved.letterScale,
        0.45,
        1.2,
        DEFAULT_LETTER_SCALE,
      ),
      lilacChaserScale: resolveNumber(saved.lilacChaserScale, 0.75, 1.5, 1),
      lilacChaserBallColor: isLilacChaserBallColor(saved.lilacChaserBallColor)
        ? saved.lilacChaserBallColor
        : "#ff00fe",
    });
  };

  const readSliderNumber = (value: number[] | undefined) => {
    const next = value?.[0];
    return isFiniteNumber(next) ? next : null;
  };

  const speedSliderValue = () => [settings.speed.value];

  const hudControlEase = (t: number) => 1 - Math.pow(1 - t, 3);

  const hudControlTransition = (
    _node: Element,
    { y = 2, duration = 100 }: { y?: number; duration?: number } = {},
  ): TransitionConfig => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return { duration: 0 };
    }

    return {
      duration,
      easing: hudControlEase,
      css: (t, u) => `
        opacity: ${t};
        transform: translate3d(0, ${y * u}px, 0) scale(${0.985 + t * 0.015});
        transform-origin: center;
      `,
    };
  };

  const attachHudContentSizer: Attachment<HTMLDivElement> = (node) => {
    const updateWidth = () => {
      hudContentWidth = Math.ceil(node.getBoundingClientRect().width);
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    const animationFrame = requestAnimationFrame(updateWidth);

    resizeObserver.observe(node);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  };

  const setSpeedSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;

    settings.speed = {
      ...settings.speed,
      value: clamp(next, 0.5, maxSpeedByUnit[settings.speed.unit]),
    };
    refreshBaseSpeed();
  };

  const sizeSliderValue = () => [settings.baseRadiusPx];

  const setSizeSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.baseRadiusPx = clamp(next, 4, 100);
  };

  const lilacChaserScaleSliderValue = () => [settings.lilacChaserScale];

  const setLilacChaserScaleSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.lilacChaserScale = clamp(next, 0.75, 1.5);
    invalidateLilacChaserFrame();
    if (isLilacChaserMode) drawFrame();
  };

  const opacitySliderValue = () => [settings.targetOpacity];

  const setOpacitySliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.targetOpacity = clamp(next, 0, 1);
  };

  const targetCountSliderValue = () => [settings.targetCount];

  const setTargetCountSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.targetCount = Math.round(clamp(next, 1, 6));
  };

  const distractorCountSliderValue = () => [settings.distractorCount];

  const setDistractorCountSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.distractorCount = Math.round(clamp(next, 0, 10));
  };

  const distractorBrightnessSliderValue = () => [settings.distractorBrightness];

  const setDistractorBrightnessSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.distractorBrightness = clamp(next, 0.35, 1);
  };

  const letterScaleSliderValue = () => [settings.letterScale];

  const setLetterScaleSliderValue = (value: number[] | undefined) => {
    const next = readSliderNumber(value);
    if (next === null) return;
    settings.letterScale = clamp(next, 0.45, 1.2);
  };

  const resizeCanvas = (entries?: ResizeObserverEntry[]) => {
    if (!context) return;
    const observedRect = entries?.[0]?.contentRect;
    const rect = observedRect ?? canvas.getBoundingClientRect();
    const nextArena = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };
    const arenaChanged =
      nextArena.width !== arena.width || nextArena.height !== arena.height;
    arena = nextArena;
    const scale = resolveCanvasScale(
      arena.width,
      arena.height,
      window.devicePixelRatio || 1,
    );
    const canvasWidth = Math.max(1, Math.round(arena.width * scale));
    const canvasHeight = Math.max(1, Math.round(arena.height * scale));
    const backingStoreChanged =
      canvas.width !== canvasWidth || canvas.height !== canvasHeight;
    if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
    if (canvas.height !== canvasHeight) canvas.height = canvasHeight;
    if (backingStoreChanged || canvasScale !== scale) {
      canvasScale = scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    }
    if (arenaChanged) {
      refreshBaseSpeed();
      rebuildGridPath();
      invalidateLilacChaserFrame();
    }
    drawFrame();
  };

  const rebuildGridPath = () => {
    const path = new Path2D();
    const step = Math.max(96, Math.min(arena.width, arena.height) / 5);
    for (let x = step; x < arena.width; x += step) {
      path.moveTo(x, 0);
      path.lineTo(x, arena.height);
    }
    for (let y = step; y < arena.height; y += step) {
      path.moveTo(0, y);
      path.lineTo(arena.width, y);
    }
    gridPath = path;
  };

  const shouldAnimateMotion = () => !motionPaused && !document.hidden;

  const stopLoop = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTimestamp = 0;
  };

  const startLoop = () => {
    if (!shouldAnimateMotion()) return;
    stopLoop();
    animationFrame = requestAnimationFrame(tick);
  };

  const tick = (timestamp: number) => {
    if (!shouldAnimateMotion()) {
      stopLoop();
      return;
    }

    const deltaMs =
      lastTimestamp === 0 ? 16.7 : Math.min(80, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    const deltaSec = deltaMs / 1000;
    currentSpeedPxPerSec = getSpeedPxPerSec(elapsedSec);
    travelPx +=
      currentSpeedPxPerSec *
      deltaSec *
      (canToggleDirection ? settings.motionDirection : 1);
    elapsedSec += deltaSec;
    if (shouldDrawTickFrame()) drawFrame();
    animationFrame = requestAnimationFrame(tick);
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
    if (directionTogglePatternIds.includes(patternId)) return;
    settings.motionDirection = 1;
    if (travelPx < 0) travelPx = Math.abs(travelPx);
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
    return samplePatternInto(
      targetFrames,
      patternId,
      timeSec,
      arena,
      {
        radiusPx,
        pathMarginPx: 16,
        speedPxPerSec,
        travelPx,
        targetCount: settings.targetCount,
        distractorCount: settings.distractorCount,
        colorA: safeBallColor,
        colorB: distractorColor,
      },
      rng,
    );
  };

  const drawFrame = () => {
    if (!context) return;
    const ctx = context;
    if (isLilacChaserMode) {
      drawLilacChaserFrame(ctx);
      return;
    }

    const theme = canvasTheme ?? getCanvasTheme(canvas);
    ctx.fillStyle = settings.showTrail ? theme.trail : theme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);
    drawGuides(ctx, theme);

    const frameCount = sampleFrameCount(elapsedSec);
    for (let index = 0; index < frameCount; index += 1) {
      drawTarget(ctx, targetFrames[index], index);
    }
  };

  const getLilacChaserHiddenIndex = () =>
    Math.floor(elapsedSec / lilacChaserStepSec) % lilacChaserDotCount;

  const invalidateLilacChaserFrame = () => {
    lastLilacChaserHiddenIndex = -1;
  };

  const shouldDrawTickFrame = () => {
    if (!isLilacChaserMode) return true;
    return getLilacChaserHiddenIndex() !== lastLilacChaserHiddenIndex;
  };

  const drawLilacChaserFrame = (ctx: CanvasRenderingContext2D) => {
    const centerX = arena.width / 2;
    const centerY = arena.height / 2;
    const minSide = Math.min(arena.width, arena.height);
    const scale = settings.lilacChaserScale;
    const orbitRadius = minSide * lilacChaserOrbitRatio * scale;
    const dotRadius = minSide * lilacChaserDotRatio * scale;
    const crossRadius = minSide * lilacChaserCrossArmRatio * scale;
    const hiddenIndex = getLilacChaserHiddenIndex();
    lastLilacChaserHiddenIndex = hiddenIndex;

    ctx.fillStyle = lilacChaserTheme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);

    ctx.fillStyle = settings.lilacChaserBallColor;
    for (let index = 0; index < lilacChaserDotCount; index += 1) {
      if (index === hiddenIndex) continue;
      const point = lilacChaserUnitPoints[index];
      const x = centerX + point[0] * orbitRadius;
      const y = centerY + point[1] * orbitRadius;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, FULL_CIRCLE_RADIANS);
      ctx.fill();
    }

    ctx.strokeStyle = lilacChaserTheme.cross;
    ctx.lineWidth = minSide * lilacChaserCrossStrokeRatio * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(centerX - crossRadius, centerY);
    ctx.lineTo(centerX + crossRadius, centerY);
    ctx.moveTo(centerX, centerY - crossRadius);
    ctx.lineTo(centerX, centerY + crossRadius);
    ctx.stroke();
  };

  const drawGuides = (
    ctx: CanvasRenderingContext2D,
    theme: ReturnType<typeof getCanvasTheme>,
  ) => {
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    if (gridPath) ctx.stroke(gridPath);
  };

  const drawTarget = (
    ctx: CanvasRenderingContext2D,
    frame: TargetFrame,
    index: number,
  ) => {
    if (!frame.visible) return;

    const alpha = frame.alpha * settings.targetOpacity;
    if (alpha <= 0) return;

    if (!settings.letterEnabled) {
      if (alpha !== 1) ctx.globalAlpha = alpha;
      ctx.fillStyle = frame.color;
      drawStimulusShape(
        ctx,
        frame.x,
        frame.y,
        frame.radiusPx,
        settings.targetShape,
      );
      if (alpha !== 1) ctx.globalAlpha = 1;
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = frame.color;
    drawStimulusShape(
      ctx,
      frame.x,
      frame.y,
      frame.radiusPx,
      settings.targetShape,
    );
    drawTargetLetter(ctx, frame, index);
    ctx.restore();
  };

  const getLetterFontSize = (radiusPx: number, shape: TargetShape) => {
    return Math.max(
      6,
      radiusPx * letterScaleByShape[shape] * settings.letterScale,
    );
  };

  const drawTargetLetter = (
    ctx: CanvasRenderingContext2D,
    frame: TargetFrame,
    index: number,
  ) => {
    if (settings.presetId === "reactionTime") {
      const bucket = getReactionLetterBucket(
        travelPx,
        getTeleportJumpDistancePx(arena, frame.radiusPx),
      );
      drawLetterGlyph(ctx, getLetterForBucket(seed, index, bucket), frame);
      return;
    }

    const bucket = getLetterBucket(elapsedSec);
    drawLetterGlyph(ctx, getLetterForBucket(seed, index, bucket), frame);
  };

  const drawLetterGlyph = (
    ctx: CanvasRenderingContext2D,
    letter: string,
    frame: TargetFrame,
  ) => {
    const fontSize = getLetterFontSize(frame.radiusPx, settings.targetShape);
    ctx.save();
    ctx.fillStyle = settings.letterColor;
    ctx.font = `${settings.letterWeight} ${fontSize}px Geist, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(frame.x, frame.y + fontSize * 0.04);
    ctx.fillText(letter, 0, 0);
    ctx.restore();
  };

  const drawStimulusShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusPx: number,
    shape: TargetShape,
  ) => {
    if (shape === "square") {
      ctx.fillRect(x - radiusPx, y - radiusPx, radiusPx * 2, radiusPx * 2);
      return;
    }

    ctx.beginPath();

    if (shape === "diamond") {
      ctx.moveTo(x, y - radiusPx * 1.25);
      ctx.lineTo(x + radiusPx * 1.25, y);
      ctx.lineTo(x, y + radiusPx * 1.25);
      ctx.lineTo(x - radiusPx * 1.25, y);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (shape === "triangle") {
      ctx.moveTo(x, y - radiusPx * 1.25);
      ctx.lineTo(x + radiusPx * 1.15, y + radiusPx);
      ctx.lineTo(x - radiusPx * 1.15, y + radiusPx);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (shape === "cross") {
      ctx.lineWidth = Math.max(3, radiusPx * 0.45);
      ctx.lineCap = "round";
      ctx.strokeStyle = ctx.fillStyle;
      ctx.moveTo(x - radiusPx, y);
      ctx.lineTo(x + radiusPx, y);
      ctx.moveTo(x, y - radiusPx);
      ctx.lineTo(x, y + radiusPx);
      ctx.stroke();
      return;
    }

    ctx.arc(x, y, radiusPx, 0, FULL_CIRCLE_RADIANS);
    if (shape === "ring") {
      ctx.lineWidth = Math.max(3, radiusPx * 0.28);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
      return;
    }

    ctx.fill();
  };

  const applyPreset = (presetId: string) => {
    const preset = getPreset(presetId);
    const calibration = settings.calibration;
    settings = settingsFromPreset(preset, calibration, {
      speed: settings.speed,
      baseRadiusPx: settings.baseRadiusPx,
      speedProfile: settings.speedProfile,
      sizeProfile: settings.sizeProfile,
      targetCount: settings.targetCount,
      distractorCount:
        preset.id === "mot" && settings.presetId !== "mot"
          ? preset.distractorCount
          : settings.distractorCount,
      showTrail: settings.showTrail,
      ballColor: settings.ballColor,
      distractorBrightness: settings.distractorBrightness,
      targetOpacity: settings.targetOpacity,
      targetShape: settings.targetShape,
      motionDirection: settings.motionDirection,
      letterEnabled: settings.letterEnabled,
      letterColor: settings.letterColor,
      letterWeight: settings.letterWeight,
      letterScale: settings.letterScale,
      lilacChaserScale: settings.lilacChaserScale,
      lilacChaserBallColor: settings.lilacChaserBallColor,
    });
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
    const preset = getPreset(settings.presetId);
    const patternId = settings.patternId;
    settings = settingsFromPreset(preset, DEFAULT_CALIBRATION, {
      patternId,
    });
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
  };

  const startCursorHideTimer = () => {
    clearCursorHideTimer();
    cursorHidden = false;
    cursorHideTimeout = window.setTimeout(() => {
      cursorHidden = true;
    }, 2000);
  };

  const isHudInteractionOpen = () =>
    panelOpen ||
    guidePopoverOpen ||
    headerPresetSelectOpen ||
    headerPatternSelectOpen ||
    headerLilacChaserColorSelectOpen;

  const handleGuidePopoverToggle = (event: ToggleEvent) => {
    guidePopoverOpen = event.newState === "open";
    if (guidePopoverOpen) revealHud();
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
      if (!isHudInteractionOpen()) hudVisible = false;
    }, 5000);
  };

  const revealHud = () => {
    hudVisible = true;
  };

  const hideHud = () => {
    if (!hudAutoHideReady || isHudInteractionOpen()) return;
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

    const hudBounds = hudShell?.getBoundingClientRect();
    const isOverHudWidth =
      hudBounds &&
      event.clientX >= hudBounds.left &&
      event.clientX <= hudBounds.right;

    if (event.clientY <= 96 && isOverHudWidth) {
      revealHud();
      return;
    }

    if (event.clientY > 160) hideHud();
  };

  const setPattern = (patternId: PatternId) => {
    settings.patternId = patternId;
    resetDirectionForFixedPatterns(patternId);
  };

  const setSpeedUnit = (unit: SpeedUnit) => {
    settings.speed = {
      unit,
      value: clamp(settings.speed.value, 0.5, maxSpeedByUnit[unit]),
    };
    refreshBaseSpeed();
  };

  const setBehavior = (behavior: BehaviorId) => {
    settings.sizeProfile = { kind: "constant" };

    if (behavior === "constant") {
      settings.speedProfile = { kind: "constant" };
      return;
    }

    if (behavior === "wavePattern") {
      settings.speedProfile = {
        kind: "sine",
        minMultiplier: 0.45,
        maxMultiplier: 1.55,
        periodSec: 5.2,
      };
      return;
    }

    if (behavior === "surgePattern") {
      settings.speedProfile = {
        kind: "steps",
        multipliers: [0.45, 1.65, 0.55, 1.5, 0.8],
        intervalSec: 0.65,
        transitionSec: 0.18,
      };
      return;
    }

    if (behavior === "alternatingPattern") {
      settings.speedProfile = {
        kind: "steps",
        multipliers: [0.5, 1.5, 0.65, 1.35],
        intervalSec: 1.25,
        transitionSec: 0.28,
      };
      return;
    }

    if (behavior === "climbPattern") {
      settings.speedProfile = {
        kind: "loopRamp",
        fromMultiplier: 0.45,
        toMultiplier: 1.65,
        periodSec: 5.8,
        resetSec: 1.2,
      };
      return;
    }

    settings.speedProfile = { kind: "constant" };
    settings.sizeProfile = {
      kind: "pulse",
      minMultiplier: 0.7,
      maxMultiplier: 1.4,
      periodSec: 3.2,
    };
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

  const getOptionName = <T extends string | number>(
    options: Array<{ id: T; name: string }>,
    id: T,
  ) => options.find((option) => option.id === id)?.name ?? String(id);

  const getPresetName = (id: string) => getPreset(id).name;
  const getPatternName = (id: PatternId) => getOptionName(patternOptions, id);
  const getBehaviorName = (id: BehaviorId) =>
    getOptionName(behaviorOptions, id);
  const getShapeName = (id: TargetShape) => getOptionName(shapeOptions, id);
  const getLetterWeightName = (id: LetterWeight) =>
    getOptionName(letterWeightOptions, id);
  const getLilacChaserColorName = (id: string) =>
    getOptionName([...lilacChaserColorOptions], id);
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

  const handleCalibrationInput = (
    event: Event,
    field: "viewingDistanceCm" | "cssPxPerCm",
  ) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    const value = Number(target.value);
    if (!Number.isFinite(value) || value <= 0) return;
    settings.calibration = {
      ...settings.calibration,
      id: `custom-${Date.now()}`,
      [field]: value,
      createdAt: Date.now(),
    };
    refreshBaseSpeed();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    startLoop();
  };

  $effect(() => {
    const nextMode = mode.current;
    if (nextMode !== "light" && nextMode !== "dark") return;
    colorMode = nextMode;
    if (!canvas) return;
    requestAnimationFrame(() => {
      canvasTheme = getCanvasTheme(canvas);
      drawFrame();
    });
  });
</script>

{#snippet settingHeader(icon: ControlIconId, label: string)}
  <div
    class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
  >
    {#if icon === "target"}
      <TargetIcon class="size-4 text-accent" />
    {:else if icon === "motion"}
      <ActivityIcon class="size-4 text-accent" />
    {:else if icon === "eye"}
      <EyeIcon class="size-4 text-accent" />
    {:else if icon === "theme"}
      {#if colorMode === "dark"}
        <MoonIcon class="size-4 text-accent" />
      {:else}
        <SunIcon class="size-4 text-accent" />
      {/if}
    {:else if icon === "reset"}
      <RotateCcwIcon class="size-4 text-accent" />
    {:else}
      <SettingsIcon class="size-4 text-accent" />
    {/if}
    {label}
  </div>
{/snippet}

{#snippet sliderRow(label: string, valueLabel: string)}
  <span
    class="flex items-center justify-between gap-4 text-xs text-muted-foreground"
  >
    {label}
    <strong class="font-semibold tabular-nums text-foreground">
      {valueLabel}
    </strong>
  </span>
{/snippet}

{#snippet previewSelectLabel(patternId: PatternId, label: string)}
  <span class="flex min-w-0 items-center gap-2">
    <PatternPathPreview {patternId} compact />
    <span class="truncate">{label}</span>
  </span>
{/snippet}

{#snippet patternSelectGroups()}
  <Select.Group>
    <Select.GroupHeading>Unpredictive</Select.GroupHeading>
    {#each unpredictivePatternOptions as option (option.id)}
      <Select.Item value={option.id}>
        {@render previewSelectLabel(option.id, option.name)}
      </Select.Item>
    {/each}
  </Select.Group>
  <Select.Group>
    <Select.GroupHeading>Predictive</Select.GroupHeading>
    {#each predictivePatternOptions as option (option.id)}
      <Select.Item value={option.id}>
        {@render previewSelectLabel(option.id, option.name)}
      </Select.Item>
    {/each}
  </Select.Group>
{/snippet}

{#snippet modeSelectLabel(modeId: TrainingMode, label: string)}
  <span class="flex min-w-0 items-center gap-2">
    <ModePathPreview mode={modeId} compact />
    <span class="truncate">{label}</span>
  </span>
{/snippet}

{#snippet triggerLabel(label: string)}
  <span class="min-w-0 truncate">{label}</span>
{/snippet}

{#snippet colorSelectLabel(color: string, label: string)}
  <span class="flex min-w-0 items-center gap-2">
    <svg
      viewBox="0 0 12 12"
      class="size-3 shrink-0 rounded-full border border-border/60"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="6" fill={color} />
    </svg>
    <span class="truncate">{label}</span>
  </span>
{/snippet}

{#snippet controlSectionIcon(icon: ControlIconId)}
  {#if icon === "target"}
    <TargetIcon />
  {:else if icon === "motion"}
    <ActivityIcon />
  {:else if icon === "eye"}
    <EyeIcon />
  {:else if icon === "theme"}
    {#if colorMode === "dark"}
      <MoonIcon />
    {:else}
      <SunIcon />
    {/if}
  {:else if icon === "reset"}
    <RotateCcwIcon />
  {:else}
    <SettingsIcon />
  {/if}
{/snippet}

{#snippet sessionControls()}
  <section class="settings-section space-y-6">
    {@render settingHeader("theme", "Session")}
    <div class="grid gap-5">
      <div class="flex min-h-12 items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          {#if motionPaused}
            <PlayIcon class="size-5 shrink-0 text-accent" />
          {:else}
            <PauseIcon class="size-5 shrink-0 text-accent" />
          {/if}
          <span class="truncate text-base font-medium">Motion</span>
        </div>
        <Button
          class="pressable-ui"
          variant="outline"
          size="sm"
          aria-pressed={motionPaused}
          aria-describedby="trainer-motion-status"
          onclick={toggleMotionPaused}
        >
          {motionPaused ? "Resume" : "Pause"}
        </Button>
      </div>

      <div class="flex min-h-12 items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          <ArrowLeftRightIcon class="size-5 shrink-0 text-accent" />
          <span class="truncate text-base font-medium">Direction</span>
        </div>
        <Button
          class="pressable-ui"
          variant="outline"
          size="sm"
          aria-pressed={settings.motionDirection === -1}
          aria-describedby="trainer-motion-status"
          disabled={!canToggleDirection}
          onclick={toggleMotionDirection}
        >
          {motionDirectionLabel}
        </Button>
      </div>

      <div class="flex min-h-12 items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          {#if isDarkMode}
            <MoonIcon class="size-5 shrink-0 text-accent" />
          {:else}
            <SunIcon class="size-5 shrink-0 text-accent" />
          {/if}
          <span class="truncate text-base font-medium">Dark mode</span>
        </div>
        <Switch
          checked={isDarkMode}
          onCheckedChange={handleThemeCheckedChange}
          aria-label="Use dark theme"
        />
      </div>
    </div>
  </section>
{/snippet}

{#snippet drillControls()}
  <section class="settings-section space-y-6">
    {@render settingHeader("target", "Drill")}
    <Field.Field>
      <Field.Label for="trainer-mode">Drill</Field.Label>
      <Select.Root
        type="single"
        value={settings.presetId}
        onValueChange={handlePresetChange}
      >
        <Select.Trigger id="trainer-mode" class="w-full" aria-label="Drill">
          {getPresetName(settings.presetId)}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each exercisePresets as preset (preset.id)}
              <Select.Item value={preset.id}>
                {@render modeSelectLabel(preset.id, preset.name)}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Field.Field>

    {#if settings.presetId === "pursuit"}
      <Field.Field>
        <Field.Label for="trainer-pattern">Motion path</Field.Label>
        <Select.Root
          type="single"
          value={settings.patternId}
          onValueChange={handlePatternChange}
        >
          <Select.Trigger
            id="trainer-pattern"
            class="w-full"
            aria-label="Motion path"
          >
            {getPatternName(settings.patternId)}
          </Select.Trigger>
          <Select.Content class={patternSelectContentClass}>
            {@render patternSelectGroups()}
          </Select.Content>
        </Select.Root>
      </Field.Field>
    {/if}

    {#if !isLilacChaserMode}
      <Field.Field>
        <Field.Label for="trainer-behavior">Motion feel</Field.Label>
        <Select.Root
          type="single"
          value={behaviorValue}
          onValueChange={handleBehaviorChange}
        >
          <Select.Trigger
            id="trainer-behavior"
            class="w-full"
            aria-label="Motion feel"
          >
            {getBehaviorName(behaviorValue)}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each behaviorOptions as option (option.id)}
                <Select.Item value={option.id}>{option.name}</Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Field.Field>
    {:else}
      <Field.Field>
        <Field.Label for="lilac-chaser-color">Ball color</Field.Label>
        <Select.Root
          type="single"
          value={settings.lilacChaserBallColor}
          onValueChange={handleLilacChaserColorChange}
        >
          <Select.Trigger
            id="lilac-chaser-color"
            class="w-full"
            aria-label="Lilac Chaser ball color"
          >
            {@render colorSelectLabel(
              settings.lilacChaserBallColor,
              getLilacChaserColorName(settings.lilacChaserBallColor),
            )}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each lilacChaserColorOptions as option (option.id)}
                <Select.Item value={option.id}>
                  {@render colorSelectLabel(option.id, option.name)}
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Field.Field>
      <Field.Field>
        {@render sliderRow("Scale", `${settings.lilacChaserScale.toFixed(2)}x`)}
        <Slider
          bind:value={
            lilacChaserScaleSliderValue, setLilacChaserScaleSliderValue
          }
          min={0.75}
          max={1.5}
          step={0.05}
          aria-label="Lilac Chaser scale"
        />
      </Field.Field>
    {/if}
  </section>
{/snippet}

{#snippet targetControls()}
  <section class="settings-section space-y-6">
    {@render settingHeader("eye", "Targets")}
    {#if isMotMode}
      <div class="space-y-4">
        <Field.Field>
          {@render sliderRow("Targets", String(settings.targetCount))}
          <Slider
            bind:value={targetCountSliderValue, setTargetCountSliderValue}
            min={1}
            max={6}
            step={1}
            aria-label="Targets"
          />
        </Field.Field>
        <Field.Field>
          {@render sliderRow("Distractors", String(settings.distractorCount))}
          <Slider
            bind:value={
              distractorCountSliderValue, setDistractorCountSliderValue
            }
            min={0}
            max={10}
            step={1}
            aria-label="Distractors"
          />
        </Field.Field>
      </div>
    {/if}

    <Field.Field>
      <label
        class="flex h-11 min-w-0 cursor-pointer items-center gap-3 rounded-full border bg-input/50 px-3 transition-[color,box-shadow,background-color] hover:ring-4 hover:ring-ring/30"
        for="trainer-color"
      >
        <svg
          viewBox="0 0 24 24"
          class="size-6 shrink-0 rounded-full border shadow-sm"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="12" fill={settings.ballColor} />
        </svg>
        <span
          class="min-w-0 truncate font-sans text-sm uppercase text-foreground"
        >
          {settings.ballColor}
        </span>
        <Input
          id="trainer-color"
          class="sr-only"
          type="color"
          value={settings.ballColor}
          oninput={handleColorInput}
          aria-label="Ball color"
        />
      </label>
    </Field.Field>

    {#if isMotMode}
      <Field.Field>
        {@render sliderRow(
          "Distractor color",
          `${Math.round(settings.distractorBrightness * 100)}%`,
        )}
        <Slider
          bind:value={
            distractorBrightnessSliderValue, setDistractorBrightnessSliderValue
          }
          min={0.35}
          max={1}
          step={0.01}
          aria-label="Distractor color brightness"
        />
      </Field.Field>
    {/if}

    <Field.Field>
      {@render sliderRow(
        "Opacity",
        `${Math.round(settings.targetOpacity * 100)}%`,
      )}
      <Slider
        bind:value={opacitySliderValue, setOpacitySliderValue}
        min={0}
        max={1}
        step={0.01}
        aria-label="Target opacity"
      />
    </Field.Field>

    <Field.Field>
      <Field.Label for="trainer-shape">Shape</Field.Label>
      <Select.Root
        type="single"
        value={settings.targetShape}
        onValueChange={handleShapeChange}
      >
        <Select.Trigger id="trainer-shape" class="w-full" aria-label="Shape">
          {getShapeName(settings.targetShape)}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each shapeOptions as option (option.id)}
              <Select.Item value={option.id}>{option.name}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Field.Field>

    <Field.Field>
      {@render sliderRow("Size", `${Math.round(settings.baseRadiusPx)} px`)}
      <Slider
        bind:value={sizeSliderValue, setSizeSliderValue}
        min={4}
        max={100}
        step={1}
        aria-label="Target size"
      />
    </Field.Field>

    <div class="flex min-h-12 items-center justify-between gap-4">
      <span class="text-base font-medium">Letter</span>
      <Switch
        bind:checked={settings.letterEnabled}
        aria-label="Show target letters"
      />
    </div>

    {#if settings.letterEnabled}
      <Field.Field>
        <Field.Label for="trainer-letter-color">Letter color</Field.Label>
        <label
          class="flex h-11 min-w-0 cursor-pointer items-center gap-3 rounded-full border bg-input/50 px-3 transition-[color,box-shadow,background-color] hover:ring-4 hover:ring-ring/30"
          for="trainer-letter-color"
        >
          <svg
            viewBox="0 0 24 24"
            class="size-6 shrink-0 rounded-full border bg-background shadow-sm"
            aria-hidden="true"
          >
            <text
              x="12"
              y="12"
              dominant-baseline="middle"
              text-anchor="middle"
              fill={settings.letterColor}
              font-size="15"
              font-weight={settings.letterWeight}
              font-family="Geist, Arial, sans-serif"
            >
              A
            </text>
          </svg>
          <span
            class="min-w-0 truncate font-sans text-sm uppercase text-foreground"
          >
            {settings.letterColor}
          </span>
          <Input
            id="trainer-letter-color"
            class="sr-only"
            type="color"
            value={settings.letterColor}
            oninput={handleLetterColorInput}
            aria-label="Letter color"
          />
        </label>
      </Field.Field>

      <Field.Field>
        <Field.Label for="trainer-letter-weight">Weight</Field.Label>
        <Select.Root
          type="single"
          value={String(settings.letterWeight)}
          onValueChange={handleLetterWeightChange}
        >
          <Select.Trigger
            id="trainer-letter-weight"
            class="w-full"
            aria-label="Letter weight"
          >
            {getLetterWeightName(settings.letterWeight)}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each letterWeightOptions as option (option.id)}
                <Select.Item value={String(option.id)}
                  >{option.name}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Field.Field>

      <Field.Field>
        {@render sliderRow(
          "Text size",
          `${Math.round(settings.letterScale * 100)}%`,
        )}
        <Slider
          bind:value={letterScaleSliderValue, setLetterScaleSliderValue}
          min={0.45}
          max={1.2}
          step={0.01}
          aria-label="Letter text size"
        />
      </Field.Field>
    {/if}
  </section>
{/snippet}

{#snippet motionControls()}
  <section class="settings-section space-y-6">
    {@render settingHeader("motion", "Motion")}
    <Field.Field>
      {@render sliderRow(
        "Speed",
        `${settings.speed.value.toFixed(1)} ${settings.speed.unit}`,
      )}
      <Slider
        bind:value={speedSliderValue, setSpeedSliderValue}
        min={0.5}
        max={maxSpeedByUnit[settings.speed.unit]}
        step={speedStepByUnit[settings.speed.unit]}
        aria-label="Speed"
      />
    </Field.Field>

    <Field.Field>
      <Field.Label for="trainer-speed-unit">Unit</Field.Label>
      <Select.Root
        type="single"
        value={settings.speed.unit}
        onValueChange={handleSpeedUnitChange}
      >
        <Select.Trigger
          id="trainer-speed-unit"
          class="w-full"
          aria-label="Speed unit"
        >
          {settings.speed.unit}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value="deg/s">deg/s</Select.Item>
            <Select.Item value="cm/s">cm/s</Select.Item>
            <Select.Item value="screen/s">screen/s</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Field.Field>
  </section>
{/snippet}

{#snippet screenControls()}
  <section class="settings-section space-y-6">
    {@render settingHeader("calibration", "Screen scale")}
    <div class="grid gap-3 sm:grid-cols-2">
      <Field.Field>
        <Field.Label for="trainer-distance">Viewing distance</Field.Label>
        <Input
          id="trainer-distance"
          class=""
          type="number"
          min="20"
          max="120"
          value={settings.calibration.viewingDistanceCm}
          oninput={(event) =>
            handleCalibrationInput(event, "viewingDistanceCm")}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="trainer-css-px-cm">CSS pixels/cm</Field.Label>
        <Input
          id="trainer-css-px-cm"
          class=""
          type="number"
          min="10"
          max="120"
          step="0.1"
          value={settings.calibration.cssPxPerCm}
          oninput={(event) => handleCalibrationInput(event, "cssPxPerCm")}
        />
      </Field.Field>
    </div>
    <div class="flex min-h-12 items-center justify-between gap-4">
      <span class="text-base font-medium">Show trail</span>
      <Switch bind:checked={settings.showTrail} aria-label="Show trail" />
    </div>
  </section>
{/snippet}

{#snippet defaultsControls()}
  <section class="settings-section space-y-6">
    {@render settingHeader("reset", "Defaults")}
    <p class="text-sm leading-6 text-muted-foreground">
      Restore the selected drill to its default behavior, visuals, calibration,
      and saved local settings.
    </p>
    <Button
      class="pressable-ui w-full justify-start"
      variant="outline"
      onclick={resetSettings}
    >
      <RotateCcwIcon class="size-4" />
      <span class="pl-1">Reset to defaults</span>
    </Button>
  </section>
{/snippet}

<ModeWatcher track={false} defaultMode="system" />
<svelte:window onpointermove={handleWindowPointerMove} />
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
    data-testid="trainer-canvas"
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

  {#if hudHidden}
    <button
      type="button"
      class="trainer-hud-peek absolute left-1/2 top-0 z-30 flex h-10 w-32 items-start justify-center rounded-b-full pt-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      aria-label="Reveal controls"
      onpointerenter={revealHud}
      onfocus={revealHud}
      onclick={revealHud}
    >
      <span
        class="h-1 w-16 rounded-full bg-accent/70 shadow-[0_0_16px_rgba(118,217,0,0.22)]"
        aria-hidden="true"
      ></span>
    </button>
  {/if}

  <div
    bind:this={hudShell}
    class="trainer-hud-shell absolute top-3 left-1/2 z-20 max-w-[calc(100dvw-1.5rem)] -translate-x-1/2 sm:top-4"
    data-hidden={hudHidden}
    data-nosnippet
  >
    <header
      class="trainer-hud min-h-12 max-w-full overflow-hidden rounded-[2rem] border bg-popover/90 px-4 py-2 text-popover-foreground shadow-[0_18px_44px_-34px_rgba(20,24,22,0.42)] backdrop-blur-md 2xl:py-2.5"
      style:width={hudContentWidth === null
        ? undefined
        : `calc(${hudContentWidth}px + 2rem + 2px)`}
      aria-hidden={hudHidden}
      inert={hudHidden}
    >
      <div
        {@attach attachHudContentSizer}
        class="flex w-max items-center gap-2"
      >
        <div class="flex shrink-0 items-center gap-2">
          <svelte:element
            this={activeRoute ? "div" : "h1"}
            class="m-0 flex shrink-0 items-center text-base font-semibold tracking-tight text-foreground"
            aria-label={activeRoute
              ? undefined
              : "FoveaFlow, free online eye trainer"}
          >
            <a
              href="/"
              class="flex shrink-0 items-center gap-2 rounded-2xl outline-none transition-colors hover:text-foreground/85 focus-visible:ring-3 focus-visible:ring-ring/30"
              aria-label={`${siteMetadata.name} home`}
            >
              <img
                src="/metadata/favicon-96x96.png"
                alt=""
                aria-hidden="true"
                width="28"
                height="28"
                class="size-7 object-contain dark:hidden"
              />
              <img
                src="/metadata/favicon-light-96x96.png"
                alt=""
                aria-hidden="true"
                width="28"
                height="28"
                class="hidden size-7 object-contain dark:block"
              />
              <span class="sr-only xl:not-sr-only">{siteMetadata.name}</span>
            </a>
          </svelte:element>
        </div>

        <div
          class="hidden h-8 w-px shrink-0 bg-border/80 md:block"
          aria-hidden="true"
        ></div>

        <div class="hidden shrink-0 items-center gap-2 md:flex">
          <Select.Root
            type="single"
            value={settings.presetId}
            onValueChange={handlePresetChange}
            onOpenChange={handleHeaderPresetOpenChange}
          >
            <Select.Trigger
              class={[
                "overflow-hidden transition-[width] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                settings.presetId === "pursuit"
                  ? "w-36 lg:w-40 2xl:w-44"
                  : "w-52 lg:w-56 2xl:w-60",
              ]}
              aria-label="Drill"
            >
              {@render triggerLabel(getPresetName(settings.presetId))}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {#each exercisePresets as preset (preset.id)}
                  <Select.Item value={preset.id}>
                    {@render modeSelectLabel(preset.id, preset.name)}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          {#if settings.presetId === "pursuit"}
            <div class="flex shrink-0" in:hudControlTransition>
              <Select.Root
                type="single"
                value={settings.patternId}
                onValueChange={handlePatternChange}
                onOpenChange={handleHeaderPatternOpenChange}
              >
                <Select.Trigger
                  class="w-36 overflow-hidden lg:w-40 2xl:w-44"
                  aria-label="Motion path"
                >
                  {@render triggerLabel(getPatternName(settings.patternId))}
                </Select.Trigger>
                <Select.Content class={patternSelectContentClass}>
                  {@render patternSelectGroups()}
                </Select.Content>
              </Select.Root>
            </div>
          {/if}
        </div>

        {#if !isLilacChaserMode}
          <div
            class="hidden shrink-0 items-center gap-2 overflow-hidden xl:flex"
            in:hudControlTransition
          >
            <div
              class="flex h-9 w-44 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-48"
            >
              <span
                class="w-8 text-xs font-medium text-muted-foreground 2xl:w-9"
              >
                Size
              </span>
              <Slider
                bind:value={sizeSliderValue, setSizeSliderValue}
                min={4}
                max={100}
                step={1}
                aria-label="Header target size"
              />
              <span class="w-10 text-right text-xs font-semibold tabular-nums">
                {Math.round(settings.baseRadiusPx)}
              </span>
            </div>

            <div
              class="flex h-9 w-44 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-48"
            >
              <span
                class="w-8 text-xs font-medium text-muted-foreground 2xl:w-9"
              >
                Speed
              </span>
              <Slider
                bind:value={speedSliderValue, setSpeedSliderValue}
                min={0.5}
                max={maxSpeedByUnit[settings.speed.unit]}
                step={speedStepByUnit[settings.speed.unit]}
                aria-label="Header target speed"
              />
              <span class="w-12 text-right text-xs font-semibold tabular-nums">
                {settings.speed.value.toFixed(1)}
              </span>
            </div>
          </div>
        {:else}
          <div
            class="hidden shrink-0 items-center gap-2 overflow-hidden xl:flex"
            in:hudControlTransition
          >
            <Select.Root
              type="single"
              value={settings.lilacChaserBallColor}
              onValueChange={handleLilacChaserColorChange}
              onOpenChange={handleHeaderLilacChaserColorOpenChange}
            >
              <Select.Trigger
                class="w-36 overflow-hidden lg:w-40"
                aria-label="Lilac Chaser ball color"
              >
                {@render triggerLabel(
                  getLilacChaserColorName(settings.lilacChaserBallColor),
                )}
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  {#each lilacChaserColorOptions as option (option.id)}
                    <Select.Item value={option.id}>
                      {@render colorSelectLabel(option.id, option.name)}
                    </Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            <div
              class="flex h-9 w-48 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-52"
            >
              <span class="w-9 text-xs font-medium text-muted-foreground">
                Scale
              </span>
              <Slider
                bind:value={
                  lilacChaserScaleSliderValue, setLilacChaserScaleSliderValue
                }
                min={0.75}
                max={1.5}
                step={0.05}
                aria-label="Lilac Chaser scale"
              />
              <span class="w-12 text-right text-xs font-semibold tabular-nums">
                {settings.lilacChaserScale.toFixed(2)}x
              </span>
            </div>
          </div>
        {/if}

        <div
          class="hidden h-8 w-px shrink-0 bg-border/80 md:block"
          aria-hidden="true"
        ></div>

        <nav class="flex shrink-0 items-center gap-2" aria-label="App actions">
          <Button
            class="pressable-ui hidden sm:inline-flex"
            variant="outline"
            size="icon"
            aria-label={motionPaused ? "Resume motion" : "Pause motion"}
            aria-pressed={motionPaused}
            aria-describedby="trainer-motion-status"
            onclick={toggleMotionPaused}
          >
            {#if motionPaused}
              <PlayIcon />
            {:else}
              <PauseIcon />
            {/if}
          </Button>

          <Button
            class="pressable-ui hidden sm:inline-flex"
            variant="outline"
            size="icon"
            aria-label={motionDirectionToggleLabel}
            aria-pressed={settings.motionDirection === -1}
            aria-describedby="trainer-motion-status"
            disabled={!canToggleDirection}
            onclick={toggleMotionDirection}
          >
            <ArrowLeftRightIcon />
          </Button>

          <Button
            class="pressable-ui"
            variant="outline"
            size="icon"
            aria-label={activeRoute
              ? `Open ${guideSeoContent.heading} guide`
              : "About FoveaFlow eye trainer"}
            title={activeRoute ? "Open guide" : "About FoveaFlow"}
            popovertarget="trainer-guide-popover"
            onclick={revealHud}
          >
            <BookOpenIcon />
          </Button>

          <Button
            class="pressable-ui"
            variant="outline"
            size="icon"
            aria-label="Open controls"
            onclick={openControlsPanel}
          >
            <SettingsIcon />
          </Button>
        </nav>
      </div>
    </header>
  </div>

  <section
    id="trainer-guide-popover"
    popover="auto"
    class="native-dialog-popover t-resize native-guide-popover relative rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-none [animation-duration:100ms] dark:ring-foreground/10 sm:p-8"
    aria-labelledby="trainer-guide-popover-title"
    ontoggle={handleGuidePopoverToggle}
  >
    {#if activeRoute}
      <div class="guide-enter guide-enter-top min-w-0 space-y-2 pr-12">
        <p
          class="text-[0.7rem] leading-4 font-semibold tracking-wide text-accent uppercase"
        >
          {guideSeoContent.kicker}
        </p>
        <h2
          id="trainer-guide-popover-title"
          class="max-w-[28ch] text-2xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-3xl lg:text-[2.125rem]"
        >
          {guideSeoContent.heading}
        </h2>
        <p
          class="max-w-[62ch] text-sm leading-6 text-muted-foreground text-pretty sm:text-base"
        >
          {guideSeoContent.hero}
        </p>
      </div>

      <Button
        variant="ghost"
        class="absolute top-4 right-4 bg-secondary"
        size="icon-sm"
        aria-label="Close"
        popovertarget="trainer-guide-popover"
        popovertargetaction="hide"
      >
        <XIcon />
        <span class="sr-only">Close</span>
      </Button>

      <div
        class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.06fr)_minmax(16rem,0.82fr)]"
      >
        <section
          class="guide-enter guide-enter-delay-1 space-y-6 border-t border-border/40 pt-6"
          aria-label={`${guideSeoContent.heading} overview`}
        >
          <h3 class="text-base font-semibold text-foreground">Overview</h3>

          <div
            class="mt-6 space-y-4 text-sm leading-6 text-muted-foreground text-pretty sm:text-[0.95rem] sm:leading-7"
          >
            {#each guideSeoContent.body as paragraph (paragraph)}
              <p class="max-w-[58ch]">
                {paragraph}
              </p>
            {/each}
          </div>

          <Button href="/guide/" size="xl" class="pressable-ui w-full">
            <BookOpenIcon class="size-5" />
            <span class="pl-1">Read full guide</span>
          </Button>
        </section>

        <section
          class="guide-enter guide-enter-delay-2 border-t border-border/40 pt-6"
          aria-labelledby="trainer-guide-steps"
        >
          <h3
            id="trainer-guide-steps"
            class="text-base font-semibold text-foreground text-balance"
          >
            How to use {activeTrainingModeGuide.title}
          </h3>

          <ol class="mt-6 grid gap-5">
            {#each activeTrainingModeGuide.steps as step, index (step)}
              <li class="grid grid-cols-[2.25rem_1fr] gap-4">
                <span
                  class="flex size-8 items-center justify-center rounded-full bg-accent/12 text-xs font-semibold tabular-nums text-accent shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span class="pt-1 leading-6 text-muted-foreground text-pretty">
                  {step}
                </span>
              </li>
            {/each}
          </ol>

          <p
            class="mt-6 border-t border-border/40 pt-6 text-sm leading-6 text-muted-foreground text-pretty"
          >
            <span class="font-semibold text-foreground">What it trains:</span>
            {activeTrainingModeGuide.benefits}
          </p>
        </section>

        <aside
          class="guide-enter guide-enter-delay-3 border-t border-border/40 pt-6 lg:col-span-2 xl:col-span-1"
          aria-labelledby="trainer-guide-faq"
        >
          <h3
            id="trainer-guide-faq"
            class="text-base font-semibold text-foreground text-balance"
          >
            Quick answers
          </h3>

          <div class="mt-6 divide-y divide-border/40">
            {#each guideSeoContent.faq.slice(0, 3) as faqItem, index (faqItem.question)}
              {@const faqOpen = openGuideFaqQuestion === faqItem.question}
              <div class="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-semibold text-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/30"
                  aria-expanded={faqOpen}
                  aria-controls={`trainer-guide-faq-answer-${index}`}
                  onclick={() => toggleGuideFaq(faqItem.question)}
                >
                  <span>{faqItem.question}</span>
                  <span
                    class={[
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-base leading-none text-muted-foreground transition-transform duration-200 ease-out",
                      faqOpen && "rotate-45",
                    ]}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div
                  id={`trainer-guide-faq-answer-${index}`}
                  class={[
                    "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    faqOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  ]}
                >
                  <div class="min-h-0 overflow-hidden">
                    <p
                      class={[
                        "pb-1 text-sm leading-6 text-muted-foreground text-pretty transition-opacity duration-200 ease-out motion-reduce:transition-none",
                        faqOpen ? "opacity-100" : "opacity-0",
                      ]}
                    >
                      {faqItem.answer}
                    </p>
                  </div>
                </div>
              </div>
            {/each}
          </div>

          <div
            class="mt-6 flex flex-wrap gap-2"
            aria-label={`Best uses for ${activeTrainingModeGuide.title}`}
          >
            {#each guideUseCases as useCase (useCase)}
              <span
                class="rounded-full border border-border/40 bg-muted/35 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {useCase}
              </span>
            {/each}
          </div>

          <p class="mt-6 text-xs leading-5 text-muted-foreground/85">
            {guideSeoContent.trustNote}
          </p>
        </aside>
      </div>

      <footer
        class="guide-enter guide-enter-delay-4 mt-8 flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="min-w-0 text-xs leading-5 text-muted-foreground">
          {siteMetadata.name} is free to use, requires no account or install, and
          stores settings locally in your browser.
        </p>

        <div class="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button
            href={siteMetadata.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="xs"
          >
            <ExternalLinkIcon class="size-3" />
            <span class="pl-1">Source</span>
          </Button>
          <Button href={legalPageLinks.privacy.path} variant="ghost" size="xs">
            <ShieldCheckIcon class="size-3" />
            <span class="pl-1">{legalPageLinks.privacy.label}</span>
          </Button>
          <Button href={legalPageLinks.terms.path} variant="ghost" size="xs">
            <FileTextIcon class="size-3" />
            <span class="pl-1">{legalPageLinks.terms.label}</span>
          </Button>
        </div>
      </footer>
    {:else}
      <div class="guide-enter guide-enter-top flex items-start gap-4">
        <div class="min-w-0 space-y-2 pr-12">
          <p
            class="text-[0.7rem] leading-4 font-semibold tracking-wide text-accent uppercase"
          >
            {homepageSeoContent.kicker}
          </p>
          <h2
            id="trainer-guide-popover-title"
            class="text-2xl leading-tight font-semibold text-balance"
          >
            {homepageSeoContent.heading}
          </h2>
        </div>
      </div>

      <Button
        variant="ghost"
        class="absolute top-4 right-4 bg-secondary"
        size="icon-sm"
        aria-label="Close"
        popovertarget="trainer-guide-popover"
        popovertargetaction="hide"
      >
        <XIcon />
        <span class="sr-only">Close</span>
      </Button>

      <div
        class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.18fr)_minmax(16rem,0.82fr)]"
      >
        <section
          class="guide-enter guide-enter-delay-1 space-y-5 border-t border-border/40 pt-6"
          aria-label="FoveaFlow overview"
        >
          <h3 class="text-base font-semibold text-foreground">Overview</h3>

          <div
            class="mt-6 space-y-4 text-sm leading-6 text-muted-foreground text-pretty sm:text-[0.95rem] sm:leading-7"
          >
            {#each homepageSeoContent.body as paragraph (paragraph)}
              <p class="max-w-[58ch]">{paragraph}</p>
            {/each}
          </div>
        </section>

        <section
          class="guide-enter guide-enter-delay-2 border-t border-border/40 pt-6"
          aria-labelledby="homepage-guide-drills"
        >
          <h3
            id="homepage-guide-drills"
            class="text-base font-semibold text-foreground"
          >
            Drills
          </h3>
          <ul class="mt-6 grid gap-5">
            {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
              <li class="grid grid-cols-[2.25rem_1fr] gap-4">
                <span
                  class="flex size-8 items-center justify-center rounded-full bg-accent/12 text-accent shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
                  aria-hidden="true"
                >
                  <TargetIcon class="size-4" />
                </span>
                <span class="pt-1 leading-6 text-muted-foreground text-pretty">
                  <span class="font-semibold text-foreground">
                    {trainingModeNote.title}:
                  </span>
                  {trainingModeNote.body}
                </span>
              </li>
            {/each}
          </ul>
        </section>

        <aside
          class="guide-enter guide-enter-delay-3 border-t border-border/40 pt-6"
        >
          <h3 class="text-base font-semibold text-foreground">Safety</h3>
          <p class="mt-6 text-sm leading-6 text-muted-foreground text-pretty">
            {homepageSeoContent.trustNote}
          </p>

          <div
            class="mt-6 flex flex-wrap gap-2"
            aria-label={`Best uses for ${siteMetadata.name}`}
          >
            {#each guideUseCases as useCase (useCase)}
              <span
                class="rounded-full border border-border/40 bg-muted/35 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {useCase}
              </span>
            {/each}
          </div>

          <a
            href="/guide/"
            class={`${buttonVariants({ variant: "default", size: "lg" })} pressable-ui guide-enter guide-enter-delay-4 mt-6 w-full`}
          >
            <BookOpenIcon class="size-4" />
            <span>Read the full guide</span>
          </a>
        </aside>
      </div>

      <footer
        class="guide-enter guide-enter-delay-4 mt-8 flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="min-w-0 text-xs leading-5 text-muted-foreground">
          {siteMetadata.name} is free to use, requires no account or install, and
          stores settings locally in your browser.
        </p>

        <div class="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button
            href={siteMetadata.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="xs"
          >
            <ExternalLinkIcon class="size-3" />
            <span class="pl-1">Source</span>
          </Button>
          <Button href={legalPageLinks.privacy.path} variant="ghost" size="xs">
            <ShieldCheckIcon class="size-3" />
            <span class="pl-1">{legalPageLinks.privacy.label}</span>
          </Button>
          <Button href={legalPageLinks.terms.path} variant="ghost" size="xs">
            <FileTextIcon class="size-3" />
            <span class="pl-1">{legalPageLinks.terms.label}</span>
          </Button>
        </div>
      </footer>
    {/if}
  </section>

  <Dialog.Root bind:open={panelOpen}>
    <Dialog.Content
      class="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
      trapFocus={false}
    >
      <Dialog.Title class="sr-only">Controls</Dialog.Title>
      <Dialog.Description class="sr-only">
        Change your saved FoveaFlow settings.
      </Dialog.Description>
      <Sidebar.Provider class="items-start">
        <Sidebar.Root collapsible="none" class="hidden md:flex">
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  {#each availableControlSections as section (section.id)}
                    <Sidebar.MenuItem>
                      <Sidebar.MenuButton
                        isActive={currentControlSection === section.id}
                        onclick={() => (activeControlSection = section.id)}
                      >
                        {@render controlSectionIcon(section.icon)}
                        <span>{section.label}</span>
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  {/each}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar.Root>

        <main class="flex h-[480px] flex-1 flex-col overflow-hidden">
          <header
            class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
          >
            <div class="flex min-w-0 items-center gap-2 px-4 text-base">
              <span class="shrink-0 text-muted-foreground"> Controls </span>
              <span class="shrink-0 text-muted-foreground" aria-hidden="true"
                >›</span
              >
              <h2 class="truncate font-medium">
                {currentControlSectionLabel}
              </h2>
            </div>
          </header>

          <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            <div class="max-w-3xl rounded-xl bg-muted/50 p-4">
              {#if currentControlSection === "session"}
                {@render sessionControls()}
              {:else if currentControlSection === "drill"}
                {@render drillControls()}
              {:else if currentControlSection === "targets"}
                {@render targetControls()}
              {:else if currentControlSection === "motion"}
                {@render motionControls()}
              {:else if currentControlSection === "screen"}
                {@render screenControls()}
              {:else}
                {@render defaultsControls()}
              {/if}
            </div>
          </div>
        </main>
      </Sidebar.Provider>
    </Dialog.Content>
  </Dialog.Root>
</main>

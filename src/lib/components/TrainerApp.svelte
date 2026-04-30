<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SunIcon from "@lucide/svelte/icons/sun";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import { ModeWatcher, mode, setMode } from "mode-watcher";

  import ModePathPreview from "$lib/components/ModePathPreview.svelte";
  import PatternPathPreview from "$lib/components/PatternPathPreview.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
  } from "$lib/components/ui/sheet/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import {
    DEFAULT_CALIBRATION,
    type Calibration,
    speedToPixelsPerSecond,
  } from "$lib/engine/calibration";
  import { resolveCanvasScale } from "$lib/engine/canvas";
  import {
    DEFAULT_BALL_COLOR,
    exercisePresets,
    firstPreset,
    getPreset,
    patternOptions,
    settingsFromPreset,
    type TrainerSettings,
    type TrainingMode,
  } from "$lib/engine/presets";
  import { samplePatternInto } from "$lib/engine/patterns";
  import {
    sampleSizeProfile,
    sampleSpeedProfile,
    type SizeProfile,
    type SpeedProfile,
  } from "$lib/engine/profiles";
  import { createRng } from "$lib/engine/random";
  import { darkenHexColor, safeStimulusColor } from "$lib/engine/safety";
  import {
    findTrainerRoute,
    getTrainingModeGuide,
    getTrainerRoute,
    indexableTrainerRoutes,
    legalPages,
    safetyNote,
    siteMetadata,
    trainingModeNotes,
  } from "$lib/seo";
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

  const getCanvasTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    return isDark
      ? {
          background: "#101113",
          trail: "rgba(16, 17, 19, 0.35)",
          grid: "rgba(255, 255, 255, 0.045)",
        }
      : {
          background: "#eff1f3",
          trail: "rgba(239, 241, 243, 0.38)",
          grid: "rgba(16, 18, 22, 0.075)",
        };
  };
  type BehaviorId =
    | "constant"
    | "wavePattern"
    | "surgePattern"
    | "alternatingPattern"
    | "climbPattern"
    | "sizePulse";

  const behaviorOptions: Array<{ id: BehaviorId; name: string }> = [
    { id: "constant", name: "Steady speed" },
    { id: "wavePattern", name: "Speed wave" },
    { id: "surgePattern", name: "Short bursts" },
    { id: "alternatingPattern", name: "Alternating pace" },
    { id: "climbPattern", name: "Build and reset" },
    { id: "sizePulse", name: "Size pulse" },
  ];

  const shapeOptions: Array<{ id: TargetShape; name: string }> = [
    { id: "circle", name: "Circle" },
    { id: "ring", name: "Ring" },
    { id: "square", name: "Square" },
    { id: "diamond", name: "Diamond" },
    { id: "triangle", name: "Triangle" },
    { id: "cross", name: "Cross" },
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
  let seed = 4321;
  let rng = createRng(seed);
  let canvasTheme: ReturnType<typeof getCanvasTheme> | null = null;
  let gridPath: Path2D | null = null;
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

  const getPreservedSettings = (currentSettings: TrainerSettings) => ({
    speed: currentSettings.speed,
    baseRadiusPx: currentSettings.baseRadiusPx,
    speedProfile: currentSettings.speedProfile,
    sizeProfile: currentSettings.sizeProfile,
    showTrail: currentSettings.showTrail,
    ballColor: currentSettings.ballColor,
    distractorBrightness: currentSettings.distractorBrightness,
    targetOpacity: currentSettings.targetOpacity,
    targetShape: currentSettings.targetShape,
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

    return nextSettings;
  };

  let settings = $state<TrainerSettings>(
    applyRouteToSettings(
      settingsFromPreset(firstPreset, DEFAULT_CALIBRATION),
      untrack(() => routeSlug),
    ),
  );
  let panelOpen = $state(false);
  let motionPaused = $state(false);
  let storageReady = $state(false);
  let hudAutoHideReady = $state(false);
  let hudVisible = $state(true);
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
  let activeRoute = $derived(findTrainerRoute(routeSlug));
  let pageHeading = $derived(activeRoute?.heading ?? siteMetadata.title);
  let distractorColor = $derived(
    darkenHexColor(safeBallColor, settings.distractorBrightness),
  );
  let isMotMode = $derived(settings.presetId === "mot");
  let isLilacChaserMode = $derived(settings.presetId === "lilacChaser");
  let activeTrainingModeGuide = $derived(
    getTrainingModeGuide(settings.presetId),
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
  let hudHideTimeout: number | undefined;
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
    context = node.getContext("2d", { alpha: false });

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);
    const themeObserver = new MutationObserver(() => {
      canvasTheme = getCanvasTheme();
      drawFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    canvasTheme = getCanvasTheme();
    resizeCanvas();
    if (shouldAnimateMotion()) startLoop();

    return () => {
      cancelAnimationFrame(animationFrame);
      themeObserver.disconnect();
      resizeObserver.disconnect();
    };
  };

  onMount(() => {
    const savedSettings = loadSettings();
    const browserRouteSlug = getBrowserRouteSlug();
    settings = applyRouteToSettings(
      savedSettings ? mergeSettings(savedSettings) : settings,
      browserRouteSlug,
    );
    refreshBaseSpeed();

    const handlePopState = () => {
      settings = applyRouteToSettings(settings, getBrowserRouteSlug());
      refreshBaseSpeed();
      drawFrame();
    };
    window.addEventListener("popstate", handlePopState);

    const modeUnsubscribe = mode.subscribe((nextMode) => {
      if (nextMode !== "light" && nextMode !== "dark") return;
      colorMode = nextMode;
      canvasTheme = getCanvasTheme();
      drawFrame();
    });
    storageReady = true;
    startHudAutoHideTimer();

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
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pagehide", settingsSaver.flush);
      reduceMotionQuery.removeEventListener("change", handleReduceMotionChange);
      modeUnsubscribe();
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

  const resizeCanvas = () => {
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    arena = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };
    const scale = resolveCanvasScale(
      arena.width,
      arena.height,
      window.devicePixelRatio || 1,
    );
    canvas.width = Math.max(1, Math.round(arena.width * scale));
    canvas.height = Math.max(1, Math.round(arena.height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    refreshBaseSpeed();
    rebuildGridPath();
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
    travelPx += currentSpeedPxPerSec * deltaSec;
    elapsedSec += deltaSec;
    drawFrame();
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

    const theme = canvasTheme ?? getCanvasTheme();
    ctx.fillStyle = settings.showTrail ? theme.trail : theme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);
    drawGuides(ctx, theme);

    const frameCount = sampleFrameCount(elapsedSec);
    for (let index = 0; index < frameCount; index += 1) {
      drawTarget(ctx, targetFrames[index]);
    }
  };

  const drawLilacChaserFrame = (ctx: CanvasRenderingContext2D) => {
    const centerX = arena.width / 2;
    const centerY = arena.height / 2;
    const minSide = Math.min(arena.width, arena.height);
    const scale = settings.lilacChaserScale;
    const orbitRadius = minSide * lilacChaserOrbitRatio * scale;
    const dotRadius = minSide * lilacChaserDotRatio * scale;
    const crossRadius = minSide * lilacChaserCrossArmRatio * scale;
    const hiddenIndex =
      Math.floor(elapsedSec / lilacChaserStepSec) % lilacChaserDotCount;

    ctx.fillStyle = lilacChaserTheme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);

    ctx.fillStyle = settings.lilacChaserBallColor;
    for (let index = 0; index < lilacChaserDotCount; index += 1) {
      if (index === hiddenIndex) continue;
      const angle = -Math.PI / 2 + (index / lilacChaserDotCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
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

  const drawTarget = (ctx: CanvasRenderingContext2D, frame: TargetFrame) => {
    if (!frame.visible) return;

    ctx.globalAlpha = frame.alpha * settings.targetOpacity;
    ctx.fillStyle = frame.color;
    drawStimulusShape(
      ctx,
      frame.x,
      frame.y,
      frame.radiusPx,
      settings.targetShape,
    );
    ctx.globalAlpha = 1;
  };

  const drawStimulusShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusPx: number,
    shape: TargetShape,
  ) => {
    ctx.beginPath();

    if (shape === "square") {
      ctx.rect(x - radiusPx, y - radiusPx, radiusPx * 2, radiusPx * 2);
      ctx.fill();
      return;
    }

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

    ctx.arc(x, y, radiusPx, 0, Math.PI * 2);
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
      showTrail: settings.showTrail,
      ballColor: settings.ballColor,
      distractorBrightness: settings.distractorBrightness,
      targetOpacity: settings.targetOpacity,
      targetShape: settings.targetShape,
      lilacChaserScale: settings.lilacChaserScale,
      lilacChaserBallColor: settings.lilacChaserBallColor,
    });
    refreshBaseSpeed();
  };

  const getBrowserRouteSlug = () => {
    return window.location.pathname.split("/").filter(Boolean)[0] ?? "";
  };

  const setBrowserPath = (path: string) => {
    if (window.location.pathname === path) return;
    window.history.pushState({}, "", path);
  };

  const syncBrowserPath = () => {
    const route = getTrainerRoute(settings.presetId, settings.patternId);
    setBrowserPath(route?.path ?? "/");
  };

  const resetSettings = () => {
    settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION);
    seed = 4321;
    rng = createRng(seed);
    elapsedSec = 0;
    travelPx = 0;
    currentSpeedPxPerSec = 0;
    refreshBaseSpeed();
    drawFrame();
    setBrowserPath("/");
  };

  const clearHudAutoHideTimer = () => {
    if (hudHideTimeout === undefined) return;
    window.clearTimeout(hudHideTimeout);
    hudHideTimeout = undefined;
  };

  const isHudInteractionOpen = () =>
    panelOpen ||
    headerPresetSelectOpen ||
    headerPatternSelectOpen ||
    headerLilacChaserColorSelectOpen;

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
    if (!hudAutoHideReady || event.pointerType === "touch") return;

    if (event.clientY <= 96) {
      revealHud();
      return;
    }

    if (event.clientY > 160) hideHud();
  };

  const setPattern = (patternId: PatternId) => {
    settings.patternId = patternId;
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

  const getOptionName = <T extends string>(
    options: Array<{ id: T; name: string }>,
    id: T,
  ) => options.find((option) => option.id === id)?.name ?? id;

  const getPresetName = (id: string) => getPreset(id).name;
  const getPatternName = (id: PatternId) => getOptionName(patternOptions, id);
  const getBehaviorName = (id: BehaviorId) =>
    getOptionName(behaviorOptions, id);
  const getShapeName = (id: TargetShape) => getOptionName(shapeOptions, id);
  const getLilacChaserColorName = (id: string) =>
    getOptionName([...lilacChaserColorOptions], id);
  const patternSelectContentClass =
    "max-h-[min(65dvh,26rem)] overscroll-contain";

  const handleShapeChange = (value: string) => {
    if (isTargetShape(value)) settings.targetShape = value;
  };

  const handleThemeCheckedChange = (checked: boolean) => {
    setMode(checked ? "dark" : "light");
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
    if (isLilacChaserBallColor(value)) settings.lilacChaserBallColor = value;
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
</script>

{#snippet settingHeader(
  icon: "target" | "motion" | "eye" | "calibration" | "theme",
  label: string,
)}
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

<ModeWatcher track={false} defaultMode="system" />
<svelte:window onpointermove={handleWindowPointerMove} />
<svelte:document onvisibilitychange={handleVisibilityChange} />

<main
  class="relative h-dvh w-dvw overflow-hidden bg-background text-foreground"
>
  <h1 class="sr-only">{pageHeading}</h1>
  <p id="trainer-canvas-description" class="sr-only">
    Animated visual tracking area. Use Pause motion to stop target movement
    before changing controls.
  </p>
  <p id="trainer-motion-status" class="sr-only" aria-live="polite">
    Motion {motionPaused ? "paused" : "playing"}.
  </p>

  <canvas
    {@attach attachCanvas}
    class="absolute inset-0 h-full w-full touch-none"
    data-testid="trainer-canvas"
    aria-label="Eye trainer moving target canvas"
    aria-describedby="trainer-canvas-description trainer-motion-status"
  ></canvas>

  <nav class="sr-only" aria-label="Practice pages">
    <a href="/">Eye Trainer home</a>
    <a href="/guide/">Eye Trainer guide</a>
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
    class="trainer-hud-shell absolute top-3 left-1/2 z-20 max-w-[calc(100dvw-1.5rem)] -translate-x-1/2 sm:top-4"
    data-hidden={hudHidden}
  >
    <header
      class="trainer-hud flex min-h-12 max-w-full items-center gap-2 rounded-[2rem] border bg-popover/90 px-3 py-2 text-popover-foreground shadow-[0_18px_44px_-34px_rgba(20,24,22,0.42)] backdrop-blur-md sm:px-3.5 2xl:px-4 2xl:py-2.5"
      aria-hidden={hudHidden}
      inert={hudHidden}
    >
      <div class="flex shrink-0 items-center gap-2">
        <div
          class="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-foreground"
        >
          <img
            src={isDarkMode
              ? "/metadata/favicon-dark-96x96.png"
              : "/metadata/favicon-96x96.png"}
            alt=""
            aria-hidden="true"
            width="28"
            height="28"
            class="size-7 object-contain"
          />
          <span class="sr-only xl:not-sr-only">{siteMetadata.name}</span>
        </div>
      </div>

      <div
        class="hidden h-8 w-px shrink-0 bg-border/80 md:block"
        aria-hidden="true"
      ></div>

      <div class="hidden min-w-0 items-center gap-2 md:flex">
        <Select.Root
          type="single"
          value={settings.presetId}
          onValueChange={handlePresetChange}
          onOpenChange={handleHeaderPresetOpenChange}
        >
          <Select.Trigger
            class={[
              "overflow-hidden",
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
        {/if}
      </div>

      {#if !isLilacChaserMode}
        <div class="hidden min-w-0 items-center gap-2 xl:flex">
          <div
            class="flex h-9 w-44 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-48"
          >
            <span class="w-8 text-xs font-medium text-muted-foreground 2xl:w-9">
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
            <span class="w-8 text-xs font-medium text-muted-foreground 2xl:w-9">
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
        <div class="hidden min-w-0 items-center gap-2 xl:flex">
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
          class="pressable-ui"
          variant="outline"
          size="icon"
          href="https://github.com/Jesper-N/eye-trainer"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open GitHub repository"
        >
          <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5v-1.74c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 5.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.8c0 .28.18.6.69.5A10.16 10.16 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
            />
          </svg>
        </Button>

        <Button
          class="pressable-ui"
          variant="outline"
          size="icon"
          href="/guide/"
          aria-label="Open guide"
        >
          <BookOpenIcon />
        </Button>

        <Button
          class="pressable-ui"
          variant="outline"
          size="icon"
          aria-label="Open controls"
          onclick={() => {
            revealHud();
            panelOpen = true;
          }}
        >
          <SettingsIcon />
        </Button>
      </nav>
    </header>
  </div>

  <Sheet bind:open={panelOpen}>
    <SheetContent
      side="right"
      class="overflow-y-auto px-6 py-7 data-[side=right]:w-[min(440px,100vw)] data-[side=right]:sm:max-w-[440px] sm:px-7"
    >
      <SheetHeader class="px-0 pt-3 pb-7">
        <SheetTitle class="text-2xl font-semibold tracking-tight">
          Controls
        </SheetTitle>
      </SheetHeader>

      <div class="grid gap-7 pb-12 text-sm">
        <section class="settings-section space-y-4">
          {@render settingHeader("theme", "Theme")}
          <Item.Root variant="outline" size="sm" class="min-h-11 sm:hidden">
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-muted text-accent"
            >
              {#if motionPaused}
                <PlayIcon class="size-4" />
              {:else}
                <PauseIcon class="size-4" />
              {/if}
            </Item.Media>
            <Item.Content>
              <Item.Title>Motion</Item.Title>
            </Item.Content>
            <Item.Actions>
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
            </Item.Actions>
          </Item.Root>

          <Item.Root variant="outline" size="sm" class="min-h-11">
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-muted text-accent"
            >
              {#if isDarkMode}
                <MoonIcon class="size-4" />
              {:else}
                <SunIcon class="size-4" />
              {/if}
            </Item.Media>
            <Item.Content>
              <Item.Title>Dark mode</Item.Title>
            </Item.Content>
            <Item.Actions>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeCheckedChange}
                aria-label="Use dark theme"
              />
            </Item.Actions>
          </Item.Root>
        </section>

        <section
          class="settings-section space-y-4 border-t border-border/60 pt-7"
        >
          {@render settingHeader("target", "Drill")}
          <Field.Field>
            <Field.Label for="trainer-mode">Drill</Field.Label>
            <Select.Root
              type="single"
              value={settings.presetId}
              onValueChange={handlePresetChange}
            >
              <Select.Trigger
                id="trainer-mode"
                class="w-full"
                aria-label="Drill"
              >
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
                      <Select.Item value={option.id}>
                        {option.name}
                      </Select.Item>
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
              {@render sliderRow(
                "Scale",
                `${settings.lilacChaserScale.toFixed(2)}x`,
              )}
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

          <Item.Root variant="outline" size="sm" class="min-h-11">
            <Item.Content>
              <Item.Title class="line-clamp-none">
                How to use {activeTrainingModeGuide.title}
              </Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {activeTrainingModeGuide.steps.join(" ")}
                What it trains: {activeTrainingModeGuide.benefits}
              </Item.Description>
            </Item.Content>
          </Item.Root>

          {#if isMotMode}
            <div class="space-y-5 pt-1">
              {@render settingHeader("eye", "Objects")}
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
                {@render sliderRow(
                  "Distractors",
                  String(settings.distractorCount),
                )}
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
        </section>

        {#if !isLilacChaserMode}
          <section
            class="settings-section space-y-4 border-t border-border/60 pt-7"
          >
            {@render settingHeader("eye", "Color")}
            <Field.Field>
              <label
                class="flex h-11 cursor-pointer items-center gap-3 rounded-full border bg-input/50 px-3 transition-[color,box-shadow,background-color] hover:ring-4 hover:ring-ring/30"
                for="trainer-color"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="size-6 rounded-full border shadow-sm"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="12" fill={settings.ballColor} />
                </svg>
                <span class="font-mono text-sm uppercase text-foreground">
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
                    distractorBrightnessSliderValue,
                    setDistractorBrightnessSliderValue
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
          </section>

          <section
            class="settings-section space-y-4 border-t border-border/60 pt-7"
          >
            {@render settingHeader("eye", "Shape")}
            <Field.Field>
              <Field.Label for="trainer-shape">Shape</Field.Label>
              <Select.Root
                type="single"
                value={settings.targetShape}
                onValueChange={handleShapeChange}
              >
                <Select.Trigger
                  id="trainer-shape"
                  class="w-full"
                  aria-label="Shape"
                >
                  {getShapeName(settings.targetShape)}
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {#each shapeOptions as option (option.id)}
                      <Select.Item value={option.id}>
                        {option.name}
                      </Select.Item>
                    {/each}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Field.Field>

            <Field.Field>
              {@render sliderRow(
                "Size",
                `${Math.round(settings.baseRadiusPx)} px`,
              )}
              <Slider
                bind:value={sizeSliderValue, setSizeSliderValue}
                min={4}
                max={100}
                step={1}
                aria-label="Target size"
              />
            </Field.Field>
          </section>

          <section
            class="settings-section space-y-4 border-t border-border/60 pt-7"
          >
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

          <section
            class="settings-section space-y-4 border-t border-border/60 pt-7"
          >
            {@render settingHeader("calibration", "Screen scale")}
            <div class="grid grid-cols-2 gap-2">
              <Field.Field>
                <Field.Label for="trainer-distance"
                  >Viewing distance</Field.Label
                >
                <Input
                  id="trainer-distance"
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
                  type="number"
                  min="10"
                  max="120"
                  step="0.1"
                  value={settings.calibration.cssPxPerCm}
                  oninput={(event) =>
                    handleCalibrationInput(event, "cssPxPerCm")}
                />
              </Field.Field>
            </div>
            <Item.Root variant="outline" size="sm" class="min-h-11">
              <Item.Content>
                <Item.Title>Show trail</Item.Title>
              </Item.Content>
              <Item.Actions>
                <Switch
                  bind:checked={settings.showTrail}
                  aria-label="Show trail"
                />
              </Item.Actions>
            </Item.Root>
          </section>
        {/if}

        <section class="settings-section border-t border-border/60 pt-7">
          <Button
            class="pressable-ui w-full justify-start"
            variant="outline"
            onclick={resetSettings}
          >
            <RotateCcwIcon class="size-4" />
            <span class="pl-1">Reset to defaults</span>
          </Button>
        </section>

        <section
          class="settings-section space-y-4 border-t border-border/60 pt-7"
        >
          {@render settingHeader("eye", "About")}
          <p class="text-sm leading-6 text-muted-foreground">
            {siteMetadata.shortDescription}
          </p>
          <div class="grid gap-3">
            {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
              <Item.Root variant="outline" size="sm">
                <Item.Content>
                  <Item.Title class="line-clamp-none">
                    {trainingModeNote.title}
                  </Item.Title>
                  <Item.Description class="line-clamp-none leading-6">
                    {trainingModeNote.body}
                  </Item.Description>
                </Item.Content>
              </Item.Root>
            {/each}
          </div>
          <p class="text-xs leading-5 text-muted-foreground">{safetyNote}</p>
          <div class="flex flex-wrap gap-2">
            <Button href="/guide/" variant="outline" size="sm">
              <BookOpenIcon class="size-4" />
              <span class="pl-1">Guide</span>
            </Button>
            <Button href={legalPages.privacy.path} variant="outline" size="sm">
              <ShieldCheckIcon class="size-4" />
              <span class="pl-1">{legalPages.privacy.label}</span>
            </Button>
            <Button href={legalPages.terms.path} variant="outline" size="sm">
              <FileTextIcon class="size-4" />
              <span class="pl-1">{legalPages.terms.label}</span>
            </Button>
          </div>
        </section>
      </div>
    </SheetContent>
  </Sheet>
</main>

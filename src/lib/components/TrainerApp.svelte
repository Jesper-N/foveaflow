<script lang="ts">
  import { onMount } from "svelte";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import SunIcon from "@lucide/svelte/icons/sun";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import { ModeWatcher, mode, toggleMode } from "mode-watcher";

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import * as NativeSelect from "$lib/components/ui/native-select/index.js";
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
    speedToPixelsPerSecond,
  } from "$lib/engine/calibration";
  import { calculateFpsStats } from "$lib/engine/metrics";
  import {
    DEFAULT_BALL_COLOR,
    exercisePresets,
    firstPreset,
    getPreset,
    patternOptions,
    settingsFromPreset,
    type TrainerSettings,
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
  import { loadSettings, saveSettings } from "$lib/engine/storage";
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
    { id: "constant", name: "Constant" },
    { id: "wavePattern", name: "Speed wave" },
    { id: "surgePattern", name: "Speed surges" },
    { id: "alternatingPattern", name: "Alternating speed" },
    { id: "climbPattern", name: "Climb loop" },
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

  let canvas!: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let lastFpsUpdateMs = 0;
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
  const frameTimesMs = new Array<number>(600);
  let frameTimeIndex = 0;
  let frameTimeCount = 0;

  let settings = $state<TrainerSettings>(
    settingsFromPreset(firstPreset, DEFAULT_CALIBRATION),
  );
  let speedValue = $state([firstPreset.speed.value]);
  let sizeValue = $state([firstPreset.baseRadiusPx]);
  let opacityValue = $state([1]);
  let targetCountValue = $state([firstPreset.targetCount]);
  let distractorCountValue = $state([firstPreset.distractorCount]);
  let distractorBrightnessValue = $state([0.7]);
  let fpsStats = $state(calculateFpsStats([]));
  let panelOpen = $state(false);
  let storageReady = $state(false);
  let activePatternId = $state<PatternId>(firstPreset.patternId);
  let colorMode = $state<"light" | "dark">("dark");

  let selectedPreset = $derived(getPreset(settings.presetId));
  let safeBallColor = $derived(safeStimulusColor(settings.ballColor));
  let distractorColor = $derived(
    darkenHexColor(safeBallColor, settings.distractorBrightness),
  );
  let isMotMode = $derived(settings.presetId === "mot");

  const refreshBaseSpeed = () => {
    baseSpeedPxPerSec = speedToPixelsPerSecond(
      settings.speed,
      arena,
      settings.calibration,
    );
  };

  const normalizeSpeedProfile = (
    profile: SpeedProfile | { kind?: string } | undefined,
  ): SpeedProfile => {
    if (!profile?.kind) return { kind: "constant" };
    if (profile.kind === "constant") return { kind: "constant" };
    if (profile.kind === "ramp") {
      return {
        kind: "loopRamp",
        fromMultiplier: 0.45,
        toMultiplier: 1.65,
        periodSec: 5.8,
        resetSec: 1.2,
      };
    }
    if (profile.kind === "sine") {
      const sine = profile as Partial<Extract<SpeedProfile, { kind: "sine" }>>;
      const isQuick = (sine.periodSec ?? 6) <= 4;
      return {
        kind: "sine",
        minMultiplier: isQuick ? 0.4 : 0.45,
        maxMultiplier: isQuick ? 1.65 : 1.55,
        periodSec: isQuick ? 2.8 : 5.2,
      };
    }
    if (profile.kind === "steps") {
      const steps = profile as Partial<
        Extract<SpeedProfile, { kind: "steps" }>
      >;
      const isSurge = (steps.intervalSec ?? 1.25) <= 0.8;
      return {
        kind: "steps",
        multipliers: isSurge
          ? [0.45, 1.65, 0.55, 1.5, 0.8]
          : [0.5, 1.5, 0.65, 1.35],
        intervalSec: isSurge ? 0.65 : 1.25,
        transitionSec: isSurge ? 0.18 : 0.28,
      };
    }
    if (profile.kind === "loopRamp") {
      return {
        kind: "loopRamp",
        fromMultiplier: 0.45,
        toMultiplier: 1.65,
        periodSec: 5.8,
        resetSec: 1.2,
      };
    }
    return { kind: "constant" };
  };

  const normalizeSizeProfile = (
    profile: SizeProfile | { kind?: string } | undefined,
  ): SizeProfile => {
    if (profile?.kind !== "pulse") return { kind: "constant" };
    return {
      kind: "pulse",
      minMultiplier: 0.7,
      maxMultiplier: 1.4,
      periodSec: 3.2,
    };
  };

  const getBehaviorId = (
    speedProfile: SpeedProfile,
    sizeProfile: SizeProfile,
  ): BehaviorId => {
    if (sizeProfile.kind === "pulse") return "sizePulse";
    if (speedProfile.kind === "ramp" || speedProfile.kind === "loopRamp") {
      return "climbPattern";
    }
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

  $effect(() => {
    const nextSpeed = speedValue[0];
    if (typeof nextSpeed === "number" && nextSpeed !== settings.speed.value) {
      settings.speed = { ...settings.speed, value: nextSpeed };
      refreshBaseSpeed();
    }

    const nextSize = sizeValue[0];
    if (typeof nextSize === "number" && nextSize !== settings.baseRadiusPx) {
      settings.baseRadiusPx = nextSize;
    }

    const nextOpacity = opacityValue[0];
    if (
      typeof nextOpacity === "number" &&
      nextOpacity !== settings.targetOpacity
    ) {
      settings.targetOpacity = nextOpacity;
    }

    const nextTargets = targetCountValue[0];
    if (
      typeof nextTargets === "number" &&
      Math.round(nextTargets) !== settings.targetCount
    ) {
      settings.targetCount = Math.round(nextTargets);
    }

    const nextDistractors = distractorCountValue[0];
    if (
      typeof nextDistractors === "number" &&
      Math.round(nextDistractors) !== settings.distractorCount
    ) {
      settings.distractorCount = Math.round(nextDistractors);
    }

    const nextDistractorBrightness = distractorBrightnessValue[0];
    if (
      typeof nextDistractorBrightness === "number" &&
      nextDistractorBrightness !== settings.distractorBrightness
    ) {
      settings.distractorBrightness = nextDistractorBrightness;
    }
  });

  $effect(() => {
    if (storageReady) saveSettings(settings);
  });

  onMount(() => {
    const savedSettings = loadSettings();
    if (savedSettings) {
      settings = mergeSettings(savedSettings);
      syncSlidersFromSettings();
    }
    refreshBaseSpeed();

    const modeUnsubscribe = mode.subscribe((nextMode) => {
      if (nextMode !== "light" && nextMode !== "dark") return;
      colorMode = nextMode;
      canvasTheme = getCanvasTheme();
      drawFrame();
    });
    context = canvas.getContext("2d", { alpha: false });
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const themeObserver = new MutationObserver(() => {
      canvasTheme = getCanvasTheme();
      drawFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    storageReady = true;
    canvasTheme = getCanvasTheme();
    resizeCanvas();
    startLoop();

    return () => {
      cancelAnimationFrame(animationFrame);
      modeUnsubscribe();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });

  const mergeSettings = (saved: TrainerSettings) => {
    const preset = getPreset(saved.presetId);
    const presetId = preset.id;
    const patternId = patternOptions.some(
      (option) => option.id === saved.patternId,
    )
      ? saved.patternId
      : preset.patternId;
    let speedProfile = normalizeSpeedProfile(
      saved.speedProfile ?? preset.speedProfile,
    );
    const sizeProfile = normalizeSizeProfile(
      saved.sizeProfile ?? preset.sizeProfile,
    );
    if (sizeProfile.kind === "pulse") speedProfile = { kind: "constant" };
    return settingsFromPreset(
      preset,
      saved.calibration ?? DEFAULT_CALIBRATION,
      {
        ...saved,
        presetId,
        patternId,
        speed: saved.speed ?? preset.speed,
        speedProfile,
        sizeProfile,
        targetCount: saved.targetCount ?? preset.targetCount,
        distractorCount: saved.distractorCount ?? preset.distractorCount,
        showTrail: saved.showTrail ?? false,
        ballColor: saved.ballColor ?? DEFAULT_BALL_COLOR,
        distractorBrightness: saved.distractorBrightness ?? 0.7,
        targetOpacity: saved.targetOpacity ?? 1,
        targetShape: saved.targetShape ?? "circle",
      },
    );
  };

  const syncSlidersFromSettings = () => {
    speedValue = [settings.speed.value];
    sizeValue = [settings.baseRadiusPx];
    opacityValue = [settings.targetOpacity];
    targetCountValue = [settings.targetCount];
    distractorCountValue = [settings.distractorCount];
    distractorBrightnessValue = [settings.distractorBrightness];
  };

  const resizeCanvas = () => {
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    arena = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };
    canvas.width = Math.max(1, Math.round(arena.width * dpr));
    canvas.height = Math.max(1, Math.round(arena.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  const startLoop = () => {
    cancelAnimationFrame(animationFrame);
    lastTimestamp = 0;
    animationFrame = requestAnimationFrame(tick);
  };

  const tick = (timestamp: number) => {
    const deltaMs =
      lastTimestamp === 0 ? 16.7 : Math.min(80, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    const deltaSec = deltaMs / 1000;
    currentSpeedPxPerSec = getSpeedPxPerSec(elapsedSec);
    travelPx += currentSpeedPxPerSec * deltaSec;
    elapsedSec += deltaSec;
    pushFrameTime(deltaMs, timestamp);
    drawFrame();
    animationFrame = requestAnimationFrame(tick);
  };

  const pushFrameTime = (deltaMs: number, timestamp: number) => {
    frameTimesMs[frameTimeIndex] = deltaMs;
    frameTimeIndex = (frameTimeIndex + 1) % frameTimesMs.length;
    frameTimeCount = Math.min(frameTimeCount + 1, frameTimesMs.length);
    if (timestamp - lastFpsUpdateMs < 250) return;
    lastFpsUpdateMs = timestamp;
    fpsStats = calculateFpsStats(getRecentFrameTimes(240));
  };

  const getRecentFrameTimes = (limit: number) => {
    const count = Math.min(frameTimeCount, limit);
    const recentTimes = new Array<number>(count);
    const start =
      (frameTimeIndex - count + frameTimesMs.length) % frameTimesMs.length;
    for (let index = 0; index < count; index += 1) {
      recentTimes[index] = frameTimesMs[(start + index) % frameTimesMs.length];
    }
    return recentTimes;
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
    if (activePatternId !== patternId) activePatternId = patternId;
    return samplePatternInto(
      targetFrames,
      patternId,
      timeSec,
      arena,
      {
        radiusPx,
        boundsRadiusPx: settings.baseRadiusPx,
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
    const theme = canvasTheme ?? getCanvasTheme();
    ctx.fillStyle = settings.showTrail ? theme.trail : theme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);
    drawGuides(ctx, theme);

    const frameCount = sampleFrameCount(elapsedSec);
    for (let index = 0; index < frameCount; index += 1) {
      drawTarget(ctx, targetFrames[index]);
    }
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
    });
    syncSlidersFromSettings();
    refreshBaseSpeed();
  };

  const resetSettings = () => {
    settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION);
    activePatternId = settings.patternId;
    seed = 4321;
    rng = createRng(seed);
    elapsedSec = 0;
    travelPx = 0;
    currentSpeedPxPerSec = 0;
    syncSlidersFromSettings();
    refreshBaseSpeed();
    drawFrame();
  };

  const setPattern = (patternId: PatternId) => {
    settings.patternId = patternId;
  };

  const setSpeedUnit = (unit: SpeedUnit) => {
    settings.speed = { ...settings.speed, unit };
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

  const handleShapeChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) {
      settings.targetShape = target.value as TargetShape;
    }
  };

  const handleThemeToggle = () => {
    toggleMode();
  };

  const handlePresetChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) applyPreset(target.value);
  };

  const handlePatternChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) {
      setPattern(target.value as PatternId);
    }
  };

  const handleSpeedUnitChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) {
      setSpeedUnit(target.value as SpeedUnit);
    }
  };

  const handleBehaviorChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) {
      setBehavior(target.value as BehaviorId);
    }
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
      cancelAnimationFrame(animationFrame);
      lastTimestamp = 0;
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
  <span class="flex items-center justify-between text-xs text-muted-foreground">
    {label}
    <strong class="text-foreground">{valueLabel}</strong>
  </span>
{/snippet}

<ModeWatcher track={false} defaultMode="dark" />

<main
  class="relative h-dvh w-dvw overflow-hidden bg-background text-foreground"
>
  <canvas
    bind:this={canvas}
    class="absolute inset-0 h-full w-full touch-none"
    data-testid="trainer-canvas"
    aria-label="Eye trainer moving target canvas"
  ></canvas>

  <header
    class="ui-enter pointer-events-auto absolute left-3 top-3 z-10 flex max-w-[calc(100vw-4.75rem)] items-center rounded-lg border bg-popover px-3 py-2 text-popover-foreground"
  >
    <div class="flex min-w-0 flex-wrap items-center gap-2">
      <h1 class="text-sm font-semibold text-foreground">Eye Trainer</h1>
      <Badge variant="outline" class="min-w-28 justify-center">
        {selectedPreset.name}
      </Badge>
      <Badge variant="outline" class="min-w-24 justify-center">
        {activePatternId}
      </Badge>
      <Badge
        variant="outline"
        class="hidden min-w-16 justify-center tabular-nums sm:inline-flex"
      >
        {fpsStats.average || "-"} fps
      </Badge>
    </div>
  </header>

  <Button
    class="ui-enter ui-enter-slow pressable-ui pointer-events-auto absolute right-3 top-3 z-20"
    variant="outline"
    size="icon"
    aria-label="Open settings"
    onclick={() => (panelOpen = true)}
  >
    <SettingsIcon />
  </Button>

  <Sheet bind:open={panelOpen}>
    <SheetContent
      side="right"
      class="w-[min(420px,100vw)] overflow-y-auto px-7 py-8 sm:max-w-[420px]"
    >
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
      </SheetHeader>

      <div class="grid gap-9 pb-12 text-sm">
        <section class="settings-section space-y-5">
          {@render settingHeader("theme", "Theme")}
          <Button
            class="pressable-ui relative w-full justify-start"
            variant="outline"
            onclick={handleThemeToggle}
          >
            {#if colorMode === "dark"}
              <SunIcon class="size-4" />
              <span class="pl-1">Switch to light</span>
            {:else}
              <MoonIcon class="size-4" />
              <span class="pl-1">Switch to dark</span>
            {/if}
          </Button>
        </section>

        <section
          class="settings-section space-y-5 border-t border-border/60 pt-8"
        >
          {@render settingHeader("target", "Mode")}
          <Field.Field>
            <Field.Label for="trainer-mode">Mode</Field.Label>
            <NativeSelect.Root
              id="trainer-mode"
              class="w-full"
              value={settings.presetId}
              onchange={handlePresetChange}
            >
              {#each exercisePresets as preset (preset.id)}
                <NativeSelect.Option value={preset.id}>
                  {preset.name}
                </NativeSelect.Option>
              {/each}
            </NativeSelect.Root>
          </Field.Field>

          {#if settings.presetId === "pursuit"}
            <Field.Field>
              <Field.Label for="trainer-pattern">Pattern</Field.Label>
              <NativeSelect.Root
                id="trainer-pattern"
                class="w-full"
                value={settings.patternId}
                onchange={handlePatternChange}
              >
                {#each patternOptions.filter((option) => option.id !== "multipleObjectTracking") as option (option.id)}
                  <NativeSelect.Option value={option.id}>
                    {option.name}
                  </NativeSelect.Option>
                {/each}
              </NativeSelect.Root>
            </Field.Field>
          {/if}

          <Field.Field>
            <Field.Label for="trainer-behavior">Behavior</Field.Label>
            <NativeSelect.Root
              id="trainer-behavior"
              class="w-full"
              value={behaviorValue}
              onchange={handleBehaviorChange}
            >
              {#each behaviorOptions as option (option.id)}
                <NativeSelect.Option value={option.id}>
                  {option.name}
                </NativeSelect.Option>
              {/each}
            </NativeSelect.Root>
          </Field.Field>

          {#if isMotMode}
            <div class="space-y-5 pt-1">
              {@render settingHeader("eye", "Visual load")}
              <Field.Field>
                {@render sliderRow("Targets", String(targetCountValue[0]))}
                <Slider
                  bind:value={targetCountValue}
                  min={1}
                  max={6}
                  step={1}
                  aria-label="Targets"
                />
              </Field.Field>
              <Field.Field>
                {@render sliderRow(
                  "Distractors",
                  String(distractorCountValue[0]),
                )}
                <Slider
                  bind:value={distractorCountValue}
                  min={0}
                  max={10}
                  step={1}
                  aria-label="Distractors"
                />
              </Field.Field>
            </div>
          {/if}
        </section>

        <section
          class="settings-section space-y-5 border-t border-border/60 pt-8"
        >
          {@render settingHeader("eye", "Color")}
          <Field.Field>
            <label
              class="flex h-11 cursor-pointer items-center gap-3 rounded-full border bg-input/50 px-3 transition-[color,box-shadow,background-color] hover:ring-4 hover:ring-ring/30"
              for="trainer-color"
            >
              <span
                class="size-6 rounded-full border shadow-sm"
                style:background-color={settings.ballColor}
              ></span>
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
                `${Math.round((distractorBrightnessValue[0] ?? settings.distractorBrightness) * 100)}%`,
              )}
              <Slider
                bind:value={distractorBrightnessValue}
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
              `${Math.round((opacityValue[0] ?? settings.targetOpacity) * 100)}%`,
            )}
            <Slider
              bind:value={opacityValue}
              min={0}
              max={1}
              step={0.01}
              aria-label="Target opacity"
            />
          </Field.Field>
        </section>

        <section
          class="settings-section space-y-5 border-t border-border/60 pt-8"
        >
          {@render settingHeader("eye", "Shape")}
          <Field.Field>
            <NativeSelect.Root
              id="trainer-shape"
              class="w-full"
              value={settings.targetShape}
              onchange={handleShapeChange}
            >
              {#each shapeOptions as option (option.id)}
                <NativeSelect.Option value={option.id}>
                  {option.name}
                </NativeSelect.Option>
              {/each}
            </NativeSelect.Root>
          </Field.Field>

          <Field.Field>
            {@render sliderRow(
              "Size",
              `${Math.round(sizeValue[0] ?? settings.baseRadiusPx)} px`,
            )}
            <Slider
              bind:value={sizeValue}
              min={4}
              max={100}
              step={1}
              aria-label="Target size"
            />
          </Field.Field>
        </section>

        <section
          class="settings-section space-y-5 border-t border-border/60 pt-8"
        >
          {@render settingHeader("motion", "Motion")}
          <Field.Field>
            {@render sliderRow(
              "Speed",
              `${speedValue[0]?.toFixed(1)} ${settings.speed.unit}`,
            )}
            <Slider
              bind:value={speedValue}
              min={0.5}
              max={maxSpeedByUnit[settings.speed.unit]}
              step={speedStepByUnit[settings.speed.unit]}
              aria-label="Speed"
            />
          </Field.Field>

          <Field.Field>
            <Field.Label for="trainer-speed-unit">Unit</Field.Label>
            <NativeSelect.Root
              id="trainer-speed-unit"
              class="w-full"
              value={settings.speed.unit}
              onchange={handleSpeedUnitChange}
            >
              <NativeSelect.Option value="deg/s">deg/s</NativeSelect.Option>
              <NativeSelect.Option value="cm/s">cm/s</NativeSelect.Option>
              <NativeSelect.Option value="screen/s"
                >screen/s</NativeSelect.Option
              >
            </NativeSelect.Root>
          </Field.Field>
        </section>

        <section
          class="settings-section space-y-5 border-t border-border/60 pt-8"
        >
          {@render settingHeader("calibration", "Calibration")}
          <div class="grid grid-cols-2 gap-2">
            <Field.Field>
              <Field.Label for="trainer-distance">Distance cm</Field.Label>
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
              <Field.Label for="trainer-css-px-cm">CSS px/cm</Field.Label>
              <Input
                id="trainer-css-px-cm"
                type="number"
                min="10"
                max="120"
                step="0.1"
                value={settings.calibration.cssPxPerCm}
                oninput={(event) => handleCalibrationInput(event, "cssPxPerCm")}
              />
            </Field.Field>
          </div>
          <Item.Root variant="outline" size="sm">
            <Item.Content>
              <Item.Title>Trail</Item.Title>
            </Item.Content>
            <Item.Actions>
              <Switch bind:checked={settings.showTrail} aria-label="Trail" />
            </Item.Actions>
          </Item.Root>
        </section>

        <section class="settings-section border-t border-border/60 pt-8">
          <Button
            class="pressable-ui w-full justify-start"
            variant="outline"
            onclick={resetSettings}
          >
            <RotateCcwIcon class="size-4" />
            <span class="pl-1">Reset to defaults</span>
          </Button>
        </section>
      </div>
    </SheetContent>
  </Sheet>
</main>

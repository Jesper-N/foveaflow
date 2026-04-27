<script lang="ts">
  import { onMount } from "svelte";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import ShuffleIcon from "@lucide/svelte/icons/shuffle";
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
  import { safeStimulusColor } from "$lib/engine/safety";
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
          cue: "rgba(255, 255, 255,",
        }
      : {
          background: "#eff1f3",
          trail: "rgba(239, 241, 243, 0.38)",
          grid: "rgba(16, 18, 22, 0.075)",
          cue: "rgba(16, 18, 22,",
        };
  };
  const randomPatternIds: PatternId[] = [
    "circle",
    "ellipse",
    "figureEight",
    "wave",
    "diagonal",
    "bounce",
    "randomWalk",
    "directionChange",
    "looming",
  ];

  const speedProfileOptions: Array<{
    kind: SpeedProfile["kind"];
    name: string;
  }> = [
    { kind: "constant", name: "Constant" },
    { kind: "ramp", name: "Slow ramp" },
    { kind: "sine", name: "Sine wave" },
    { kind: "randomJitter", name: "Random jitter" },
    { kind: "abruptStep", name: "Abrupt step" },
  ];

  const sizeProfileOptions: Array<{ kind: SizeProfile["kind"]; name: string }> =
    [
      { kind: "constant", name: "Constant" },
      { kind: "ramp", name: "Slow ramp" },
      { kind: "pulse", name: "Pulse" },
      { kind: "randomStep", name: "Random step" },
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
  let patternRng = createRng(seed + 101);
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
  let targetCountValue = $state([firstPreset.targetCount]);
  let distractorCountValue = $state([firstPreset.distractorCount]);
  let contrastValue = $state([firstPreset.contrast]);
  let fpsStats = $state(calculateFpsStats([]));
  let panelOpen = $state(false);
  let storageReady = $state(false);
  let activePatternId = $state<PatternId>(firstPreset.patternId);
  let colorMode = $state<"light" | "dark">("dark");

  let selectedPreset = $derived(getPreset(settings.presetId));
  let safeBallColor = $derived(safeStimulusColor(settings.ballColor));
  let safeSecondaryColor = $derived(safeStimulusColor(selectedPreset.colorB));
  let isMotMode = $derived(settings.presetId === "mot");
  let isContrastMode = $derived(settings.presetId === "contrast");
  let isRandomMode = $derived(settings.presetId === "random");
  let isPeripheralMode = $derived(settings.presetId === "peripheral");

  const refreshBaseSpeed = () => {
    baseSpeedPxPerSec = speedToPixelsPerSecond(
      settings.speed,
      arena,
      settings.calibration,
    );
  };

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

    const nextContrast = contrastValue[0];
    if (
      typeof nextContrast === "number" &&
      nextContrast !== settings.contrast
    ) {
      settings.contrast = nextContrast;
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
      drawFrame(performance.now());
    });
    context = canvas.getContext("2d", { alpha: false });
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const themeObserver = new MutationObserver(() => {
      canvasTheme = getCanvasTheme();
      drawFrame(performance.now());
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
    return settingsFromPreset(
      preset,
      saved.calibration ?? DEFAULT_CALIBRATION,
      {
        ...saved,
        speed: saved.speed ?? preset.speed,
        speedProfile: saved.speedProfile ?? preset.speedProfile,
        sizeProfile: saved.sizeProfile ?? preset.sizeProfile,
        targetCount: saved.targetCount ?? preset.targetCount,
        distractorCount: saved.distractorCount ?? preset.distractorCount,
        contrast: saved.contrast ?? preset.contrast,
        showTrail: saved.showTrail ?? false,
        ballColor: saved.ballColor ?? DEFAULT_BALL_COLOR,
        targetShape: saved.targetShape ?? "circle",
      },
    );
  };

  const syncSlidersFromSettings = () => {
    speedValue = [settings.speed.value];
    sizeValue = [settings.baseRadiusPx];
    targetCountValue = [settings.targetCount];
    distractorCountValue = [settings.distractorCount];
    contrastValue = [settings.contrast];
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
    drawFrame(performance.now());
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
    drawFrame(timestamp);
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
      seed,
    );
  };

  const getEffectivePattern = (timeSec: number) => {
    if (!settings.randomizePattern) return settings.patternId;
    const bucket = Math.floor(timeSec / 10);
    const index = Math.min(
      randomPatternIds.length - 1,
      Math.floor(patternRng.rangeAt(bucket, 0, randomPatternIds.length)),
    );
    return randomPatternIds[index];
  };

  const sampleFrameCount = (timeSec: number) => {
    const patternId = getEffectivePattern(timeSec);
    const speedPxPerSec = currentSpeedPxPerSec || getSpeedPxPerSec(timeSec);
    const radiusPx = sampleSizeProfile(
      settings.sizeProfile,
      timeSec,
      settings.baseRadiusPx,
      seed + 17,
    );
    if (activePatternId !== patternId) activePatternId = patternId;
    return samplePatternInto(
      targetFrames,
      patternId,
      timeSec,
      arena,
      {
        radiusPx,
        speedPxPerSec,
        travelPx,
        targetCount: settings.targetCount,
        distractorCount: settings.distractorCount,
        contrast: settings.contrast,
        colorA: safeBallColor,
        colorB: safeSecondaryColor,
      },
      rng,
    );
  };

  const drawFrame = (timestamp: number) => {
    if (!context) return;
    const ctx = context;
    const theme = canvasTheme ?? getCanvasTheme();
    ctx.fillStyle = settings.showTrail ? theme.trail : theme.background;
    ctx.fillRect(0, 0, arena.width, arena.height);
    drawGuides(ctx, theme);

    const frameCount = sampleFrameCount(elapsedSec);
    for (let index = 0; index < frameCount; index += 1) {
      drawTarget(ctx, targetFrames[index], timestamp, theme);
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

  const drawTarget = (
    ctx: CanvasRenderingContext2D,
    frame: TargetFrame,
    timestamp: number,
    theme: ReturnType<typeof getCanvasTheme>,
  ) => {
    if (!frame.visible) return;
    const fixation = frame.role === "fixation";
    const cue = frame.role === "cue";
    const pulse = cue ? (Math.sin(timestamp / 180) + 1) * 0.5 : 0;

    ctx.globalAlpha = frame.alpha;
    ctx.fillStyle = frame.color;
    drawStimulusShape(
      ctx,
      frame.x,
      frame.y,
      frame.radiusPx,
      frame.role === "target" || frame.role === "distractor"
        ? settings.targetShape
        : "circle",
    );

    if (fixation) {
      ctx.strokeStyle = "rgba(247, 247, 242, 0.78)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(frame.x - 12, frame.y);
      ctx.lineTo(frame.x + 12, frame.y);
      ctx.moveTo(frame.x, frame.y - 12);
      ctx.lineTo(frame.x, frame.y + 12);
      ctx.stroke();
    }

    if (cue) {
      ctx.strokeStyle = `${theme.cue} ${0.36 + pulse * 0.28})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(frame.x, frame.y, frame.radiusPx + 7 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
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
      showTrail: settings.showTrail,
      ballColor: settings.ballColor,
      targetShape: settings.targetShape,
    });
    syncSlidersFromSettings();
    refreshBaseSpeed();
  };

  const setPattern = (patternId: PatternId) => {
    settings.patternId = patternId;
    settings.randomizePattern = false;
  };

  const setSpeedUnit = (unit: SpeedUnit) => {
    settings.speed = { ...settings.speed, unit };
    refreshBaseSpeed();
  };

  const setSpeedProfile = (kind: SpeedProfile["kind"]) => {
    if (kind === "constant") settings.speedProfile = { kind };
    if (kind === "ramp") {
      settings.speedProfile = {
        kind,
        fromMultiplier: 0.65,
        toMultiplier: 1.3,
        durationSec: 90,
      };
    }
    if (kind === "sine") {
      settings.speedProfile = {
        kind,
        minMultiplier: 0.65,
        maxMultiplier: 1.35,
        periodSec: 8,
      };
    }
    if (kind === "randomJitter") {
      settings.speedProfile = { kind, amount: 0.28, intervalSec: 0.8 };
    }
    if (kind === "abruptStep") {
      settings.speedProfile = {
        kind,
        minMultiplier: 0.55,
        maxMultiplier: 1.65,
        intervalSec: 1.1,
      };
    }
  };

  const setSizeProfile = (kind: SizeProfile["kind"]) => {
    if (kind === "constant") settings.sizeProfile = { kind };
    if (kind === "ramp") {
      settings.sizeProfile = {
        kind,
        fromPx: Math.max(5, settings.baseRadiusPx * 0.6),
        toPx: settings.baseRadiusPx * 1.8,
        durationSec: 90,
      };
    }
    if (kind === "pulse") {
      settings.sizeProfile = {
        kind,
        minPx: Math.max(5, settings.baseRadiusPx * 0.6),
        maxPx: settings.baseRadiusPx * 1.75,
        periodSec: 3.4,
      };
    }
    if (kind === "randomStep") {
      settings.sizeProfile = {
        kind,
        minPx: Math.max(5, settings.baseRadiusPx * 0.6),
        maxPx: settings.baseRadiusPx * 1.8,
        intervalSec: 1.2,
      };
    }
  };

  const regenerateSeed = () => {
    seed = Math.floor(Math.random() * 1_000_000);
    rng = createRng(seed);
    patternRng = createRng(seed + 101);
    elapsedSec = 0;
    travelPx = 0;
    currentSpeedPxPerSec = 0;
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

  const handleSpeedProfileChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) {
      setSpeedProfile(target.value as SpeedProfile["kind"]);
    }
  };

  const handleSizeProfileChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLSelectElement) {
      setSizeProfile(target.value as SizeProfile["kind"]);
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
  icon: "target" | "motion" | "eye" | "calibration",
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
      class="w-[min(420px,100vw)] overflow-y-auto p-6 sm:max-w-[420px]"
    >
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
      </SheetHeader>

      <div class="grid gap-6 pb-8 text-sm">
        <section class="settings-section space-y-3">
          {@render settingHeader("calibration", "Theme")}
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

        <section class="settings-section space-y-3">
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
                {#each patternOptions.filter((option) => option.id !== "multipleObjectTracking" && option.id !== "peripheralCue") as option (option.id)}
                  <NativeSelect.Option value={option.id}>
                    {option.name}
                  </NativeSelect.Option>
                {/each}
              </NativeSelect.Root>
            </Field.Field>
          {/if}

          {#if isRandomMode}
            <Item.Root variant="outline" size="sm">
              <Item.Content>
                <Item.Title>Randomize pattern</Item.Title>
              </Item.Content>
              <Item.Actions>
                <Switch
                  bind:checked={settings.randomizePattern}
                  aria-label="Randomize pattern"
                />
              </Item.Actions>
            </Item.Root>
            <Button
              class="pressable-ui"
              variant="outline"
              onclick={regenerateSeed}
            >
              <ShuffleIcon />
              New sequence
            </Button>
          {/if}
        </section>

        <section class="settings-section space-y-3">
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

          <div class="grid grid-cols-2 gap-2">
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
                <NativeSelect.Option value="screen/s">
                  screen/s
                </NativeSelect.Option>
              </NativeSelect.Root>
            </Field.Field>

            {#if isRandomMode || settings.presetId === "pursuit"}
              <Field.Field>
                <Field.Label for="trainer-speed-profile">
                  Speed profile
                </Field.Label>
                <NativeSelect.Root
                  id="trainer-speed-profile"
                  class="w-full"
                  value={settings.speedProfile.kind}
                  onchange={handleSpeedProfileChange}
                >
                  {#each speedProfileOptions as option (option.kind)}
                    <NativeSelect.Option value={option.kind}>
                      {option.name}
                    </NativeSelect.Option>
                  {/each}
                </NativeSelect.Root>
              </Field.Field>
            {/if}
          </div>

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

          <div class="grid grid-cols-[auto_1fr] gap-2">
            <Field.Field>
              <Field.Label for="trainer-color">Color</Field.Label>
              <Input
                id="trainer-color"
                class="h-9 w-14 p-1"
                type="color"
                value={settings.ballColor}
                oninput={handleColorInput}
                aria-label="Ball color"
              />
            </Field.Field>

            <Field.Field>
              <Field.Label for="trainer-shape">Shape</Field.Label>
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
          </div>

          {#if isRandomMode || settings.presetId === "looming" || isContrastMode}
            <Field.Field>
              <Field.Label for="trainer-size-profile">Size profile</Field.Label>
              <NativeSelect.Root
                id="trainer-size-profile"
                class="w-full"
                value={settings.sizeProfile.kind}
                onchange={handleSizeProfileChange}
              >
                {#each sizeProfileOptions as option (option.kind)}
                  <NativeSelect.Option value={option.kind}>
                    {option.name}
                  </NativeSelect.Option>
                {/each}
              </NativeSelect.Root>
            </Field.Field>
          {/if}
        </section>

        {#if isMotMode || isContrastMode || isPeripheralMode}
          <section class="settings-section space-y-3">
            {@render settingHeader("eye", "Visual load")}

            {#if isContrastMode}
              <Field.Field>
                {@render sliderRow(
                  "Contrast",
                  `${Math.round((contrastValue[0] ?? settings.contrast) * 100)}%`,
                )}
                <Slider
                  bind:value={contrastValue}
                  min={0.08}
                  max={1}
                  step={0.02}
                  aria-label="Contrast"
                />
              </Field.Field>
            {/if}

            {#if isMotMode}
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
            {/if}

            {#if isPeripheralMode}
              <Item.Root variant="outline" size="sm">
                <Item.Content>
                  <Item.Description>
                    Keep your eyes on the center cross and use peripheral vision
                    to notice the outer cue.
                  </Item.Description>
                </Item.Content>
              </Item.Root>
            {/if}
          </section>
        {/if}

        <section class="settings-section space-y-3">
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
      </div>
    </SheetContent>
  </Sheet>
</main>

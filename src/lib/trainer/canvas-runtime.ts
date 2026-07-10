import { speedToPixelsPerSecond } from "$lib/engine/calibration";
import { resolveCanvasLayout } from "$lib/engine/canvas";
import type { TrainerSettings } from "$lib/engine/presets";
import { sampleSpeedProfile } from "$lib/engine/profiles";
import { createRng, createSessionSeed } from "$lib/engine/random";
import type { Arena, PatternId } from "$lib/engine/types";
import { createTrainerFrameSampler } from "$lib/trainer/frame-sampler";
import { advanceMotionTick, type MotionTickResult } from "$lib/trainer/motion";
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
import { resetUnsupportedMotionDirection } from "$lib/trainer/settings";

type TrainerCanvasState = {
  settings: TrainerSettings;
  colorMode: CanvasColorMode;
  motionPaused: boolean;
  canToggleDirection: boolean;
  isLilacChaserMode: boolean;
  safeBallColor: string;
  distractorColor: string;
};

type TrainerCanvasRuntimeOptions = {
  getState: () => TrainerCanvasState;
};

type DrawFrameOptions = {
  clearTrail?: boolean;
};

type TrainerCanvasRuntime = {
  attachCanvas: (node: HTMLCanvasElement) => () => void;
  drawFrame: (options?: DrawFrameOptions) => void;
  getArena: () => Arena;
  handleVisibilityChange: () => void;
  invalidateLilacChaserFrame: () => void;
  normalizeMotionDirection: (
    patternId: PatternId,
    motionDirection: TrainerSettings["motionDirection"],
  ) => TrainerSettings["motionDirection"];
  redrawForTheme: (colorMode: CanvasColorMode) => void;
  refreshBaseSpeed: () => void;
  resetMotion: () => void;
  resetPatternState: () => void;
  syncPlayback: () => void;
};

const initialArena = (): Arena => ({ width: 1, height: 1 });

export const createTrainerCanvasRuntime = ({
  getState,
}: TrainerCanvasRuntimeOptions): TrainerCanvasRuntime => {
  let canvas: HTMLCanvasElement | null = null;
  let context: CanvasRenderingContext2D | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let motionFrame = 0;
  let themeFrame = 0;
  let lastTimestamp = 0;
  let arena = initialArena();
  let elapsedSec = 0;
  let travelPx = 0;
  let currentSpeedPxPerSec = 0;
  let baseSpeedPxPerSec = 0;
  let seed = createSessionSeed();
  let rng = createRng(seed);
  const frameSampler = createTrainerFrameSampler();
  let canvasTheme: CanvasTheme | null = null;
  let gridPath: Path2D | null = null;
  let canvasScale = 1;
  let lastLilacChaserHiddenIndex = -1;
  const motionTickResult: MotionTickResult = {
    lastTimestamp,
    elapsedSec,
    travelPx,
  };
  const pathMarginPx = 16;

  const refreshBaseSpeed = () => {
    const { settings } = getState();
    baseSpeedPxPerSec = speedToPixelsPerSecond(
      settings.speed,
      arena,
      settings.calibration,
    );
  };

  const invalidateLilacChaserFrame = () => {
    lastLilacChaserHiddenIndex = -1;
  };

  const resetPatternState = () => {
    frameSampler.reset();
    lastTimestamp = 0;
    elapsedSec = 0;
    travelPx = 0;
    currentSpeedPxPerSec = 0;
    invalidateLilacChaserFrame();
  };

  const drawCurrentLilacChaserFrame = (ctx: CanvasRenderingContext2D) => {
    const { settings } = getState();
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

  const drawFrame = ({ clearTrail = false }: DrawFrameOptions = {}) => {
    if (!canvas || !context) return;

    const state = getState();
    if (state.isLilacChaserMode) {
      drawCurrentLilacChaserFrame(context);
      return;
    }

    const theme = canvasTheme ?? getCanvasTheme(canvas, state.colorMode);
    const showTrail = state.settings.showTrail && state.canToggleDirection;
    context.fillStyle =
      showTrail && !clearTrail ? theme.trail : theme.background;
    context.fillRect(0, 0, arena.width, arena.height);
    drawGuides(
      context,
      gridPath,
      theme,
      showTrail && !clearTrail ? theme.trailGrid : theme.grid,
    );

    const frameSample = frameSampler.sample({
      settings: state.settings,
      arena,
      elapsedSec,
      travelPx,
      currentSpeedPxPerSec,
      baseSpeedPxPerSec,
      safeBallColor: state.safeBallColor,
      distractorColor: state.distractorColor,
      pathMarginPx,
      rng,
      seed,
    });
    for (let index = 0; index < frameSample.count; index += 1) {
      drawTargetFrame(
        context,
        frameSample.frames[index],
        index,
        state.settings,
        frameSample.letterContext,
      );
    }
  };

  const rebuildGridPath = () => {
    gridPath = createGuideGridPath(arena);
  };

  const resizeCanvas = (entries?: ResizeObserverEntry[]) => {
    if (!canvas || !context) return;

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

  const shouldAnimateMotion = () => {
    return !getState().motionPaused && !document.hidden;
  };

  const stopLoop = () => {
    if (motionFrame !== 0) cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    lastTimestamp = 0;
  };

  const shouldDrawTickFrame = (isLilacChaserMode: boolean) => {
    if (!isLilacChaserMode) return true;
    return getLilacChaserHiddenIndex(elapsedSec) !== lastLilacChaserHiddenIndex;
  };

  const tick = (timestamp: number) => {
    if (!shouldAnimateMotion()) {
      stopLoop();
      return;
    }

    const state = getState();
    const nextMotion = advanceMotionTick(
      {
        timestamp,
        lastTimestamp,
        elapsedSec,
        travelPx,
        baseSpeedPxPerSec,
        speedProfile: state.settings.speedProfile,
        canToggleDirection: state.canToggleDirection,
        motionDirection: state.settings.motionDirection,
      },
      motionTickResult,
    );
    lastTimestamp = nextMotion.lastTimestamp;
    elapsedSec = nextMotion.elapsedSec;
    travelPx = nextMotion.travelPx;
    currentSpeedPxPerSec = sampleSpeedProfile(
      state.settings.speedProfile,
      elapsedSec,
      baseSpeedPxPerSec,
    );
    if (shouldDrawTickFrame(state.isLilacChaserMode)) drawFrame();
    motionFrame = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (!shouldAnimateMotion()) return;
    stopLoop();
    lastTimestamp = performance.now();
    motionFrame = requestAnimationFrame(tick);
  };

  const syncPlayback = () => {
    if (getState().motionPaused) {
      stopLoop();
      drawFrame();
      return;
    }
    startLoop();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    startLoop();
  };

  const redrawForTheme = (colorMode: CanvasColorMode) => {
    if (!canvas) return;
    if (themeFrame !== 0) cancelAnimationFrame(themeFrame);

    themeFrame = requestAnimationFrame(() => {
      themeFrame = 0;
      if (!canvas) return;
      canvasTheme = getCanvasTheme(canvas, colorMode);
      drawFrame();
    });
  };

  const normalizeMotionDirection = (
    patternId: PatternId,
    motionDirection: TrainerSettings["motionDirection"],
  ) => {
    const directionState = resetUnsupportedMotionDirection(
      patternId,
      motionDirection,
      travelPx,
    );
    travelPx = directionState.travelPx;
    return directionState.motionDirection;
  };

  const resetMotion = () => {
    seed = createSessionSeed();
    rng = createRng(seed);
    resetPatternState();
    refreshBaseSpeed();
    drawFrame({ clearTrail: true });
  };

  const detachCanvas = (expectedCanvas?: HTMLCanvasElement) => {
    if (expectedCanvas && canvas !== expectedCanvas) return;

    stopLoop();
    if (themeFrame !== 0) cancelAnimationFrame(themeFrame);
    themeFrame = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    canvas = null;
    context = null;
    canvasTheme = null;
    gridPath = null;
    arena = initialArena();
    canvasScale = 1;
  };

  const attachCanvas = (node: HTMLCanvasElement) => {
    detachCanvas();
    canvas = node;
    context = node.getContext("2d", { alpha: false, desynchronized: true });
    if (!context) {
      return () => detachCanvas(node);
    }

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);
    canvasTheme = getCanvasTheme(node, getState().colorMode);
    resizeCanvas();
    startLoop();

    return () => detachCanvas(node);
  };

  return {
    attachCanvas,
    drawFrame,
    getArena: () => ({ ...arena }),
    handleVisibilityChange,
    invalidateLilacChaserFrame,
    normalizeMotionDirection,
    redrawForTheme,
    refreshBaseSpeed,
    resetMotion,
    resetPatternState,
    syncPlayback,
  };
};

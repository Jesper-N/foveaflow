import { speedToPixelsPerSecond } from "$lib/engine/calibration";
import { resolveCanvasLayout } from "$lib/engine/canvas";
import type { TrainerSettings } from "$lib/engine/presets";
import { createRng, createSessionSeed } from "$lib/engine/random";
import type { Arena, PatternId } from "$lib/engine/types";
import { createTrainerFrameSampler } from "$lib/trainer/frame-sampler";
import type { TrainerFrameInput } from "$lib/trainer/frame-sampler";
import { advanceMotionTick } from "$lib/trainer/motion";
import type { MotionState } from "$lib/trainer/motion";
import {
  applyCanvasBackground,
  drawLilacChaserFrame,
  drawTargetFrame,
  getCanvasTheme,
  getLilacChaserHiddenIndex,
} from "$lib/trainer/rendering";
import type { CanvasColorMode, CanvasTheme } from "$lib/trainer/rendering";
import { resetUnsupportedMotionDirection } from "$lib/trainer/settings";
import { getTargetVisualExtentPx } from "$lib/trainer/target-geometry";

interface TrainerCanvasState {
  settings: TrainerSettings;
  motionPaused: boolean;
  canToggleDirection: boolean;
  isLilacChaserMode: boolean;
  safeBallColor: string;
  distractorColor: string;
}

interface TrainerCanvasRuntimeOptions {
  getState: () => TrainerCanvasState;
  getColorMode: () => CanvasColorMode;
}

interface DrawFrameOptions {
  clearTrail?: boolean;
}

interface DirtyBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TRAIL_TILE_SIZE_PX = 128;
const TRAIL_TILE_MAX_AGE = 20;

interface TrainerCanvasRuntime {
  attachCanvas: (node: HTMLCanvasElement) => () => void;
  drawFrame: (options?: DrawFrameOptions) => void;
  getArena: () => Arena;
  handleVisibilityChange: () => void;
  invalidateLilacChaserFrame: () => void;
  normalizeMotionDirection: (
    patternId: PatternId,
    motionDirection: TrainerSettings["motionDirection"]
  ) => TrainerSettings["motionDirection"];
  redrawForTheme: (colorMode: CanvasColorMode) => void;
  refreshBaseSpeed: () => void;
  resetMotion: () => void;
  resetPatternState: () => void;
  syncPlayback: () => void;
}

const initialArena = (): Arena => ({ height: 1, width: 1 });

const shouldAnimateMotion = (state: TrainerCanvasState) =>
  !state.motionPaused && !globalThis.document?.hidden;

export const createTrainerCanvasRuntime = ({
  getState,
  getColorMode,
}: TrainerCanvasRuntimeOptions): TrainerCanvasRuntime => {
  let canvas: HTMLCanvasElement | null = null;
  let context: CanvasRenderingContext2D | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let motionFrame = 0;
  let themeFrame = 0;
  let arena = initialArena();
  let baseSpeedPxPerSec = 0;
  let seed = createSessionSeed();
  let rng = createRng(seed);
  const frameSampler = createTrainerFrameSampler();
  let canvasTheme: CanvasTheme | null = null;
  let canvasScale = 1;
  let lastLilacChaserHiddenIndex = -1;
  let lastFrameWasLilacChaser = false;
  let lastFrameUsedTrail = false;
  const dirtyBounds: DirtyBounds[] = [];
  let trailTileColumns = 1;
  let trailTileRows = 1;
  let trailTileAges = new Uint8Array(1);
  const pathMarginPx = 16;
  const motionState: MotionState = {
    elapsedSec: 0,
    lastTimestamp: 0,
    travelPx: 0,
  };
  const frameInput: TrainerFrameInput = {
    arena,
    distractorColor: "",
    elapsedSec: 0,
    pathMarginPx,
    rng,
    safeBallColor: "",
    seed,
    settings: getState().settings,
    travelPx: 0,
  };

  const refreshBaseSpeed = () => {
    const { settings } = getState();
    baseSpeedPxPerSec = speedToPixelsPerSecond(
      settings.speed,
      arena,
      settings.calibration
    );
  };

  const invalidateLilacChaserFrame = () => {
    lastLilacChaserHiddenIndex = -1;
  };

  const resetPatternState = () => {
    frameSampler.reset();
    motionState.lastTimestamp = 0;
    motionState.elapsedSec = 0;
    motionState.travelPx = 0;
    lastFrameWasLilacChaser = false;
    lastFrameUsedTrail = false;
    trailTileAges.fill(0);
    invalidateLilacChaserFrame();
  };

  const drawCurrentLilacChaserFrame = (
    ctx: CanvasRenderingContext2D,
    settings: TrainerSettings
  ) => {
    const hiddenIndex = getLilacChaserHiddenIndex(motionState.elapsedSec);
    lastLilacChaserHiddenIndex = hiddenIndex;

    drawLilacChaserFrame(
      ctx,
      arena,
      settings.lilacChaserScale,
      settings.lilacChaserBallColor,
      hiddenIndex
    );
    dirtyBounds.length = 0;
    lastFrameWasLilacChaser = true;
    lastFrameUsedTrail = false;
  };

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, arena.width, arena.height);
    trailTileAges.fill(0);
  };

  const clearDirtyBounds = (ctx: CanvasRenderingContext2D) => {
    for (const bounds of dirtyBounds) {
      ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  };

  const fadeTrail = (ctx: CanvasRenderingContext2D, alpha: number) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = alpha;
    for (let index = 0; index < trailTileAges.length; index += 1) {
      const age = trailTileAges[index];
      if (age === 0) {
        continue;
      }

      const column = index % trailTileColumns;
      const row = Math.floor(index / trailTileColumns);
      const x = column * TRAIL_TILE_SIZE_PX;
      const y = row * TRAIL_TILE_SIZE_PX;
      const width = Math.min(TRAIL_TILE_SIZE_PX, arena.width - x);
      const height = Math.min(TRAIL_TILE_SIZE_PX, arena.height - y);
      if (age >= TRAIL_TILE_MAX_AGE) {
        ctx.clearRect(x, y, width, height);
        trailTileAges[index] = 0;
        continue;
      }

      ctx.fillRect(x, y, width, height);
      trailTileAges[index] = age + 1;
    }
    ctx.restore();
  };

  const markTrailTiles = () => {
    for (const bounds of dirtyBounds) {
      const firstColumn = Math.max(
        0,
        Math.floor(bounds.x / TRAIL_TILE_SIZE_PX)
      );
      const lastColumn = Math.min(
        trailTileColumns - 1,
        Math.floor((bounds.x + bounds.width - 1) / TRAIL_TILE_SIZE_PX)
      );
      const firstRow = Math.max(0, Math.floor(bounds.y / TRAIL_TILE_SIZE_PX));
      const lastRow = Math.min(
        trailTileRows - 1,
        Math.floor((bounds.y + bounds.height - 1) / TRAIL_TILE_SIZE_PX)
      );

      for (let row = firstRow; row <= lastRow; row += 1) {
        const rowOffset = row * trailTileColumns;
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          trailTileAges[rowOffset + column] = 1;
        }
      }
    }
  };

  const rebuildTrailTiles = () => {
    trailTileColumns = Math.max(1, Math.ceil(arena.width / TRAIL_TILE_SIZE_PX));
    trailTileRows = Math.max(1, Math.ceil(arena.height / TRAIL_TILE_SIZE_PX));
    trailTileAges = new Uint8Array(trailTileColumns * trailTileRows);
  };

  const storeDirtyBounds = (
    frameSample: ReturnType<typeof frameSampler.sample>,
    settings: TrainerSettings
  ) => {
    let dirtyCount = 0;
    for (let index = 0; index < frameSample.count; index += 1) {
      const frame = frameSample.frames[index];
      if (!frame.visible || frame.alpha * settings.targetOpacity <= 0) {
        continue;
      }

      const targetFormExtent = getTargetVisualExtentPx(
        frame.radiusPx,
        settings.targetForm
      );
      const letterExtent = settings.letterEnabled
        ? frame.radiusPx * settings.letterScale
        : 0;
      const extent = Math.max(targetFormExtent, letterExtent) + 3;
      const left = Math.floor(frame.x - extent);
      const top = Math.floor(frame.y - extent);
      const right = Math.ceil(frame.x + extent);
      const bottom = Math.ceil(frame.y + extent);
      let bounds = dirtyBounds[dirtyCount];
      if (!bounds) {
        bounds = { height: 0, width: 0, x: left, y: top };
        dirtyBounds[dirtyCount] = bounds;
      }
      bounds.x = left;
      bounds.y = top;
      bounds.width = right - left;
      bounds.height = bottom - top;
      dirtyCount += 1;
    }
    dirtyBounds.length = dirtyCount;
  };

  const renderFrame = (state: TrainerCanvasState, clearTrail: boolean) => {
    if (!canvas || !context || !canvasTheme) {
      return;
    }

    if (state.isLilacChaserMode) {
      drawCurrentLilacChaserFrame(context, state.settings);
      return;
    }

    const showTrail = state.settings.showTrail && state.canToggleDirection;
    const mustClearCanvas =
      clearTrail || lastFrameWasLilacChaser || showTrail !== lastFrameUsedTrail;
    if (mustClearCanvas) {
      clearCanvas(context);
    } else if (showTrail) {
      fadeTrail(context, canvasTheme.trailFadeAlpha);
    } else {
      clearDirtyBounds(context);
    }

    frameInput.settings = state.settings;
    frameInput.arena = arena;
    frameInput.elapsedSec = motionState.elapsedSec;
    frameInput.travelPx = motionState.travelPx;
    frameInput.safeBallColor = state.safeBallColor;
    frameInput.distractorColor = state.distractorColor;
    frameInput.rng = rng;
    frameInput.seed = seed;
    const frameSample = frameSampler.sample(frameInput);
    for (let index = 0; index < frameSample.count; index += 1) {
      drawTargetFrame(
        context,
        frameSample.frames[index],
        index,
        state.settings,
        frameSample.letterContext
      );
    }
    storeDirtyBounds(frameSample, state.settings);
    if (showTrail) {
      markTrailTiles();
    }
    lastFrameWasLilacChaser = false;
    lastFrameUsedTrail = showTrail;
  };

  const drawFrame = (options?: DrawFrameOptions) => {
    renderFrame(getState(), options?.clearTrail ?? false);
  };

  const syncCanvasBackground = () => {
    if (!canvas || !canvasTheme) {
      return;
    }
    applyCanvasBackground(canvas, arena, canvasTheme);
  };

  const resizeCanvas = (entries?: ResizeObserverEntry[]) => {
    if (!canvas || !context) {
      return;
    }

    const observedRect = entries?.[0]?.contentRect;
    const rect = observedRect ?? canvas.getBoundingClientRect();
    const layout = resolveCanvasLayout(
      rect.width,
      rect.height,
      window.devicePixelRatio
    );
    const nextArena = layout.arena;
    const arenaChanged =
      nextArena.width !== arena.width || nextArena.height !== arena.height;
    arena = nextArena;

    const backingStoreChanged =
      canvas.width !== layout.canvasWidth ||
      canvas.height !== layout.canvasHeight;
    if (canvas.width !== layout.canvasWidth) {
      canvas.width = layout.canvasWidth;
    }
    if (canvas.height !== layout.canvasHeight) {
      canvas.height = layout.canvasHeight;
    }
    if (backingStoreChanged || canvasScale !== layout.scale) {
      canvasScale = layout.scale;
      context.setTransform(layout.scale, 0, 0, layout.scale, 0, 0);
    }
    if (arenaChanged) {
      refreshBaseSpeed();
      rebuildTrailTiles();
      invalidateLilacChaserFrame();
    }
    syncCanvasBackground();
    drawFrame();
  };

  const stopLoop = () => {
    if (motionFrame !== 0) {
      cancelAnimationFrame(motionFrame);
    }
    motionFrame = 0;
    motionState.lastTimestamp = 0;
  };

  const shouldDrawTickFrame = (isLilacChaserMode: boolean) => {
    if (!isLilacChaserMode) {
      return true;
    }
    return (
      getLilacChaserHiddenIndex(motionState.elapsedSec) !==
      lastLilacChaserHiddenIndex
    );
  };

  const tick = (timestamp: number) => {
    const state = getState();
    if (!shouldAnimateMotion(state)) {
      stopLoop();
      return;
    }

    advanceMotionTick(
      motionState,
      timestamp,
      baseSpeedPxPerSec,
      state.settings.speedProfile,
      state.canToggleDirection,
      state.settings.motionDirection
    );
    if (shouldDrawTickFrame(state.isLilacChaserMode)) {
      renderFrame(state, false);
    }
    motionFrame = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (!shouldAnimateMotion(getState())) {
      return;
    }
    stopLoop();
    motionState.lastTimestamp = performance.now();
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
    if (!canvas) {
      return;
    }
    if (themeFrame !== 0) {
      cancelAnimationFrame(themeFrame);
    }

    themeFrame = requestAnimationFrame(() => {
      themeFrame = 0;
      if (!canvas) {
        return;
      }
      canvasTheme = getCanvasTheme(colorMode);
      syncCanvasBackground();
      drawFrame();
    });
  };

  const normalizeMotionDirection = (
    patternId: PatternId,
    motionDirection: TrainerSettings["motionDirection"]
  ) => {
    const directionState = resetUnsupportedMotionDirection(
      patternId,
      motionDirection,
      motionState.travelPx
    );
    motionState.travelPx = directionState.travelPx;
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
    if (expectedCanvas && canvas !== expectedCanvas) {
      return;
    }

    stopLoop();
    if (themeFrame !== 0) {
      cancelAnimationFrame(themeFrame);
    }
    themeFrame = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    canvas = null;
    context = null;
    canvasTheme = null;
    dirtyBounds.length = 0;
    arena = initialArena();
    canvasScale = 1;
  };

  const attachCanvas = (node: HTMLCanvasElement) => {
    detachCanvas();
    canvas = node;
    context = node.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) {
      return () => detachCanvas(node);
    }

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);
    canvasTheme = getCanvasTheme(getColorMode());
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

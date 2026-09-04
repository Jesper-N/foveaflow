import { speedToPixelsPerSecond } from "$lib/engine/calibration";
import { resolveCanvasLayout } from "$lib/engine/canvas";
import type { TrainerSettings } from "$lib/engine/presets";
import { createRng, createSessionSeed } from "$lib/engine/random";
import type { Arena, PatternId, TargetFrame } from "$lib/engine/types";
import { createTrainerFrameSampler } from "$lib/trainer/frame-sampler";
import type { TrainerFrameInput } from "$lib/trainer/frame-sampler";
import { advanceMotionTick } from "$lib/trainer/motion";
import type { MotionState } from "$lib/trainer/motion";
import {
  LILAC_CHASER_STEP_SEC,
  applyCanvasBackground,
  drawLilacChaserFrame,
  drawTargetFrames,
  getCanvasTheme,
  getFrameLetter,
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
  let motionTimeout = 0;
  let lastFrameTimestamp = -1;
  let frameRequested = false;
  let clearTrailRequested = false;
  let pendingColorMode: CanvasColorMode | null = null;
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
  let lastRenderedSettings: TrainerSettings | null = null;
  let lastRenderedTarget: TargetFrame | null = null;
  let lastRenderedLetter = "";
  const dirtyBounds: DirtyBounds[] = [];
  let trailTileColumns = 1;
  let trailTileRows = 1;
  let trailTileAges = new Uint8Array(1);
  let activeTrailTiles = new Uint32Array(1);
  let activeTrailTileCount = 0;
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
    activeTrailTileCount = 0;
    invalidateLilacChaserFrame();
  };

  const drawCurrentLilacChaserFrame = (
    ctx: CanvasRenderingContext2D,
    settings: TrainerSettings,
    forceRedraw: boolean
  ) => {
    const hiddenIndex = getLilacChaserHiddenIndex(motionState.elapsedSec);

    drawLilacChaserFrame(
      ctx,
      arena,
      settings.lilacChaserScale,
      settings.lilacChaserBallColor,
      hiddenIndex,
      forceRedraw || !lastFrameWasLilacChaser ? -1 : lastLilacChaserHiddenIndex,
      canvasScale
    );
    lastLilacChaserHiddenIndex = hiddenIndex;
    dirtyBounds.length = 0;
    lastFrameWasLilacChaser = true;
    lastFrameUsedTrail = false;
  };

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, arena.width, arena.height);
    trailTileAges.fill(0);
    activeTrailTileCount = 0;
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
    let activeIndex = 0;
    while (activeIndex < activeTrailTileCount) {
      const index = activeTrailTiles[activeIndex];
      const age = trailTileAges[index];
      const column = index % trailTileColumns;
      const row = Math.floor(index / trailTileColumns);
      const x = column * TRAIL_TILE_SIZE_PX;
      const y = row * TRAIL_TILE_SIZE_PX;
      const width = Math.min(TRAIL_TILE_SIZE_PX, arena.width - x);
      const height = Math.min(TRAIL_TILE_SIZE_PX, arena.height - y);
      if (age >= TRAIL_TILE_MAX_AGE) {
        ctx.clearRect(x, y, width, height);
        trailTileAges[index] = 0;
        activeTrailTileCount -= 1;
        activeTrailTiles[activeIndex] = activeTrailTiles[activeTrailTileCount];
        continue;
      }

      ctx.fillRect(x, y, width, height);
      trailTileAges[index] = age + 1;
      activeIndex += 1;
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
          const index = rowOffset + column;
          if (trailTileAges[index] === 0) {
            activeTrailTiles[activeTrailTileCount] = index;
            activeTrailTileCount += 1;
          }
          trailTileAges[index] = 1;
        }
      }
    }
  };

  const rebuildTrailTiles = () => {
    trailTileColumns = Math.max(1, Math.ceil(arena.width / TRAIL_TILE_SIZE_PX));
    trailTileRows = Math.max(1, Math.ceil(arena.height / TRAIL_TILE_SIZE_PX));
    trailTileAges = new Uint8Array(trailTileColumns * trailTileRows);
    activeTrailTiles = new Uint32Array(trailTileAges.length);
    activeTrailTileCount = 0;
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
      drawCurrentLilacChaserFrame(context, state.settings, frameRequested);
      return;
    }

    const showTrail = state.settings.showTrail && state.canToggleDirection;
    const mustClearCanvas =
      clearTrail || lastFrameWasLilacChaser || showTrail !== lastFrameUsedTrail;
    frameInput.settings = state.settings;
    frameInput.arena = arena;
    frameInput.elapsedSec = motionState.elapsedSec;
    frameInput.travelPx = motionState.travelPx;
    frameInput.safeBallColor = state.safeBallColor;
    frameInput.distractorColor = state.distractorColor;
    frameInput.rng = rng;
    frameInput.seed = seed;
    const frameSample = frameSampler.sample(frameInput);
    const [target] = frameSample.frames;
    const letter =
      state.settings.patternId === "teleport" && state.settings.letterEnabled
        ? getFrameLetter(state.settings, 0, frameSample.letterContext)
        : "";
    if (
      state.settings.patternId === "teleport" &&
      !frameRequested &&
      !mustClearCanvas &&
      !showTrail &&
      lastRenderedSettings === state.settings &&
      lastRenderedTarget?.x === target.x &&
      lastRenderedTarget.y === target.y &&
      lastRenderedTarget.radiusPx === target.radiusPx &&
      lastRenderedTarget.alpha === target.alpha &&
      lastRenderedLetter === letter
    ) {
      return;
    }

    if (mustClearCanvas) {
      clearCanvas(context);
    } else if (showTrail) {
      fadeTrail(context, canvasTheme.trailFadeAlpha);
    } else {
      clearDirtyBounds(context);
    }

    drawTargetFrames(
      context,
      frameSample.frames,
      frameSample.count,
      state.settings,
      frameSample.letterContext
    );
    storeDirtyBounds(frameSample, state.settings);
    if (showTrail) {
      markTrailTiles();
    }
    lastFrameWasLilacChaser = false;
    lastFrameUsedTrail = showTrail;
    lastRenderedSettings = state.settings;
    if (state.settings.patternId === "teleport") {
      if (lastRenderedTarget) {
        Object.assign(lastRenderedTarget, target);
      } else {
        lastRenderedTarget = { ...target };
      }
      lastRenderedLetter = letter;
    }
  };

  const syncCanvasBackground = () => {
    if (!canvas || !canvasTheme) {
      return;
    }
    applyCanvasBackground(canvas, arena, canvasTheme);
  };

  const stopLoop = () => {
    window.clearTimeout(motionTimeout);
    motionTimeout = 0;
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
    motionFrame = 0;
    const state = getState();
    if (document.hidden) {
      stopLoop();
      return;
    }
    if (timestamp === lastFrameTimestamp) {
      motionFrame = requestAnimationFrame(tick);
      return;
    }
    lastFrameTimestamp = timestamp;

    if (pendingColorMode !== null) {
      canvasTheme = getCanvasTheme(pendingColorMode);
      pendingColorMode = null;
      syncCanvasBackground();
    }

    if (!state.motionPaused && state.isLilacChaserMode) {
      // Discrete steps can sleep between updates; hidden time is reset by stopLoop.
      motionState.elapsedSec +=
        Math.max(0, timestamp - motionState.lastTimestamp) / 1000;
      motionState.lastTimestamp = timestamp;
    } else if (!state.motionPaused) {
      advanceMotionTick(
        motionState,
        timestamp,
        baseSpeedPxPerSec,
        state.settings.speedProfile,
        state.canToggleDirection,
        state.settings.motionDirection
      );
    }
    if (
      frameRequested ||
      (!state.motionPaused && shouldDrawTickFrame(state.isLilacChaserMode))
    ) {
      renderFrame(state, clearTrailRequested);
      frameRequested = false;
      clearTrailRequested = false;
    }
    if (!state.motionPaused && state.isLilacChaserMode) {
      const stepMs = LILAC_CHASER_STEP_SEC * 1000;
      const remainingMs = stepMs - ((motionState.elapsedSec * 1000) % stepMs);
      const delayMs = Math.max(
        0,
        remainingMs - (performance.now() - timestamp)
      );
      motionTimeout = window.setTimeout(() => {
        motionTimeout = 0;
        motionFrame = requestAnimationFrame(tick);
      }, delayMs);
    } else if (!state.motionPaused) {
      motionFrame = requestAnimationFrame(tick);
    }
  };

  // All invalidations share the display's animation frame, including while paused.
  const requestFrame = () => {
    window.clearTimeout(motionTimeout);
    motionTimeout = 0;
    if (canvas && context && motionFrame === 0 && !document.hidden) {
      if (motionState.lastTimestamp === 0 && !getState().motionPaused) {
        motionState.lastTimestamp = performance.now();
      }
      motionFrame = requestAnimationFrame(tick);
    }
  };

  const drawFrame = (options?: DrawFrameOptions) => {
    frameRequested = true;
    clearTrailRequested ||= options?.clearTrail ?? false;
    requestFrame();
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

    const backingStoreChanged =
      canvas.width !== layout.canvasWidth ||
      canvas.height !== layout.canvasHeight;
    if (!arenaChanged && !backingStoreChanged && canvasScale === layout.scale) {
      return;
    }
    arena = nextArena;
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
    drawFrame({ clearTrail: true });
  };

  const startLoop = () => {
    if (
      !shouldAnimateMotion(getState()) ||
      motionFrame !== 0 ||
      motionTimeout !== 0
    ) {
      return;
    }
    requestFrame();
  };

  const syncPlayback = () => {
    if (getState().motionPaused) {
      stopLoop();
      drawFrame();
      return;
    }
    motionState.lastTimestamp = performance.now();
    startLoop();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    drawFrame();
    startLoop();
  };

  const redrawForTheme = (colorMode: CanvasColorMode) => {
    pendingColorMode = colorMode;
    drawFrame({ clearTrail: true });
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
    frameRequested = false;
    clearTrailRequested = false;
    pendingColorMode = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
    canvas = null;
    context = null;
    canvasTheme = null;
    lastRenderedSettings = null;
    lastRenderedTarget = null;
    lastRenderedLetter = "";
    dirtyBounds.length = 0;
    arena = initialArena();
    canvasScale = 1;
  };

  const attachCanvas = (node: HTMLCanvasElement) => {
    detachCanvas();
    canvas = node;
    context = node.getContext("2d", { alpha: true });
    if (!context) {
      return () => detachCanvas(node);
    }

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);
    canvasTheme = getCanvasTheme(getColorMode());
    resizeCanvas();
    drawFrame();
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

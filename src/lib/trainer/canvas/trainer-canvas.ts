import { MotionClock } from "../engine/motion-clock";
import { createRng, createSessionSeed } from "../engine/random";
import { speedToPixelsPerSecond } from "../engine/speed";
import type { Arena, TargetFrame } from "../engine/types";
import { isReversible } from "../settings/patterns";
import type { TrainerSettings } from "../settings/settings";
import { FrameSampler } from "./frame-sampler";
import type { FrameSample } from "./frame-sampler";
import { resolveCanvasLayout } from "./layout";
import {
  LILAC_CHASER_STEP_SEC,
  drawLilacChaser,
  lilacChaserHiddenDot,
  stepLilacChaser,
} from "./lilac-chaser";
import { drawTargets, targetExtentPx } from "./targets";
import type { TargetPaint } from "./targets";
import { applyGridBackground, getCanvasTheme } from "./theme";
import type { CanvasTheme, ColorMode } from "./theme";
import { TrailTiles } from "./trail";
import type { Region } from "./trail";

/** Everything the canvas needs to draw a frame. Read once per frame. */
export interface CanvasScene {
  settings: TrainerSettings;
  paused: boolean;
  colorMode: ColorMode;
  targetColor: string;
  distractorColor: string;
}

/** Extra room around a target when erasing it, for antialiased edges. */
const ERASE_PADDING_PX = 3;

const placeholderArena = (): Arena => ({ height: 1, width: 1 });

/**
 * Runs the drill animation on a canvas.
 *
 * Moving drills draw on every animation frame and erase only the regions they
 * painted. Lilac Chaser changes in 100 ms steps, so it sleeps between steps
 * and repaints only the dots that changed. The loop stops while paused or
 * while the page is hidden.
 */
export class TrainerCanvas {
  readonly #getScene: () => CanvasScene;

  #canvas: HTMLCanvasElement | null = null;
  #context: CanvasRenderingContext2D | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #arena = placeholderArena();
  /** Device pixels per CSS pixel in the backing store. */
  #pixelScale = 1;
  #colorMode: ColorMode | null = null;
  #theme: CanvasTheme | null = null;
  #fontFamily = "";

  #animationFrame = 0;
  /** Lilac Chaser waits for its next step on a timer instead of every frame. */
  #stepTimeout = 0;
  #lastFrameTimestamp = -1;
  #drawRequested = false;
  #clearRequested = false;

  #rng = createRng(createSessionSeed());
  readonly #clock = new MotionClock();
  readonly #frameSampler = new FrameSampler();
  readonly #trail = new TrailTiles();
  /** Regions painted last frame, erased before the next one. */
  readonly #paintedRegions: Region[] = [];
  #lastFrameWasLilacChaser = false;
  #lastFrameUsedTrail = false;
  #lilacChaserHiddenDot = -1;

  readonly #paint: TargetPaint = {
    distractorColor: "",
    fontFamily: "",
    targetColor: "",
  };
  // Reaction Jumps holds still between jumps, so unchanged frames are skipped.
  #lastScene: CanvasScene | null = null;
  #lastTarget: TargetFrame | null = null;

  constructor(getScene: () => CanvasScene) {
    this.#getScene = getScene;
  }

  /** Starts drawing on `canvas`. Returns a function that stops it. */
  attach(canvas: HTMLCanvasElement) {
    this.#detach();
    this.#canvas = canvas;
    ({ fontFamily: this.#fontFamily } = getComputedStyle(canvas));
    this.#context = canvas.getContext("2d", { alpha: true });
    if (!this.#context) {
      return () => this.#detach(canvas);
    }

    this.#resizeObserver = new ResizeObserver(this.#resize);
    this.#resizeObserver.observe(canvas);
    this.#useColorMode(this.#getScene().colorMode);
    this.#resize();
    this.requestDraw();
    this.#startLoop();
    return () => this.#detach(canvas);
  }

  /** Draws the next frame even when paused. `clearTrail` wipes the trail first. */
  requestDraw({ clearTrail = false } = {}) {
    this.#drawRequested = true;
    this.#clearRequested ||= clearTrail;
    this.#requestFrame();
  }

  /** Starts or stops the loop to match the scene's paused state. */
  syncPlayback() {
    if (this.#getScene().paused) {
      this.#stopLoop();
      this.requestDraw();
      return;
    }
    this.#clock.start(performance.now());
    this.#startLoop();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.#stopLoop();
      return;
    }
    this.requestDraw();
    this.#startLoop();
  }

  /** Starts the drill over from a new random seed. */
  restart() {
    this.#rng = createRng(createSessionSeed());
    this.resetPattern();
    this.requestDraw({ clearTrail: true });
  }

  /** Starts the motion pattern over, for a new drill or path. */
  resetPattern() {
    this.#frameSampler.reset();
    this.#clock.reset();
    this.#lastFrameWasLilacChaser = false;
    this.#lastFrameUsedTrail = false;
    this.#trail.clear();
    this.#lilacChaserHiddenDot = -1;
  }

  #tick = (timestamp: number) => {
    this.#animationFrame = 0;
    if (document.hidden) {
      this.#stopLoop();
      return;
    }
    // Handle each display frame once, even if a callback is queued twice.
    if (timestamp === this.#lastFrameTimestamp) {
      this.#animationFrame = requestAnimationFrame(this.#tick);
      return;
    }
    this.#lastFrameTimestamp = timestamp;

    const scene = this.#getScene();
    const { settings, paused } = scene;
    if (scene.colorMode !== this.#colorMode) {
      // Repaint everything, trail included, in the new theme.
      this.#useColorMode(scene.colorMode);
      this.#drawRequested = true;
      this.#clearRequested = true;
    }
    const isLilacChaser = settings.drillId === "lilacChaser";
    if (!paused) {
      if (isLilacChaser) {
        this.#clock.advanceTime(timestamp);
      } else {
        this.#clock.advance(
          timestamp,
          speedToPixelsPerSecond(settings.speed),
          settings.speedProfile,
          isReversible(settings.patternId) ? settings.motionDirection : 1
        );
      }
    }

    // Lilac Chaser only needs a new frame when the hidden dot moves.
    const hasNewFrame =
      !isLilacChaser ||
      lilacChaserHiddenDot(this.#clock.elapsedSec) !==
        this.#lilacChaserHiddenDot;
    if (this.#drawRequested || (!paused && hasNewFrame)) {
      this.#render(scene, this.#drawRequested, this.#clearRequested);
      this.#drawRequested = false;
      this.#clearRequested = false;
    }

    if (paused) {
      return;
    }
    if (isLilacChaser) {
      this.#scheduleLilacChaserStep(timestamp);
    } else {
      this.#animationFrame = requestAnimationFrame(this.#tick);
    }
  };

  /** Sleeps until the next 100 ms step, then wakes on an animation frame. */
  #scheduleLilacChaserStep(timestamp: number) {
    const stepMs = LILAC_CHASER_STEP_SEC * 1000;
    const remainingMs = stepMs - ((this.#clock.elapsedSec * 1000) % stepMs);
    const delayMs = Math.max(0, remainingMs - (performance.now() - timestamp));
    this.#stepTimeout = window.setTimeout(() => {
      this.#stepTimeout = 0;
      this.#animationFrame = requestAnimationFrame(this.#tick);
    }, delayMs);
  }

  // Every draw, including paused redraws, waits for the display's next frame.
  #requestFrame() {
    window.clearTimeout(this.#stepTimeout);
    this.#stepTimeout = 0;
    if (!this.#context || this.#animationFrame !== 0 || document.hidden) {
      return;
    }
    if (this.#clock.isStopped && !this.#getScene().paused) {
      this.#clock.start(performance.now());
    }
    this.#animationFrame = requestAnimationFrame(this.#tick);
  }

  #startLoop() {
    const isRunning = this.#animationFrame !== 0 || this.#stepTimeout !== 0;
    if (isRunning || this.#getScene().paused || document.hidden) {
      return;
    }
    this.#requestFrame();
  }

  #stopLoop() {
    window.clearTimeout(this.#stepTimeout);
    this.#stepTimeout = 0;
    if (this.#animationFrame !== 0) {
      cancelAnimationFrame(this.#animationFrame);
    }
    this.#animationFrame = 0;
    this.#clock.stop();
  }

  #render(scene: CanvasScene, force: boolean, clearTrail: boolean) {
    const ctx = this.#context;
    const theme = this.#theme;
    if (!ctx || !theme) {
      return;
    }

    const { settings } = scene;
    if (settings.drillId === "lilacChaser") {
      this.#renderLilacChaser(ctx, settings, force);
      return;
    }

    const showTrail = settings.showTrail && isReversible(settings.patternId);
    const mustClear =
      clearTrail ||
      this.#lastFrameWasLilacChaser ||
      showTrail !== this.#lastFrameUsedTrail;
    const sample = this.#frameSampler.sample(
      settings,
      this.#arena,
      this.#clock.elapsedSec,
      this.#clock.travelPx,
      this.#rng
    );
    const isTeleport = settings.patternId === "teleport";
    const [target] = sample.frames;
    if (
      isTeleport &&
      !force &&
      !mustClear &&
      this.#isSameTeleportFrame(scene, target)
    ) {
      return;
    }

    if (mustClear) {
      this.#clear(ctx);
    } else if (showTrail) {
      this.#trail.fade(ctx, this.#arena, theme.trailFadeAlpha);
    } else {
      for (const region of this.#paintedRegions) {
        ctx.clearRect(region.x, region.y, region.width, region.height);
      }
    }

    const paint = this.#paint;
    paint.targetColor = scene.targetColor;
    paint.distractorColor = scene.distractorColor;
    paint.fontFamily = this.#fontFamily;
    drawTargets(ctx, sample, settings, paint);
    this.#recordPaintedRegions(sample, settings);
    if (showTrail) {
      this.#trail.mark(this.#paintedRegions);
    }
    this.#lastFrameWasLilacChaser = false;
    this.#lastFrameUsedTrail = showTrail;
    this.#lastScene = scene;
    if (isTeleport) {
      this.#rememberTeleportFrame(target);
    }
  }

  #renderLilacChaser(
    ctx: CanvasRenderingContext2D,
    settings: TrainerSettings,
    force: boolean
  ) {
    const hiddenDot = lilacChaserHiddenDot(this.#clock.elapsedSec);
    const previousHiddenDot = this.#lilacChaserHiddenDot;
    if (force || !this.#lastFrameWasLilacChaser || previousHiddenDot < 0) {
      drawLilacChaser(
        ctx,
        this.#arena,
        settings.lilacChaserScale,
        settings.lilacChaserBallColor,
        hiddenDot
      );
    } else if (previousHiddenDot !== hiddenDot) {
      stepLilacChaser(
        ctx,
        this.#arena,
        settings.lilacChaserScale,
        settings.lilacChaserBallColor,
        previousHiddenDot,
        hiddenDot,
        this.#pixelScale
      );
    }
    this.#lilacChaserHiddenDot = hiddenDot;
    this.#paintedRegions.length = 0;
    this.#lastFrameWasLilacChaser = true;
    this.#lastFrameUsedTrail = false;
  }

  #clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.#arena.width, this.#arena.height);
    this.#trail.clear();
  }

  /** Remembers where targets were painted, reusing the region objects. */
  #recordPaintedRegions(sample: FrameSample, settings: TrainerSettings) {
    const regions = this.#paintedRegions;
    let regionCount = 0;
    for (let index = 0; index < sample.count; index += 1) {
      const { x, y, radiusPx, alpha } = sample.frames[index];
      if (alpha * settings.targetOpacity <= 0) {
        continue;
      }

      const formExtent = targetExtentPx(radiusPx, settings.targetForm);
      const letterExtent = settings.letterEnabled
        ? radiusPx * settings.letterScale
        : 0;
      const extent = Math.max(formExtent, letterExtent) + ERASE_PADDING_PX;
      const left = Math.floor(x - extent);
      const top = Math.floor(y - extent);
      const width = Math.ceil(x + extent) - left;
      const height = Math.ceil(y + extent) - top;
      const region = regions[regionCount];
      if (region) {
        region.x = left;
        region.y = top;
        region.width = width;
        region.height = height;
      } else {
        regions[regionCount] = { height, width, x: left, y: top };
      }
      regionCount += 1;
    }
    regions.length = regionCount;
  }

  /** A new jump moves the target, so the same position means the same picture. */
  #isSameTeleportFrame(scene: CanvasScene, target: TargetFrame) {
    const last = this.#lastTarget;
    return (
      this.#lastScene === scene &&
      last?.x === target.x &&
      last.y === target.y &&
      last.radiusPx === target.radiusPx &&
      last.alpha === target.alpha
    );
  }

  #rememberTeleportFrame(target: TargetFrame) {
    if (this.#lastTarget) {
      Object.assign(this.#lastTarget, target);
    } else {
      this.#lastTarget = { ...target };
    }
  }

  #useColorMode(mode: ColorMode) {
    this.#colorMode = mode;
    this.#theme = getCanvasTheme(mode);
    this.#applyBackground();
  }

  #applyBackground() {
    if (this.#canvas && this.#theme) {
      applyGridBackground(this.#canvas, this.#arena, this.#theme);
    }
  }

  #resize = (entries?: ResizeObserverEntry[]) => {
    const canvas = this.#canvas;
    const ctx = this.#context;
    if (!canvas || !ctx) {
      return;
    }

    const rect = entries?.[0]?.contentRect ?? canvas.getBoundingClientRect();
    const layout = resolveCanvasLayout(
      rect.width,
      rect.height,
      window.devicePixelRatio
    );
    const arenaChanged =
      layout.arena.width !== this.#arena.width ||
      layout.arena.height !== this.#arena.height;
    const backingStoreChanged =
      canvas.width !== layout.canvasWidth ||
      canvas.height !== layout.canvasHeight;
    const scaleChanged = this.#pixelScale !== layout.scale;
    if (!arenaChanged && !backingStoreChanged && !scaleChanged) {
      return;
    }

    this.#arena = layout.arena;
    if (canvas.width !== layout.canvasWidth) {
      canvas.width = layout.canvasWidth;
    }
    if (canvas.height !== layout.canvasHeight) {
      canvas.height = layout.canvasHeight;
    }
    // Resizing the backing store also resets the context transform.
    if (backingStoreChanged || scaleChanged) {
      this.#pixelScale = layout.scale;
      ctx.setTransform(layout.scale, 0, 0, layout.scale, 0, 0);
    }
    if (arenaChanged) {
      this.#trail.resize(this.#arena);
      this.#lilacChaserHiddenDot = -1;
    }
    this.#applyBackground();
    this.requestDraw({ clearTrail: true });
  };

  #detach(expectedCanvas?: HTMLCanvasElement) {
    if (expectedCanvas && this.#canvas !== expectedCanvas) {
      return;
    }

    this.#stopLoop();
    this.#drawRequested = false;
    this.#clearRequested = false;
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#canvas = null;
    this.#context = null;
    this.#colorMode = null;
    this.#theme = null;
    this.#lastScene = null;
    this.#lastTarget = null;
    this.#paintedRegions.length = 0;
    this.#arena = placeholderArena();
    this.#pixelScale = 1;
  }
}

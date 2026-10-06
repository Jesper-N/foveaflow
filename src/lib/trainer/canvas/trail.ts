import type { Arena } from "../engine/types";

const TILE_SIZE_PX = 128;
/** Frames a tile keeps fading after its last paint, before it is cleared. */
const MAX_TILE_AGE = 20;

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Fades the motion trail only where targets recently painted. The arena is
 * split into tiles and only active tiles are faded each frame, which keeps
 * the trail cheap on large screens.
 */
export class TrailTiles {
  #columns = 1;
  #rows = 1;
  /** Frames since each tile was last painted, or 0 when inactive. */
  #ages = new Uint8Array(1);
  /** Indexes of active tiles, packed at the front. */
  #active = new Uint32Array(1);
  #activeCount = 0;

  resize(arena: Arena) {
    this.#columns = Math.max(1, Math.ceil(arena.width / TILE_SIZE_PX));
    this.#rows = Math.max(1, Math.ceil(arena.height / TILE_SIZE_PX));
    this.#ages = new Uint8Array(this.#columns * this.#rows);
    this.#active = new Uint32Array(this.#ages.length);
    this.#activeCount = 0;
  }

  clear() {
    this.#ages.fill(0);
    this.#activeCount = 0;
  }

  /** Marks the tiles under freshly painted regions as active. */
  mark(regions: readonly Region[]) {
    for (const region of regions) {
      const firstColumn = Math.max(0, Math.floor(region.x / TILE_SIZE_PX));
      const lastColumn = Math.min(
        this.#columns - 1,
        Math.floor((region.x + region.width - 1) / TILE_SIZE_PX)
      );
      const firstRow = Math.max(0, Math.floor(region.y / TILE_SIZE_PX));
      const lastRow = Math.min(
        this.#rows - 1,
        Math.floor((region.y + region.height - 1) / TILE_SIZE_PX)
      );

      for (let row = firstRow; row <= lastRow; row += 1) {
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          const index = row * this.#columns + column;
          if (this.#ages[index] === 0) {
            this.#active[this.#activeCount] = index;
            this.#activeCount += 1;
          }
          this.#ages[index] = 1;
        }
      }
    }
  }

  /** Fades every active tile, and clears tiles that have faded out. */
  fade(ctx: CanvasRenderingContext2D, arena: Arena, alpha: number) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = alpha;
    let activeIndex = 0;
    while (activeIndex < this.#activeCount) {
      const index = this.#active[activeIndex];
      const age = this.#ages[index];
      const x = (index % this.#columns) * TILE_SIZE_PX;
      const y = Math.floor(index / this.#columns) * TILE_SIZE_PX;
      const width = Math.min(TILE_SIZE_PX, arena.width - x);
      const height = Math.min(TILE_SIZE_PX, arena.height - y);
      if (age >= MAX_TILE_AGE) {
        ctx.clearRect(x, y, width, height);
        this.#ages[index] = 0;
        // Swap-remove: move the last active tile into this slot.
        this.#activeCount -= 1;
        this.#active[activeIndex] = this.#active[this.#activeCount];
        continue;
      }

      ctx.fillRect(x, y, width, height);
      this.#ages[index] = age + 1;
      activeIndex += 1;
    }
    ctx.restore();
  }
}

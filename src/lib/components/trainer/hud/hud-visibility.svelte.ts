import type { Attachment } from "svelte/attachments";

const AUTO_HIDE_DELAY_MS = 3500;
/** Keeps a cursor drifting past the top edge from popping the island open. */
const POINTER_REVEAL_DELAY_MS = 120;
/** A pointer this close to the top, above the island, reveals it. */
const REVEAL_ZONE_PX = 96;
/** A pointer lower than this hides the island. */
const HIDE_ZONE_PX = 160;

/**
 * Decides when the floating control island shows. It stays up while the
 * pointer or keyboard focus is in it or a menu from it is open, hides after
 * a short delay otherwise, and comes back when the pointer nears the top.
 */
export class HudVisibility {
  /** Instant reveal skips the animation when keyboard focus jumps into the island. */
  instantReveal = $state(false);
  /** False until the first auto-hide, so the island starts visible. */
  #autoHideReady = $state(false);
  #visible = $state(true);
  #interacting = $state(false);
  readonly #isOverlayOpen: () => boolean;

  #element: HTMLElement | null = null;
  #bounds: { left: number; right: number } | null = null;
  #pointerInside = false;
  #pointerDown = false;
  #focusInside = false;
  #lastPointerWasTouch = false;
  #autoHideTimeout: number | undefined;
  #revealTimeout: number | undefined;

  #isHeldOpen = $derived.by(() => this.#interacting || this.#isOverlayOpen());
  hidden = $derived(this.#autoHideReady && !this.#visible && !this.#isHeldOpen);

  /** `isOverlayOpen` reports menus and dialogs that keep the island up. */
  constructor(isOverlayOpen: () => boolean) {
    this.#isOverlayOpen = isOverlayOpen;
  }

  reveal() {
    this.#visible = true;
  }

  /** Shows the island, then hides it after a delay unless something holds it open. */
  showBriefly(durationMs = AUTO_HIDE_DELAY_MS) {
    this.#cancelAutoHide();
    this.#autoHideReady = false;
    this.#visible = true;
    this.#autoHideTimeout = window.setTimeout(() => {
      this.#autoHideReady = true;
      if (!this.#isHeldOpen) {
        this.#visible = false;
      }
    }, durationMs);
  }

  dispose() {
    this.#cancelAutoHide();
    this.#cancelPointerReveal();
  }

  /** Call when a menu opened from the island opens or closes. */
  handleMenuOpenChange = (open: boolean) => {
    if (open) {
      this.#cancelAutoHide();
      this.reveal();
      return;
    }
    if (this.#lastPointerWasTouch) {
      this.showBriefly();
      return;
    }
    // After a mouse choice the island hides next frame, unless the pointer is still on it.
    this.#autoHideReady = false;
    this.reveal();
    requestAnimationFrame(() => {
      this.#autoHideReady = true;
      this.#visible = false;
    });
  };

  handleWindowPointerDown = (event: PointerEvent) => {
    this.#lastPointerWasTouch = event.pointerType === "touch";
    // Tapping the drill hides the island so it stays out of the way.
    const tappedDrill =
      this.#lastPointerWasTouch && event.target instanceof HTMLCanvasElement;
    if (!tappedDrill || this.#isOverlayOpen()) {
      return;
    }
    this.#cancelAutoHide();
    this.#autoHideReady = true;
    this.#visible = false;
  };

  handleWindowPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && this.#autoHideReady) {
      this.#followPointer(event);
    }
    // Leaving the island's top edge skips pointerleave, so check here too.
    if (
      this.#pointerInside &&
      !(event.target instanceof Node && this.#element?.contains(event.target))
    ) {
      this.#pointerInside = this.#isOverIsland(event);
      this.#syncInteraction();
    }
  };

  handleWindowPointerEnd = (event: PointerEvent) => {
    this.#pointerDown = false;
    this.#pointerInside =
      event.type !== "pointercancel" && this.#isOverIsland(event);
    this.#syncInteraction();
  };

  /** Moves focus into the island when a keyboard user tabs onto its reveal button. */
  handleRevealFocus = (event: FocusEvent) => {
    const fromKeyboard =
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.matches(":focus-visible");
    this.instantReveal = fromKeyboard;
    this.reveal();
    if (!fromKeyboard) {
      return;
    }

    requestAnimationFrame(() => {
      const focusTarget = this.#element?.querySelector<HTMLElement>(
        "[data-hud-focus-target]"
      );
      if (!focusTarget) {
        this.instantReveal = false;
        return;
      }
      focusTarget.focus();
      this.#focusInside = true;
      this.#syncInteraction();
      requestAnimationFrame(() => {
        this.instantReveal = false;
      });
    });
  };

  handleRevealPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      this.showBriefly();
    } else {
      this.reveal();
    }
  };

  /** Tracks pointer and focus inside the island, and where the island sits. */
  attach: Attachment<HTMLElement> = (element) => {
    this.#element = element;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      this.#bounds = { left: rect.left, right: rect.right };
    };
    // The observer also measures once as soon as it starts.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);
    // The island is centered, so a window resize moves it without resizing it.
    window.addEventListener("resize", measure);

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        this.#pointerInside = true;
        this.#syncInteraction();
      }
    };
    const handlePointerLeave = (event: PointerEvent) => {
      this.#pointerInside = this.#isOverIsland(event);
      this.#syncInteraction();
    };
    const handlePointerDown = () => {
      this.#pointerDown = true;
      this.#syncInteraction();
    };
    const handleFocusIn = (event: FocusEvent) => {
      // Mouse clicks focus buttons too, but only keyboard focus holds the island.
      this.#focusInside =
        event.target instanceof HTMLElement &&
        event.target.matches(":focus-visible");
      this.#syncInteraction();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (
        event.relatedTarget instanceof Node &&
        element.contains(event.relatedTarget)
      ) {
        return;
      }
      this.#focusInside = false;
      this.#syncInteraction();
    };
    const handleKeyDown = () => {
      this.#focusInside = true;
      this.#syncInteraction();
    };

    element.addEventListener("pointerenter", handlePointerEnter);
    element.addEventListener("pointerleave", handlePointerLeave);
    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("focusin", handleFocusIn);
    element.addEventListener("focusout", handleFocusOut);
    element.addEventListener("keydown", handleKeyDown);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      element.removeEventListener("pointerenter", handlePointerEnter);
      element.removeEventListener("pointerleave", handlePointerLeave);
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("focusin", handleFocusIn);
      element.removeEventListener("focusout", handleFocusOut);
      element.removeEventListener("keydown", handleKeyDown);
      this.#element = null;
      this.#bounds = null;
      this.#setInteracting(false);
    };
  };

  #followPointer(event: PointerEvent) {
    const isAboveIsland =
      this.#bounds !== null &&
      event.clientX >= this.#bounds.left &&
      event.clientX <= this.#bounds.right;
    if (event.clientY <= REVEAL_ZONE_PX && isAboveIsland) {
      this.#revealAfterDelay();
      return;
    }

    this.#cancelPointerReveal();
    if (event.clientY > HIDE_ZONE_PX) {
      this.#hide();
    }
  }

  #revealAfterDelay() {
    if (this.#visible || this.#revealTimeout !== undefined) {
      return;
    }
    this.#revealTimeout = window.setTimeout(() => {
      this.#revealTimeout = undefined;
      this.reveal();
    }, POINTER_REVEAL_DELAY_MS);
  }

  #hide() {
    if (this.#autoHideReady && !this.#isHeldOpen) {
      this.#visible = false;
    }
  }

  /**
   * The thin strip between the island and the top edge counts as inside.
   * Hiding there would let the top-edge reveal reopen the island, so it
   * would flicker.
   */
  #isOverIsland(event: PointerEvent) {
    if (event.pointerType === "touch" || !this.#element || this.hidden) {
      return false;
    }
    const rect = this.#element.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY <= rect.bottom
    );
  }

  #syncInteraction() {
    this.#setInteracting(
      this.#pointerInside || this.#pointerDown || this.#focusInside
    );
  }

  #setInteracting(interacting: boolean) {
    if (this.#interacting === interacting) {
      return;
    }
    this.#interacting = interacting;
    if (interacting) {
      this.reveal();
    } else if (this.#autoHideReady) {
      this.#visible = false;
    }
  }

  #cancelAutoHide() {
    window.clearTimeout(this.#autoHideTimeout);
    this.#autoHideTimeout = undefined;
  }

  #cancelPointerReveal() {
    window.clearTimeout(this.#revealTimeout);
    this.#revealTimeout = undefined;
  }
}

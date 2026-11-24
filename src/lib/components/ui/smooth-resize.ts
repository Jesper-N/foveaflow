import type { Attachment } from "svelte/attachments";

const DURATION_MS = 360;
const EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

const sizeOf = (element: HTMLElement, axis: "height" | "width") =>
  axis === "height"
    ? element.getBoundingClientRect().height
    : element.getBoundingClientRect().width;

export const smoothResize =
  (axis: "height" | "width" = "height"): Attachment<HTMLElement> =>
  (outer) => {
    const inner = outer.firstElementChild;
    let previous: number | null = null;
    let animation: Animation | undefined;

    const observer = new ResizeObserver(() => {
      if (!(inner instanceof HTMLElement)) {
        return;
      }

      const next = sizeOf(inner, axis);

      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (previous !== null && Math.abs(previous - next) > 0.5 && !still) {
        const from = animation === undefined ? previous : sizeOf(outer, axis);

        animation?.cancel();
        animation = outer.animate(
          [{ [axis]: `${from}px` }, { [axis]: `${next}px` }],
          { duration: DURATION_MS, easing: EASING }
        );
        animation.addEventListener("finish", () => {
          animation = undefined;
        });
      }

      previous = next;
    });

    if (inner instanceof HTMLElement) {
      observer.observe(inner);
    }

    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  };

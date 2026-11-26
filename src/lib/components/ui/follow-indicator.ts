import type { Attachment } from "svelte/attachments";

interface FollowOptions {
  item: string;
  axis: "x" | "y";
  watch: string;
}

const directionFor = (axis: "x" | "y", forward: boolean) => {
  if (axis === "y") {
    return forward ? "down" : "up";
  }

  return forward ? "right" : "left";
};

export const followIndicator =
  ({ item, axis, watch }: FollowOptions): Attachment<HTMLElement> =>
  (container) => {
    const marker = container.querySelector<HTMLElement>("[data-indicator]");
    let previous: number | null = null;

    const place = () => {
      const target = container.querySelector<HTMLElement>(item);

      if (!marker) {
        return;
      }

      if (!target) {
        marker.style.setProperty("opacity", "0");
        previous = null;

        return;
      }

      const start = axis === "x" ? target.offsetLeft : target.offsetTop;

      if (previous === null) {
        marker.dataset["snap"] = "";
      } else {
        delete marker.dataset["snap"];
      }

      container.style.setProperty(
        "--trail",
        `${Math.round(Math.min(790, Math.max(420, 300 + Math.abs(start - (previous ?? start)) * 1.6)))}ms`
      );
      container.dataset["direction"] = directionFor(
        axis,
        start >= (previous ?? start)
      );
      marker.style.setProperty("left", `${target.offsetLeft}px`);
      marker.style.setProperty(
        "right",
        `${container.clientWidth - target.offsetLeft - target.offsetWidth}px`
      );
      marker.style.setProperty("top", `${target.offsetTop}px`);
      marker.style.setProperty(
        "bottom",
        `${container.clientHeight - target.offsetTop - target.offsetHeight}px`
      );
      marker.style.setProperty("opacity", "1");
      previous = start;
    };

    const observer = new MutationObserver(place);

    const resize = new ResizeObserver(() => {
      previous = null;
      place();
    });

    observer.observe(container, {
      attributeFilter: [watch],
      attributes: true,
      subtree: true,
    });
    resize.observe(container);
    place();

    return () => {
      observer.disconnect();
      resize.disconnect();
    };
  };

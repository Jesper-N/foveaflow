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
      const size = axis === "x" ? target.offsetWidth : target.offsetHeight;

      const span =
        axis === "x" ? container.clientWidth : container.clientHeight;

      if (previous === null) {
        marker.dataset["snap"] = "";
      } else {
        delete marker.dataset["snap"];
      }

      container.dataset["direction"] = directionFor(
        axis,
        start >= (previous ?? start)
      );
      marker.style.setProperty(axis === "x" ? "left" : "top", `${start}px`);
      marker.style.setProperty(
        axis === "x" ? "right" : "bottom",
        `${span - start - size}px`
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

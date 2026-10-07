// Shared timing for island parts that resize or fade when the drill changes.

/** Width and column changes. Add a `transition-[…]` utility for the property. */
export const islandLayoutMotion =
  "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/** Fades content in after its space opens and out before its space closes. Toggle with `data-visible`. */
export const islandPresenceMotion =
  "visible opacity-100 [transition:opacity_160ms_ease_90ms,visibility_0ms] data-[visible=false]:invisible data-[visible=false]:opacity-0 data-[visible=false]:[transition:opacity_90ms_ease,visibility_0ms_90ms] motion-reduce:transition-none";

<script lang="ts">
  import { getPatternPreviewPath } from "$lib/engine/pattern-preview";
  import type { PatternId } from "$lib/engine/types";

  let {
    patternId,
    compact = false,
  }: { patternId: PatternId; compact?: boolean } = $props();

  const pathData = $derived(getPatternPreviewPath(patternId));
</script>

<svg
  data-slot="pattern-path-preview"
  class={[
    "shrink-0",
    compact
      ? "size-4 text-current"
      : "size-preview h-7 w-11 rounded-lg border border-border/70 bg-background/80 text-accent",
  ]}
  viewBox="0 0 48 32"
  fill="none"
  aria-hidden="true"
>
  <path
    d={pathData}
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.95"
    vector-effect="non-scaling-stroke"
  />
</svg>

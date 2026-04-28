<script lang="ts">
  import { getPatternPreviewPath } from "$lib/engine/pattern-preview";
  import type { PatternId } from "$lib/engine/types";

  let { patternId }: { patternId: PatternId } = $props();

  const pathData = $derived(getPatternPreviewPath(patternId));
</script>

<svg
  data-slot="pattern-path-preview"
  class="size-preview h-7 w-11 shrink-0 rounded-lg border border-border/70 bg-background/80 text-accent"
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

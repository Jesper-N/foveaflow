<script lang="ts">
  import type { PatternId } from "$lib/engine/types";

  import MultipleDistractionsGlyph from "./multiple-distractions-glyph.svelte";
  import { pathPreviewVariants, previewPaths } from "./path-preview-data";
  import ReactionJumpGlyph from "./reaction-jump-glyph.svelte";

  let { patternId }: { patternId: PatternId } = $props();
  const path = $derived(previewPaths[patternId]);
</script>

<svg
  data-slot="pattern-path-preview"
  class={pathPreviewVariants()}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.65"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if path}
    <path
      d={path}
      stroke-width={patternId === "lissajous" || patternId === "stairStep"
        ? 1.3
        : undefined}
    />
  {/if}
  {#if patternId === "randomWalk"}
    <circle cx="21" cy="7" r="1.8" fill="currentColor" stroke="none" />
  {:else if patternId === "teleport"}
    <ReactionJumpGlyph />
  {:else if patternId === "multipleObjectTracking"}
    <MultipleDistractionsGlyph />
  {/if}
</svg>

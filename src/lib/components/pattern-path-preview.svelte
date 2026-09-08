<script lang="ts">
  import type { PatternId } from "$lib/engine/types";

  import {
    distractorDots,
    jumpDots,
    pathPreviewClass,
    previewPaths,
  } from "./path-preview-data";

  let { patternId }: { patternId: PatternId } = $props();
  const path = $derived(previewPaths[patternId]);
</script>

<svg
  data-slot="pattern-path-preview"
  class={pathPreviewClass}
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
    {#each jumpDots as dot (dot.x)}
      <circle
        cx={dot.x}
        cy={dot.y}
        r="2.3"
        fill="currentColor"
        stroke="none"
        opacity={dot.opacity}
      />
    {/each}
  {:else if patternId === "multipleObjectTracking"}
    <g
      class="text-muted-foreground"
      fill="currentColor"
      stroke="none"
      opacity="0.65"
    >
      {#each distractorDots as dot (dot.x)}
        <circle cx={dot.x} cy={dot.y} r="1.6" />
      {/each}
    </g>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
  {/if}
</svg>

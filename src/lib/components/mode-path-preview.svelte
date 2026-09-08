<script lang="ts" module>
  const lilacDots = Array.from({ length: 12 }, (_, index) => {
    const angle = -Math.PI / 2 + (index / 12) * Math.PI * 2;
    return {
      index,
      x: 12 + Math.cos(angle) * 8.5,
      y: 12 + Math.sin(angle) * 8.5,
    };
  });
</script>

<script lang="ts">
  import type { TrainingMode } from "$lib/engine/presets";

  import {
    distractorDots,
    jumpDots,
    pathPreviewClass,
    previewPaths,
  } from "./path-preview-data";

  let { mode }: { mode: TrainingMode } = $props();
</script>

<svg
  data-slot="mode-path-preview"
  class={pathPreviewClass}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.65"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if mode === "pursuit"}
    <path d={previewPaths.randomWalk} />
    <circle cx="21" cy="7" r="1.8" fill="currentColor" stroke="none" />
  {:else if mode === "reactionTime"}
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
  {:else if mode === "mot"}
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
  {:else}
    {#each lilacDots as dot (dot.index)}
      {#if dot.index !== 2}
        <circle
          cx={dot.x}
          cy={dot.y}
          r="1.25"
          fill="currentColor"
          stroke="none"
          opacity="0.75"
        />
      {/if}
    {/each}
    <path d="M9.5 12h5M12 9.5v5" />
  {/if}
</svg>

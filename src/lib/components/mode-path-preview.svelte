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

  import MultipleDistractionsGlyph from "./multiple-distractions-glyph.svelte";
  import { pathPreviewVariants } from "./path-preview-data";
  import ReactionJumpGlyph from "./reaction-jump-glyph.svelte";

  let {
    mode,
    class: className,
  }: {
    mode: TrainingMode;
    class?: string;
  } = $props();
</script>

<svg
  data-slot="mode-path-preview"
  class={pathPreviewVariants({ class: className })}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.65"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if mode === "pursuit"}
    <path
      d="M3.5 19a10 10 0 0 1 10-10"
      stroke-width="2.25"
      stroke-dasharray="0.1 4"
    />
    <circle cx="17.5" cy="9" r="3" fill="currentColor" stroke="none" />
  {:else if mode === "reactionTime"}
    <ReactionJumpGlyph />
  {:else if mode === "mot"}
    <MultipleDistractionsGlyph />
  {:else}
    {#each lilacDots as dot (dot.index)}
      {#if dot.index !== 2}
        <circle
          cx={dot.x}
          cy={dot.y}
          r="1.25"
          fill="currentColor"
          stroke="none"
        />
      {/if}
    {/each}
    <path d="M9.5 12h5M12 9.5v5" />
  {/if}
</svg>

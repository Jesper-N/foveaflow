<script lang="ts" module>
  // Twelve dots on a ring, starting at 12 o'clock.
  const lilacChaserDots = Array.from({ length: 12 }, (_, index) => {
    const angle = -Math.PI / 2 + (index / 12) * Math.PI * 2;
    return {
      index,
      x: 12 + Math.cos(angle) * 8.5,
      y: 12 + Math.sin(angle) * 8.5,
    };
  });
</script>

<script lang="ts">
  import type { DrillId } from "$lib/trainer/settings/drills";

  import IconFrame from "./icon-frame.svelte";
  import JumpGlyph from "./jump-glyph.svelte";
  import SwarmGlyph from "./swarm-glyph.svelte";

  let { drillId, class: className }: { drillId: DrillId; class?: string } =
    $props();
</script>

<IconFrame class={className}>
  {#if drillId === "pursuit"}
    <path
      d="M3.5 19a10 10 0 0 1 10-10"
      stroke-width="2.25"
      stroke-dasharray="0.1 4"
    />
    <circle cx="17.5" cy="9" r="3" fill="currentColor" stroke="none" />
  {:else if drillId === "reactionTime"}
    <JumpGlyph />
  {:else if drillId === "mot"}
    <SwarmGlyph />
  {:else}
    {#each lilacChaserDots as dot (dot.index)}
      <!-- One dot is missing, like the moving gap in the drill. -->
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
</IconFrame>

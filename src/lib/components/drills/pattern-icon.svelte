<script lang="ts">
  import type { PatternId } from "$lib/trainer/engine/types";

  import IconFrame from "./icon-frame.svelte";
  import JumpGlyph from "./jump-glyph.svelte";
  import { patternIconPaths } from "./pattern-icon-paths";
  import SwarmGlyph from "./swarm-glyph.svelte";

  let {
    patternId,
    class: className,
  }: { patternId: PatternId; class?: string } = $props();

  let path = $derived(patternIconPaths[patternId]);
  // Dense paths read better with a thinner line.
  let strokeWidth = $derived(
    patternId === "lissajous" || patternId === "stairStep" ? 1.3 : undefined
  );
</script>

<IconFrame class={className}>
  {#if path}
    <path d={path} stroke-width={strokeWidth} />
  {/if}
  {#if patternId === "randomWalk"}
    <circle cx="21" cy="7" r="1.8" fill="currentColor" stroke="none" />
  {:else if patternId === "teleport"}
    <JumpGlyph />
  {:else if patternId === "multipleObjectTracking"}
    <SwarmGlyph />
  {/if}
</IconFrame>

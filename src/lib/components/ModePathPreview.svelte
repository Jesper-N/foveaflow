<script lang="ts">
  import type { TrainingMode } from "$lib/engine/presets";

  let { mode, compact = false }: { mode: TrainingMode; compact?: boolean } =
    $props();
</script>

<svg
  data-slot="mode-path-preview"
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
  {#if mode === "pursuit"}
    <path
      d="M6 22 C13 7 24 25 32 12 C36 7 39 8 42 12"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
    <circle cx="32" cy="12" r="2.6" fill="currentColor" />
  {:else if mode === "reactionTime"}
    <circle cx="10.5" cy="23.5" r="3.6" fill="currentColor" />
    <circle cx="19.5" cy="11.5" r="3.6" fill="currentColor" />
    <circle cx="28.5" cy="20.5" r="3.6" fill="currentColor" />
    <circle cx="37.5" cy="14.5" r="3.6" fill="currentColor" />
  {:else if mode === "mot"}
    <circle cx="14" cy="10" r="2.5" fill="currentColor" opacity="0.42" />
    <circle cx="34" cy="11" r="2.4" fill="currentColor" opacity="0.42" />
    <circle cx="12" cy="23" r="2.4" fill="currentColor" opacity="0.42" />
    <circle cx="36" cy="23" r="2.5" fill="currentColor" opacity="0.42" />
    <circle cx="24" cy="17" r="4.2" fill="currentColor" />
    <circle
      cx="24"
      cy="17"
      r="6.2"
      stroke="currentColor"
      stroke-width="1.4"
      opacity="0.55"
      vector-effect="non-scaling-stroke"
    />
  {:else}
    {#each Array.from({ length: 12 }, (_, index) => index) as index (index)}
      {@const angle = -Math.PI / 2 + (index / 12) * Math.PI * 2}
      <circle
        cx={24 + Math.cos(angle) * 10}
        cy={16 + Math.sin(angle) * 10}
        r="1.6"
        fill="currentColor"
        opacity={index === 2 ? 0 : 0.65}
      />
    {/each}
    <path
      d="M21 16H27M24 13V19"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  {/if}
</svg>

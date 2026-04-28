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
    <path
      d="M10 22 L24 10 L38 20"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-dasharray="2.5 3"
      opacity="0.55"
      vector-effect="non-scaling-stroke"
    />
    <circle cx="10" cy="22" r="2.2" fill="currentColor" opacity="0.45" />
    <circle cx="24" cy="10" r="2.2" fill="currentColor" opacity="0.65" />
    <circle cx="38" cy="20" r="3" fill="currentColor" />
  {:else}
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
  {/if}
</svg>

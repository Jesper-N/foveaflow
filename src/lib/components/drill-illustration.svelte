<script lang="ts">
  import type { TrainingMode } from "$lib/engine/presets";

  let { mode, class: className = "" }: { mode: TrainingMode; class?: string } =
    $props();
  const ring = Array.from({ length: 12 }, (_, index) => ({
    x: 120 + 49 * Math.cos((index * Math.PI) / 6),
    y: 70 + 49 * Math.sin((index * Math.PI) / 6),
  }));
</script>

{#snippet target(x: number, y: number)}
  <circle
    cx={x}
    cy={y}
    r="7"
    fill="currentColor"
    stroke="currentColor"
    stroke-width=".75"
  />
  <circle cx={x} cy={y} r="13" stroke="currentColor" opacity=".25" />
{/snippet}

<svg
  data-slot="drill-illustration"
  viewBox="0 0 240 140"
  width="240"
  height="140"
  preserveAspectRatio="xMidYMid meet"
  fill="none"
  aria-hidden="true"
  class={`text-primary aspect-12/7 h-auto w-full shrink-0 ${className}`}
>
  <path
    d="M20 70H220M120 14V126"
    class="stroke-border"
    stroke-dasharray="2 5"
  />
  {#if mode === "pursuit"}
    <path
      d="M40 108C14 83 52 22 81 34S60 108 107 113S187 96 183 74S140 55 151 33S213 45 204 67"
      stroke="currentColor"
      stroke-width="2"
      opacity=".8"
    />
    <path
      d="M151 33C162 11 213 45 204 67"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
    {@render target(204, 67)}
  {:else if mode === "reactionTime"}
    <path
      d="m43 103 65-75 86 60"
      stroke="currentColor"
      stroke-width="1.5"
      opacity=".8"
      stroke-dasharray="3 6"
    />
    <circle cx="43" cy="103" r="6" stroke="currentColor" opacity=".5" />
    <circle cx="108" cy="28" r="6" stroke="currentColor" opacity=".7" />
    {@render target(194, 88)}
  {:else if mode === "mot"}
    <g fill="currentColor" opacity=".5">
      <circle cx="47" cy="40" r="7" /><circle cx="187" cy="32" r="7" /><circle
        cx="73"
        cy="105"
        r="7"
      /><circle cx="196" cy="109" r="7" /><circle cx="128" cy="31" r="7" />
    </g>
    <path
      d="M70 75C104 106 138 39 163 65"
      stroke="currentColor"
      stroke-width="1.5"
      opacity=".8"
      stroke-dasharray="3 5"
    />
    {@render target(163, 65)}
  {:else}
    {#each ring as point, index (index)}
      <circle
        cx={point.x}
        cy={point.y}
        r="6"
        fill="currentColor"
        opacity={index === 10 ? 0 : 1}
      />
    {/each}
    <path
      d="M115 70h10M120 65v10"
      class="stroke-foreground"
      stroke-width="1.5"
    />
  {/if}
</svg>

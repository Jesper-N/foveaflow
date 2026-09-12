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
  <circle cx={x} cy={y} r="7" class="fill-primary" />
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
  class={`text-foreground aspect-12/7 h-auto w-full shrink-0 ${className}`}
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
    <circle
      cx="52"
      cy="104"
      r="9"
      stroke="currentColor"
      stroke-width="2"
      opacity=".55"
    />
    <path
      d="m72 93 77-44"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="m139 46 10 3-3 10"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="183" cy="30" r="9" class="fill-primary" />
  {:else if mode === "mot"}
    <g stroke="currentColor" stroke-width="2">
      <circle cx="47" cy="40" r="8.5" /><circle
        cx="187"
        cy="32"
        r="8.5"
      /><circle cx="73" cy="105" r="8.5" /><circle
        cx="196"
        cy="109"
        r="8.5"
      /><circle cx="128" cy="31" r="8.5" />
    </g>
    <path
      d="M70 75C104 106 138 39 163 65"
      stroke="currentColor"
      stroke-width="1.5"
      opacity=".8"
      stroke-dasharray="3 5"
    />
    <circle cx="163" cy="65" r="9" class="fill-primary" />
  {:else}
    {#each ring as point, index (index)}
      <circle
        cx={point.x}
        cy={point.y}
        r="6"
        class="fill-primary"
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

<script lang="ts" module>
  // Lilac Chaser's ring of twelve dots.
  const ring = Array.from({ length: 12 }, (_, index) => ({
    index,
    x: 120 + 49 * Math.cos((index * Math.PI) / 6),
    y: 70 + 49 * Math.sin((index * Math.PI) / 6),
  }));
</script>

<script lang="ts">
  import type { DrillId } from "$lib/trainer/settings/drills";

  let { drillId, class: className }: { drillId: DrillId; class?: string } =
    $props();
</script>

<svg
  class={["aspect-12/7 h-auto w-full shrink-0", className]}
  aria-hidden="true"
  data-slot="drill-illustration"
  fill="none"
  height="140"
  preserveAspectRatio="xMidYMid meet"
  viewBox="0 0 240 140"
  width="240"
>
  <path
    d="M20 70H220M120 14V126"
    opacity=".2"
    stroke="currentColor"
    stroke-dasharray="2 5"
  />
  {#if drillId === "pursuit"}
    <path
      d="M40 108C14 83 52 22 81 34S60 108 107 113S187 96 183 74S140 55 151 33S213 45 204 67"
      opacity=".8"
      stroke="currentColor"
      stroke-width="2"
    />
    <path
      d="M151 33C162 11 213 45 204 67"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    />
    <circle cx="204" cy="67" fill="currentColor" r="7" />
    <circle cx="204" cy="67" opacity=".25" r="13" stroke="currentColor" />
  {:else if drillId === "reactionTime"}
    <circle
      cx="52"
      cy="104"
      opacity=".55"
      r="9"
      stroke="currentColor"
      stroke-width="2"
    />
    <path
      d="m72 93 77-44"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    />
    <path
      d="m139 46 10 3-3 10"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
    <circle cx="183" cy="30" fill="currentColor" r="9" />
  {:else if drillId === "mot"}
    <g stroke="currentColor" stroke-width="2">
      <circle cx="47" cy="40" r="8.5" />
      <circle cx="187" cy="32" r="8.5" />
      <circle cx="73" cy="105" r="8.5" />
      <circle cx="196" cy="109" r="8.5" />
      <circle cx="128" cy="31" r="8.5" />
    </g>
    <path
      d="M70 75C104 106 138 39 163 65"
      opacity=".8"
      stroke="currentColor"
      stroke-dasharray="3 5"
      stroke-width="1.5"
    />
    <circle cx="163" cy="65" fill="currentColor" r="9" />
  {:else}
    {#each ring as dot (dot.index)}
      <!-- One dot is missing, like the moving gap in the drill. -->
      {#if dot.index !== 10}
        <circle cx={dot.x} cy={dot.y} fill="currentColor" r="6" />
      {/if}
    {/each}
    <path d="M115 70h10M120 65v10" stroke="currentColor" stroke-width="1.5" />
  {/if}
</svg>

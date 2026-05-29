<script lang="ts">
  import { getPatternPreviewPath } from "$lib/engine/pattern-preview";
  import type { PatternId } from "$lib/engine/types";

  let {
    patternId,
    compact = false,
  }: { patternId: PatternId; compact?: boolean } = $props();

  const lissajousIconPath = Array.from({ length: 41 }, (_, index) => {
    const phase = (index / 40) * Math.PI * 2;
    const command = index === 0 ? "M" : "L";
    const x = 24 + Math.cos(phase * 3) * 16;
    const y = 16 + Math.sin(phase * 2) * 10;
    return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const cloverIconPath = Array.from({ length: 49 }, (_, index) => {
    const phase = (index / 48) * Math.PI * 2;
    const command = index === 0 ? "M" : "L";
    const petal = 0.56 + 0.36 * Math.cos(phase * 4);
    const x = 24 + Math.cos(phase) * 18 * petal;
    const y = 16 + Math.sin(phase) * 13 * petal;
    return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const stairStepIconPath = Array.from({ length: 20 }, (_, index) => {
    const row = index % 4;
    const column = Math.floor(index / 4);
    const command = index === 0 ? "M" : "L";
    const x = 7 + column * 8.5;
    const y = 5 + row * (22 / 3);
    return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const pathData = $derived(getPatternPreviewPath(patternId));
</script>

<svg
  data-slot="pattern-path-preview"
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
  {#if patternId === "randomWalk"}
    <path
      d="M6 22 C13 7 24 25 32 12 C36 7 39 8 42 12"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
    <circle cx="32" cy="12" r="2.6" fill="currentColor" />
  {:else if patternId === "circle"}
    <circle
      cx="24"
      cy="16"
      r="13"
      stroke="currentColor"
      stroke-width="2.6"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "ellipse"}
    <ellipse
      cx="24"
      cy="16"
      rx="18"
      ry="11"
      stroke="currentColor"
      stroke-width="2.4"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "figureEight"}
    <path
      d="M7 16 C7 5 19 5 24 16 C29 27 41 27 41 16 C41 5 29 5 24 16 C19 27 7 27 7 16"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "wave"}
    <path
      d="M6 16 C10 5 14 5 18 16 S26 27 30 16 S38 5 42 16"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "diagonal"}
    <path
      d="M8 23 L20 9 L31 22 L40 12"
      stroke="currentColor"
      stroke-width="2.3"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "bounce"}
    <path
      d="M7 23 C13 7 22 7 28 23 C32 29 39 25 41 13"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
    <circle cx="28" cy="23" r="2" fill="currentColor" />
  {:else if patternId === "zigZag"}
    <path
      d="M8 5 L40 10.5 L8 16 L40 21.5 L8 27"
      stroke="currentColor"
      stroke-width="2.1"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "lissajous"}
    <path
      d={lissajousIconPath}
      stroke="currentColor"
      stroke-width="1.15"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.96"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "perimeterLoop"}
    <rect
      x="7"
      y="4"
      width="34"
      height="24"
      rx="1.5"
      stroke="currentColor"
      stroke-width="2.4"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "diamondLoop"}
    <path
      d="M24 3 L42 16 L24 29 L6 16 Z"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "clover"}
    <path
      d={cloverIconPath}
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "stairStep"}
    <path
      d={stairStepIconPath}
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "hourglass"}
    <path
      d={pathData}
      stroke="currentColor"
      stroke-width="1.65"
      stroke-linecap="round"
      stroke-linejoin="round"
      transform="translate(24 16) scale(1.25 1.8) translate(-24 -16)"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "cornerTour"}
    <path
      d="M7 5 L38 9 L41 27 L10 23 Z"
      stroke="currentColor"
      stroke-width="2.3"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "directionChange"}
    <path
      d="M7 22 L15 13 L22 18 L30 8 L40 15"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
    <circle cx="15" cy="13" r="1.7" fill="currentColor" />
    <circle cx="30" cy="8" r="1.7" fill="currentColor" />
  {:else if patternId === "horizontalSweep"}
    <path
      d="M8 16 L40 16"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "verticalSweep"}
    <path
      d="M24 0 L24 32"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "downRightSweep"}
    <path
      d="M10 5 L38 27"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "downLeftSweep"}
    <path
      d="M38 5 L10 27"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  {:else}
    <path
      d={pathData}
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.95"
      vector-effect="non-scaling-stroke"
    />
  {/if}
</svg>

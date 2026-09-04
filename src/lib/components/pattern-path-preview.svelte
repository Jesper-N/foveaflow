<script lang="ts" module>
  import type { PatternId } from "$lib/engine/types";

  interface PatternIconPath {
    d: string;
    strokeWidth: number;
    opacity?: number;
    dasharray?: string;
  }

  const buildParametricPath = (
    pointCount: number,
    pointAt: (phase: number) => [number, number]
  ) =>
    Array.from({ length: pointCount }, (_, index) => {
      const phase = index / Math.max(1, pointCount - 1);
      const [x, y] = pointAt(phase);
      const command = index === 0 ? "M" : "L";
      return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

  const lissajousIconPath = buildParametricPath(41, (phase) => {
    const angle = phase * Math.PI * 2;
    return [24 + Math.cos(angle * 3) * 16, 16 + Math.sin(angle * 2) * 10];
  });

  const cloverIconPath = buildParametricPath(49, (phase) => {
    const angle = phase * Math.PI * 2;
    const petal = 0.56 + 0.36 * Math.cos(angle * 4);
    return [
      24 + Math.cos(angle) * 18 * petal,
      16 + Math.sin(angle) * 13 * petal,
    ];
  });

  const stairStepIconPath = buildParametricPath(20, (phase) => {
    const index = Math.round(phase * 19);
    const row = index % 4;
    const column = Math.floor(index / 4);
    return [7 + column * 8.5, 5 + row * (22 / 3)];
  });

  const hourglassIconPath = buildParametricPath(49, (phase) => {
    const angle = phase * Math.PI * 2;
    const vertical = Math.sin(angle);
    const pinch = 0.22 + 0.74 * Math.abs(vertical);
    return [24 + Math.sin(angle * 2) * 17 * pinch, 16 + vertical * 12];
  });

  const paths: Record<PatternId, PatternIconPath | null> = {
    bounce: { d: "M7 23 C13 7 22 7 28 23 C32 29 39 25 41 13", strokeWidth: 2 },
    circle: null,
    clover: { d: cloverIconPath, strokeWidth: 1.9 },
    cornerTour: { d: "M7 5 L38 9 L41 27 L10 23 Z", strokeWidth: 2.3 },
    diagonal: { d: "M8 23 L20 9 L31 22 L40 12", strokeWidth: 2.3 },
    diamondLoop: { d: "M24 3 L42 16 L24 29 L6 16 Z", strokeWidth: 2.4 },
    directionChange: {
      d: "M7 22 L15 13 L22 18 L30 8 L40 15",
      strokeWidth: 2.2,
    },
    downLeftSweep: { d: "M38 5 L10 27", strokeWidth: 2.4 },
    downRightSweep: { d: "M10 5 L38 27", strokeWidth: 2.4 },
    ellipse: null,
    figureEight: {
      d: "M7 16 C7 5 19 5 24 16 C29 27 41 27 41 16 C41 5 29 5 24 16 C19 27 7 27 7 16",
      strokeWidth: 2.2,
    },
    horizontalSweep: { d: "M8 16 L40 16", strokeWidth: 2.4 },
    hourglass: { d: hourglassIconPath, strokeWidth: 1.8 },
    lissajous: { d: lissajousIconPath, opacity: 0.96, strokeWidth: 1.15 },
    multipleObjectTracking: null,
    perimeterLoop: null,
    randomWalk: {
      d: "M6 22 C13 7 24 25 32 12 C36 7 39 8 42 12",
      strokeWidth: 2,
    },
    stairStep: { d: stairStepIconPath, strokeWidth: 1.75 },
    teleport: {
      d: "M9 23 L20 9 L30 21 L40 11",
      dasharray: "2.5 3",
      opacity: 0.55,
      strokeWidth: 1.8,
    },
    verticalSweep: { d: "M24 0 L24 32", strokeWidth: 2.4 },
    wave: {
      d: "M6 16 C10 5 14 5 18 16 S26 27 30 16 S38 5 42 16",
      strokeWidth: 2.2,
    },
    zigZag: { d: "M8 5 L40 10.5 L8 16 L40 21.5 L8 27", strokeWidth: 2.1 },
  };
</script>

<script lang="ts">
  let { patternId }: { patternId: PatternId } = $props();
  const path = $derived(paths[patternId]);
</script>

<svg
  data-slot="pattern-path-preview"
  class="size-4 shrink-0 text-current"
  viewBox="0 0 48 32"
  fill="none"
  aria-hidden="true"
>
  {#if path}
    <path
      d={path.d}
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={path.strokeWidth}
      stroke-dasharray={path.dasharray}
      opacity={path.opacity}
      vector-effect="non-scaling-stroke"
    />
  {/if}
  {#if patternId === "bounce"}
    <circle cx="28" cy="23" fill="currentColor" r="2" />
  {:else if patternId === "circle"}
    <circle
      cx="24"
      cy="16"
      fill="none"
      r="13"
      stroke="currentColor"
      stroke-width="2.6"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "directionChange"}
    <circle cx="15" cy="13" fill="currentColor" r="1.7" />
    <circle cx="30" cy="8" fill="currentColor" r="1.7" />
  {:else if patternId === "ellipse"}
    <ellipse
      cx="24"
      cy="16"
      fill="none"
      rx="18"
      ry="11"
      stroke="currentColor"
      stroke-width="2.4"
      vector-effect="non-scaling-stroke"
    />
  {:else if patternId === "multipleObjectTracking"}
    <circle cx="14" cy="10" fill="currentColor" r="2.5" opacity="0.42" />
    <circle cx="34" cy="11" fill="currentColor" r="2.4" opacity="0.42" />
    <circle cx="12" cy="23" fill="currentColor" r="2.4" opacity="0.42" />
    <circle cx="36" cy="23" fill="currentColor" r="2.5" opacity="0.42" />
    <circle cx="24" cy="17" fill="currentColor" r="4.2" />
  {:else if patternId === "perimeterLoop"}
    <rect
      fill="none"
      height="24"
      rx="1.5"
      stroke="currentColor"
      stroke-width="2.4"
      vector-effect="non-scaling-stroke"
      width="34"
      x="7"
      y="4"
    />
  {:else if patternId === "randomWalk"}
    <circle cx="32" cy="12" fill="currentColor" r="2.6" />
  {:else if patternId === "teleport"}
    <circle cx="9" cy="23" fill="currentColor" r="2.5" />
    <circle cx="20" cy="9" fill="currentColor" r="2.5" />
    <circle cx="30" cy="21" fill="currentColor" r="2.5" />
    <circle cx="40" cy="11" fill="currentColor" r="2.5" />
  {/if}
</svg>

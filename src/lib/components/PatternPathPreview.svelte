<script lang="ts" module>
  import type { PatternId } from "$lib/engine/types";

  type SvgAttributeValue = string | number;

  type IconNode = {
    id: string;
    tag: "circle" | "ellipse" | "path" | "rect";
    attrs: Record<string, SvgAttributeValue>;
  };

  const buildParametricPath = (
    pointCount: number,
    pointAt: (phase: number) => [number, number],
  ) =>
    Array.from({ length: pointCount }, (_, index) => {
      const phase = index / Math.max(1, pointCount - 1);
      const [x, y] = pointAt(phase);
      const command = index === 0 ? "M" : "L";
      return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

  const pathNode = (
    id: string,
    d: string,
    attrs: Record<string, SvgAttributeValue> = {},
  ): IconNode => ({
    id,
    tag: "path",
    attrs: {
      d,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "vector-effect": "non-scaling-stroke",
      ...attrs,
    },
  });

  const circleNode = (
    id: string,
    cx: number,
    cy: number,
    r: number,
    attrs: Record<string, SvgAttributeValue> = {},
  ): IconNode => ({
    id,
    tag: "circle",
    attrs: {
      cx,
      cy,
      r,
      fill: "currentColor",
      ...attrs,
    },
  });

  const strokedCircleNode = (
    id: string,
    cx: number,
    cy: number,
    r: number,
    strokeWidth: number,
  ): IconNode => ({
    id,
    tag: "circle",
    attrs: {
      cx,
      cy,
      r,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "vector-effect": "non-scaling-stroke",
    },
  });

  const strokedEllipseNode = (
    id: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    strokeWidth: number,
  ): IconNode => ({
    id,
    tag: "ellipse",
    attrs: {
      cx,
      cy,
      rx,
      ry,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "vector-effect": "non-scaling-stroke",
    },
  });

  const strokedRectNode = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    strokeWidth: number,
  ): IconNode => ({
    id,
    tag: "rect",
    attrs: {
      x,
      y,
      width,
      height,
      rx,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "vector-effect": "non-scaling-stroke",
    },
  });

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

  const staticPatternIconNodes: Partial<Record<PatternId, IconNode[]>> = {
    randomWalk: [
      pathNode("trail", "M6 22 C13 7 24 25 32 12 C36 7 39 8 42 12", {
        "stroke-width": 2,
      }),
      circleNode("dot", 32, 12, 2.6),
    ],
    circle: [strokedCircleNode("circle", 24, 16, 13, 2.6)],
    ellipse: [strokedEllipseNode("ellipse", 24, 16, 18, 11, 2.4)],
    figureEight: [
      pathNode(
        "loop",
        "M7 16 C7 5 19 5 24 16 C29 27 41 27 41 16 C41 5 29 5 24 16 C19 27 7 27 7 16",
        { "stroke-width": 2.2 },
      ),
    ],
    wave: [
      pathNode("wave", "M6 16 C10 5 14 5 18 16 S26 27 30 16 S38 5 42 16", {
        "stroke-width": 2.2,
      }),
    ],
    diagonal: [
      pathNode("diagonal", "M8 23 L20 9 L31 22 L40 12", {
        "stroke-width": 2.3,
      }),
    ],
    bounce: [
      pathNode("bounce", "M7 23 C13 7 22 7 28 23 C32 29 39 25 41 13", {
        "stroke-width": 2,
      }),
      circleNode("impact", 28, 23, 2),
    ],
    zigZag: [
      pathNode("zigzag", "M8 5 L40 10.5 L8 16 L40 21.5 L8 27", {
        "stroke-width": 2.1,
      }),
    ],
    lissajous: [
      pathNode("lissajous", lissajousIconPath, {
        opacity: 0.96,
        "stroke-width": 1.15,
      }),
    ],
    perimeterLoop: [strokedRectNode("perimeter", 7, 4, 34, 24, 1.5, 2.4)],
    diamondLoop: [
      pathNode("diamond", "M24 3 L42 16 L24 29 L6 16 Z", {
        "stroke-width": 2.4,
      }),
    ],
    clover: [
      pathNode("clover", cloverIconPath, {
        "stroke-width": 1.9,
      }),
    ],
    stairStep: [
      pathNode("stair-step", stairStepIconPath, {
        "stroke-width": 1.75,
      }),
    ],
    cornerTour: [
      pathNode("corner-tour", "M7 5 L38 9 L41 27 L10 23 Z", {
        "stroke-width": 2.3,
      }),
    ],
    directionChange: [
      pathNode("turns", "M7 22 L15 13 L22 18 L30 8 L40 15", {
        "stroke-width": 2.2,
      }),
      circleNode("turn-a", 15, 13, 1.7),
      circleNode("turn-b", 30, 8, 1.7),
    ],
    horizontalSweep: [
      pathNode("horizontal", "M8 16 L40 16", {
        "stroke-width": 2.4,
      }),
    ],
    verticalSweep: [
      pathNode("vertical", "M24 0 L24 32", {
        "stroke-width": 2.4,
      }),
    ],
    downRightSweep: [
      pathNode("down-right", "M10 5 L38 27", {
        "stroke-width": 2.4,
      }),
    ],
    downLeftSweep: [
      pathNode("down-left", "M38 5 L10 27", {
        "stroke-width": 2.4,
      }),
    ],
  };

  const dynamicPatternIconNodes: Partial<
    Record<PatternId, (pathData: string) => IconNode[]>
  > = {
    hourglass: (pathData: string) => [
      pathNode("hourglass", pathData, {
        transform: "translate(24 16) scale(1.25 1.8) translate(-24 -16)",
        "stroke-width": 1.65,
      }),
    ],
  };

  const fallbackIconNodes = (pathData: string) => [
    pathNode("generated", pathData, { opacity: 0.95 }),
  ];

  const getPatternIconNodes = (patternId: PatternId, pathData: string) =>
    dynamicPatternIconNodes[patternId]?.(pathData) ??
    staticPatternIconNodes[patternId] ??
    fallbackIconNodes(pathData);
</script>

<script lang="ts">
  import { getPatternPreviewPath } from "$lib/engine/pattern-preview";
  import type { PatternId } from "$lib/engine/types";

  let {
    patternId,
    compact = false,
  }: { patternId: PatternId; compact?: boolean } = $props();

  const pathData = $derived(getPatternPreviewPath(patternId));
  const iconNodes = $derived(getPatternIconNodes(patternId, pathData));
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
  {#each iconNodes as node (node.id)}
    <svelte:element this={node.tag} {...node.attrs} />
  {/each}
</svg>

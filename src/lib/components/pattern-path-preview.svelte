<script lang="ts" module>
  import type { PatternId } from "$lib/engine/types";

  type SvgAttributeValue = string | number;

  interface IconNode {
    id: string;
    tag: "circle" | "ellipse" | "path" | "rect";
    attrs: Record<string, SvgAttributeValue>;
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

  const pathNode = (
    id: string,
    d: string,
    attrs: Record<string, SvgAttributeValue> = {}
  ): IconNode => ({
    attrs: {
      d,
      fill: "none",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 1.8,
      "vector-effect": "non-scaling-stroke",
      ...attrs,
    },
    id,
    tag: "path",
  });

  const circleNode = (
    id: string,
    cx: number,
    cy: number,
    r: number,
    attrs: Record<string, SvgAttributeValue> = {}
  ): IconNode => ({
    attrs: {
      cx,
      cy,
      fill: "currentColor",
      r,
      ...attrs,
    },
    id,
    tag: "circle",
  });

  const strokedCircleNode = (
    id: string,
    cx: number,
    cy: number,
    r: number,
    strokeWidth: number
  ): IconNode => ({
    attrs: {
      cx,
      cy,
      fill: "none",
      r,
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "vector-effect": "non-scaling-stroke",
    },
    id,
    tag: "circle",
  });

  const strokedEllipseNode = (
    id: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    strokeWidth: number
  ): IconNode => ({
    attrs: {
      cx,
      cy,
      fill: "none",
      rx,
      ry,
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "vector-effect": "non-scaling-stroke",
    },
    id,
    tag: "ellipse",
  });

  const strokedRectNode = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    strokeWidth: number
  ): IconNode => ({
    attrs: {
      fill: "none",
      height,
      rx,
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "vector-effect": "non-scaling-stroke",
      width,
      x,
      y,
    },
    id,
    tag: "rect",
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

  const hourglassIconPath = buildParametricPath(49, (phase) => {
    const angle = phase * Math.PI * 2;
    const vertical = Math.sin(angle);
    const pinch = 0.22 + 0.74 * Math.abs(vertical);
    return [24 + Math.sin(angle * 2) * 17 * pinch, 16 + vertical * 12];
  });

  const patternIconNodes = {
    bounce: [
      pathNode("bounce", "M7 23 C13 7 22 7 28 23 C32 29 39 25 41 13", {
        "stroke-width": 2,
      }),
      circleNode("impact", 28, 23, 2),
    ],
    circle: [strokedCircleNode("circle", 24, 16, 13, 2.6)],
    clover: [
      pathNode("clover", cloverIconPath, {
        "stroke-width": 1.9,
      }),
    ],
    cornerTour: [
      pathNode("corner-tour", "M7 5 L38 9 L41 27 L10 23 Z", {
        "stroke-width": 2.3,
      }),
    ],
    diagonal: [
      pathNode("diagonal", "M8 23 L20 9 L31 22 L40 12", {
        "stroke-width": 2.3,
      }),
    ],
    diamondLoop: [
      pathNode("diamond", "M24 3 L42 16 L24 29 L6 16 Z", {
        "stroke-width": 2.4,
      }),
    ],
    directionChange: [
      pathNode("turns", "M7 22 L15 13 L22 18 L30 8 L40 15", {
        "stroke-width": 2.2,
      }),
      circleNode("turn-a", 15, 13, 1.7),
      circleNode("turn-b", 30, 8, 1.7),
    ],
    downLeftSweep: [
      pathNode("down-left", "M38 5 L10 27", {
        "stroke-width": 2.4,
      }),
    ],
    downRightSweep: [
      pathNode("down-right", "M10 5 L38 27", {
        "stroke-width": 2.4,
      }),
    ],
    ellipse: [strokedEllipseNode("ellipse", 24, 16, 18, 11, 2.4)],
    figureEight: [
      pathNode(
        "loop",
        "M7 16 C7 5 19 5 24 16 C29 27 41 27 41 16 C41 5 29 5 24 16 C19 27 7 27 7 16",
        { "stroke-width": 2.2 }
      ),
    ],
    horizontalSweep: [
      pathNode("horizontal", "M8 16 L40 16", {
        "stroke-width": 2.4,
      }),
    ],
    hourglass: [
      pathNode("hourglass", hourglassIconPath, {
        "stroke-width": 1.8,
      }),
    ],
    lissajous: [
      pathNode("lissajous", lissajousIconPath, {
        opacity: 0.96,
        "stroke-width": 1.15,
      }),
    ],
    multipleObjectTracking: [
      circleNode("mot-a", 14, 10, 2.5, { opacity: 0.42 }),
      circleNode("mot-b", 34, 11, 2.4, { opacity: 0.42 }),
      circleNode("mot-c", 12, 23, 2.4, { opacity: 0.42 }),
      circleNode("mot-d", 36, 23, 2.5, { opacity: 0.42 }),
      circleNode("mot-target", 24, 17, 4.2),
    ],
    perimeterLoop: [strokedRectNode("perimeter", 7, 4, 34, 24, 1.5, 2.4)],
    randomWalk: [
      pathNode("trail", "M6 22 C13 7 24 25 32 12 C36 7 39 8 42 12", {
        "stroke-width": 2,
      }),
      circleNode("dot", 32, 12, 2.6),
    ],
    stairStep: [
      pathNode("stair-step", stairStepIconPath, {
        "stroke-width": 1.75,
      }),
    ],
    teleport: [
      pathNode("jump", "M9 23 L20 9 L30 21 L40 11", {
        opacity: 0.55,
        "stroke-dasharray": "2.5 3",
      }),
      circleNode("jump-a", 9, 23, 2.5),
      circleNode("jump-b", 20, 9, 2.5),
      circleNode("jump-c", 30, 21, 2.5),
      circleNode("jump-d", 40, 11, 2.5),
    ],
    verticalSweep: [
      pathNode("vertical", "M24 0 L24 32", {
        "stroke-width": 2.4,
      }),
    ],
    wave: [
      pathNode("wave", "M6 16 C10 5 14 5 18 16 S26 27 30 16 S38 5 42 16", {
        "stroke-width": 2.2,
      }),
    ],
    zigZag: [
      pathNode("zigzag", "M8 5 L40 10.5 L8 16 L40 21.5 L8 27", {
        "stroke-width": 2.1,
      }),
    ],
  } satisfies Record<PatternId, IconNode[]>;
</script>

<script lang="ts">
  import type { PatternId } from "$lib/engine/types";

  let { patternId }: { patternId: PatternId } = $props();

  const iconNodes = $derived(patternIconNodes[patternId]);
</script>

<svg
  data-slot="pattern-path-preview"
  class="size-4 shrink-0 text-current"
  viewBox="0 0 48 32"
  fill="none"
  aria-hidden="true"
>
  {#each iconNodes as node (node.id)}
    <svelte:element this={node.tag} {...node.attrs} />
  {/each}
</svg>

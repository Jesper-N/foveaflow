<script lang="ts">
  import { patternGlyphs } from "$lib/trainer/glyphs/pattern-glyphs";
  import type { DrillId } from "$lib/trainer/settings/drills";
  import { isPursuitPattern } from "$lib/trainer/settings/patterns";
  import type { Attachment } from "svelte/attachments";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    drillId: DrillId;
    patternId?: string;
    playing?: boolean;
    class?: ClassValue;
  }

  let { drillId, patternId, playing, class: className }: Props = $props();

  let pursuitRoute = $derived(
    patternId !== undefined && isPursuitPattern(patternId)
      ? patternGlyphs[patternId]
      : patternGlyphs.figureEight
  );

  const pursuitTrail = [1, 2, 3, 4, 5];

  const jumps = [
    { x: 8, y: 7 },
    { x: 24, y: 16 },
    { x: 10, y: 17.5 },
    { x: 23.5, y: 7 },
  ];

  const swarm = [
    patternGlyphs.clover,
    patternGlyphs.lissajous,
    patternGlyphs.ellipse,
    patternGlyphs.wave,
    patternGlyphs.diamondLoop,
    patternGlyphs.hourglass,
  ];

  const lilacDots = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;

    return {
      cx: Math.round((16 + Math.cos(angle) * 7.5) * 100) / 100,
      cy: Math.round((12 + Math.sin(angle) * 7.5) * 100) / 100,
      index,
    };
  });

  const route =
    (path: string): Attachment<SVGElement> =>
    (node) => {
      node.style.setProperty("offset-path", `path("${path}")`);
    };

  const playWhenVisible: Attachment<SVGSVGElement> = (node) => {
    const observer =
      playing === undefined
        ? new IntersectionObserver(([entry]) => {
            node.toggleAttribute(
              "data-playing",
              entry?.isIntersecting === true
            );
          })
        : null;

    if (observer) {
      observer.observe(node);
    } else {
      node.toggleAttribute("data-playing", playing === true);
    }

    return () => {
      observer?.disconnect();
    };
  };
</script>

<svg
  class={[
    "preview text-foreground",
    drillId === "lilacChaser" ? "bg-lilac-stage" : "canvas-grid",
    className,
  ]}
  {@attach playWhenVisible}
  aria-hidden="true"
  fill="none"
  viewBox="0 0 32 24"
>
  {#if drillId === "pursuit"}
    <path
      d={pursuitRoute}
      stroke="currentColor"
      stroke-linecap="round"
      stroke-opacity="0.12"
      stroke-width="0.35"
    />
    {#each pursuitTrail as step (step)}
      <circle
        class="trail fill-target"
        {@attach route(pursuitRoute)}
        r={1.5 - step * 0.18}
      />
    {/each}
    <circle
      class="mover halo fill-target"
      {@attach route(pursuitRoute)}
      r="2.8"
    />
    <circle class="mover fill-target" {@attach route(pursuitRoute)} r="1.5" />
  {:else if drillId === "reactionTime"}
    {#each jumps as jump (jump.x)}
      <g class="jump">
        <circle
          class="ripple stroke-target"
          cx={jump.x}
          cy={jump.y}
          r="1.6"
          stroke-width="0.3"
        />
        <circle class="fill-target" cx={jump.x} cy={jump.y} r="1.6" />
      </g>
    {/each}
  {:else if drillId === "mot"}
    {#each swarm as path (path)}
      <circle class="drifter distractor" {@attach route(path)} r="1.35" />
    {/each}
    <g class="drifter lead">
      <circle
        class="fill-target"
        {@attach route(patternGlyphs.figureEight)}
        r="1.5"
      />
      <circle
        class="stroke-target"
        {@attach route(patternGlyphs.figureEight)}
        r="2.7"
        stroke-opacity="0.55"
        stroke-width="0.25"
      />
    </g>
  {:else}
    <filter id="lilac-soften" height="2" width="2" x="-0.5" y="-0.5">
      <feGaussianBlur stdDeviation="0.45" />
    </filter>
    <g filter="url(#lilac-soften)">
      {#each lilacDots as dot (dot.index)}
        <circle class="lilac" cx={dot.cx} cy={dot.cy} fill="#ff00fe" r="1.25" />
      {/each}
    </g>
    <path
      d="M16 11v2M15 12h2"
      stroke="#050505"
      stroke-linecap="round"
      stroke-width="0.35"
    />
  {/if}
</svg>

<style>
  .preview * {
    animation-play-state: paused;
  }

  .preview:global([data-playing]) * {
    animation-play-state: running;
  }

  .mover,
  .trail,
  .drifter circle,
  .distractor {
    offset-rotate: 0deg;
    offset-distance: 62%;
  }

  .halo {
    opacity: 0.2;
  }

  .trail {
    opacity: 0;
  }

  .distractor {
    fill: color-mix(in srgb, var(--target) 42%, var(--canvas));
  }

  .jump {
    opacity: 0.16;
  }

  .jump:last-child {
    opacity: 1;
  }

  .ripple {
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }

  @media (prefers-reduced-motion: no-preference) {
    .mover,
    .trail {
      animation: travel 5s linear infinite;
    }

    .trail {
      opacity: 0.3;
    }

    .trail:nth-child(2) {
      animation-delay: -0.08s;
      opacity: 0.3;
    }

    .trail:nth-child(3) {
      animation-delay: -0.16s;
      opacity: 0.22;
    }

    .trail:nth-child(4) {
      animation-delay: -0.24s;
      opacity: 0.15;
    }

    .trail:nth-child(5) {
      animation-delay: -0.32s;
      opacity: 0.1;
    }

    .trail:nth-child(6) {
      animation-delay: -0.4s;
      opacity: 0.06;
    }

    .mover {
      animation-delay: 0s;
    }

    .jump {
      animation: jump 3.2s steps(1, end) infinite;
    }

    .jump:nth-child(1) {
      animation-delay: 0s;
    }

    .jump:nth-child(2) {
      animation-delay: -2.4s;
    }

    .jump:nth-child(3) {
      animation-delay: -1.6s;
    }

    .jump:nth-child(4) {
      animation-delay: -0.8s;
    }

    .jump .ripple {
      animation: ripple 3.2s var(--ease-out) infinite;
      animation-delay: inherit;
    }

    .distractor,
    .lead circle {
      animation: travel 9s linear infinite;
    }

    .distractor:nth-child(1) {
      animation-duration: 11s;
      animation-delay: -2s;
    }

    .distractor:nth-child(2) {
      animation-duration: 13s;
      animation-delay: -7s;
    }

    .distractor:nth-child(3) {
      animation-duration: 8s;
      animation-delay: -5s;
      animation-direction: reverse;
    }

    .distractor:nth-child(4) {
      animation-duration: 7s;
      animation-delay: -1s;
    }

    .distractor:nth-child(5) {
      animation-duration: 10s;
      animation-delay: -4s;
      animation-direction: reverse;
    }

    .distractor:nth-child(6) {
      animation-duration: 12s;
      animation-delay: -9s;
    }

    .lilac {
      animation: lilac 1.2s steps(1, end) infinite;
    }

    .lilac:nth-child(2) {
      animation-delay: -1.1s;
    }

    .lilac:nth-child(3) {
      animation-delay: -1s;
    }

    .lilac:nth-child(4) {
      animation-delay: -0.9s;
    }

    .lilac:nth-child(5) {
      animation-delay: -0.8s;
    }

    .lilac:nth-child(6) {
      animation-delay: -0.7s;
    }

    .lilac:nth-child(7) {
      animation-delay: -0.6s;
    }

    .lilac:nth-child(8) {
      animation-delay: -0.5s;
    }

    .lilac:nth-child(9) {
      animation-delay: -0.4s;
    }

    .lilac:nth-child(10) {
      animation-delay: -0.3s;
    }

    .lilac:nth-child(11) {
      animation-delay: -0.2s;
    }

    .lilac:nth-child(12) {
      animation-delay: -0.1s;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lilac:first-child {
      opacity: 0;
    }
  }

  @keyframes travel {
    from {
      offset-distance: 0%;
    }

    to {
      offset-distance: 100%;
    }
  }

  @keyframes jump {
    0% {
      opacity: 1;
    }

    25% {
      opacity: 0.16;
    }
  }

  @keyframes ripple {
    0% {
      opacity: 0.7;
      scale: 1;
    }

    22% {
      opacity: 0;
      scale: 2.6;
    }

    100% {
      opacity: 0;
      scale: 2.6;
    }
  }

  @keyframes lilac {
    0% {
      opacity: 0;
    }

    8.33% {
      opacity: 1;
    }
  }
</style>

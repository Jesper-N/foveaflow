<script lang="ts">
  import type { DrillId } from "$lib/trainer/settings/drills";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    drillId: DrillId;
    class?: ClassValue;
  }

  let { drillId, class: className }: Props = $props();

  const pursuitPath = "M18 76C38 18 66 16 84 48S124 86 142 26";

  const jumps = [
    { x: 34, y: 70 },
    { x: 82, y: 28 },
    { x: 128, y: 66 },
  ];

  const distractors = [
    { x: 36, y: 30 },
    { x: 120, y: 24 },
    { x: 50, y: 74 },
    { x: 112, y: 76 },
    { x: 140, y: 50 },
    { x: 22, y: 52 },
  ];

  const lilacDots = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;

    return {
      index,
      x: 80 + Math.cos(angle) * 32,
      y: 50 + Math.sin(angle) * 32,
    };
  });
</script>

<svg
  class={["canvas-grid text-foreground", className]}
  aria-hidden="true"
  fill="none"
  viewBox="0 0 160 100"
>
  <defs>
    <filter id="lilac-blur" height="2" width="2" x="-0.5" y="-0.5">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
  </defs>

  {#if drillId === "pursuit"}
    <path
      d={pursuitPath}
      stroke="currentColor"
      stroke-dasharray="1 5"
      stroke-linecap="round"
      stroke-opacity="0.3"
      stroke-width="2"
    />
    <circle class="pursuit-target fill-target" r="7" />
  {:else if drillId === "reactionTime"}
    <path
      d="M40 64Q54 30 75 30M90 32Q114 34 122 60"
      stroke="currentColor"
      stroke-dasharray="1 5"
      stroke-linecap="round"
      stroke-opacity="0.3"
      stroke-width="2"
    />
    {#each jumps as jump (jump.x)}
      <circle class="jump fill-target" cx={jump.x} cy={jump.y} r="7" />
    {/each}
  {:else if drillId === "mot"}
    {#each distractors as dot (`${dot.x}-${dot.y}`)}
      <circle
        class="drift fill-target"
        cx={dot.x}
        cy={dot.y}
        fill-opacity="0.38"
        r="6"
      />
    {/each}
    <circle class="drift fill-target" cx="80" cy="50" r="7" />
  {:else}
    <g filter="url(#lilac-blur)">
      {#each lilacDots as dot (dot.index)}
        <circle
          class="lilac"
          cx={dot.x}
          cy={dot.y}
          fill="#ff00fe"
          fill-opacity="0.75"
          r="5.5"
        />
      {/each}
    </g>
    <path
      d="M80 45v10M75 50h10"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    />
  {/if}
</svg>

<style>
  .pursuit-target {
    offset-path: path("M18 76C38 18 66 16 84 48S124 86 142 26");
    offset-distance: 72%;
    offset-rotate: 0deg;
  }

  .jump {
    opacity: 0.16;
  }

  .jump:last-of-type,
  .lilac {
    opacity: 1;
  }

  .lilac:first-of-type {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    :global(.group\/drill:is(:hover, :focus-visible)) {
      .pursuit-target {
        animation: pursue 3.2s cubic-bezier(0.65, 0, 0.2, 1) infinite alternate;
      }

      .jump {
        animation: jump 1.8s steps(1, end) infinite;
      }

      .jump:nth-of-type(2) {
        animation-delay: 0.6s;
      }

      .jump:nth-of-type(3) {
        animation-delay: 1.2s;
      }

      .drift {
        animation: drift 3.6s ease-in-out infinite alternate;
      }

      .drift:nth-of-type(2n) {
        animation-duration: 4.2s;
        animation-direction: alternate-reverse;
      }

      .lilac {
        animation: lilac 1.2s steps(1, end) infinite;
      }

      .lilac:nth-of-type(1) {
        animation-delay: 0s;
      }

      .lilac:nth-of-type(2) {
        animation-delay: 0.1s;
      }

      .lilac:nth-of-type(3) {
        animation-delay: 0.2s;
      }

      .lilac:nth-of-type(4) {
        animation-delay: 0.3s;
      }

      .lilac:nth-of-type(5) {
        animation-delay: 0.4s;
      }

      .lilac:nth-of-type(6) {
        animation-delay: 0.5s;
      }

      .lilac:nth-of-type(7) {
        animation-delay: 0.6s;
      }

      .lilac:nth-of-type(8) {
        animation-delay: 0.7s;
      }

      .lilac:nth-of-type(9) {
        animation-delay: 0.8s;
      }

      .lilac:nth-of-type(10) {
        animation-delay: 0.9s;
      }

      .lilac:nth-of-type(11) {
        animation-delay: 1s;
      }

      .lilac:nth-of-type(12) {
        animation-delay: 1.1s;
      }
    }
  }

  @keyframes pursue {
    from {
      offset-distance: 0%;
    }
    to {
      offset-distance: 100%;
    }
  }

  @keyframes jump {
    0%,
    33.33% {
      opacity: 1;
    }
    33.34%,
    100% {
      opacity: 0.16;
    }
  }

  @keyframes drift {
    from {
      translate: -4px 3px;
    }
    to {
      translate: 5px -4px;
    }
  }

  @keyframes lilac {
    0%,
    8.33% {
      opacity: 0;
    }
    8.34%,
    100% {
      opacity: 1;
    }
  }
</style>

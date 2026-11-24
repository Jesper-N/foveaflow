<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  let { class: className }: { class?: ClassValue } = $props();
</script>

<svg
  class={["fovea-grid text-foreground", className]}
  aria-hidden="true"
  fill="none"
  viewBox="0 0 160 100"
>
  <path
    d="M14 74C34 26 58 22 74 46S106 74 122 50"
    stroke="currentColor"
    stroke-dasharray="0.5 5"
    stroke-linecap="round"
    stroke-opacity="0.3"
    stroke-width="2"
  />
  <g class="missing">
    <circle
      cx="138"
      cy="36"
      r="9"
      stroke="currentColor"
      stroke-dasharray="2.5 3.5"
      stroke-opacity="0.35"
      stroke-width="2"
    />
    <path
      d="m134.5 32.5 7 7m0-7-7 7"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-opacity="0.45"
      stroke-width="2"
    />
  </g>
  <circle class="runner halo fill-target" r="11" />
  <circle class="runner fill-target" r="6" />
</svg>

<style>
  .runner {
    offset-path: path("M14 74C34 26 58 22 74 46S106 74 122 50");
    offset-rotate: 0deg;
    offset-distance: 100%;
  }

  .halo {
    opacity: 0.18;
  }

  .missing {
    transform-box: fill-box;
    transform-origin: center;
  }

  @media (prefers-reduced-motion: no-preference) {
    .runner {
      animation: run 2.4s var(--ease-in-out) 0.3s both;
    }

    .missing {
      animation: search 1.6s var(--ease-out) 2.5s both;
    }
  }

  @keyframes run {
    from {
      offset-distance: 0%;
    }
  }

  @keyframes search {
    0% {
      opacity: 0.4;
      scale: 0.9;
    }

    40% {
      opacity: 1;
      scale: 1.08;
    }

    100% {
      opacity: 1;
      scale: 1;
    }
  }
</style>

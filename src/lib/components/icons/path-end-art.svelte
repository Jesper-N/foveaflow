<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  let { class: className }: { class?: ClassValue } = $props();
</script>

<svg
  class={["canvas-grid text-foreground", className]}
  aria-hidden="true"
  fill="none"
  viewBox="0 0 160 100"
>
  <path
    class="trail"
    d="M16 72C34 30 58 26 74 48S104 70 118 50"
    pathLength="1"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-opacity="0.3"
    stroke-width="2"
  />
  <circle class="fill-target" cx="16" cy="72" r="4" />
  <circle
    cx="130"
    cy="38"
    r="8"
    stroke="currentColor"
    stroke-dasharray="2 3.5"
    stroke-opacity="0.4"
    stroke-width="2"
  />
  <path
    d="m127 35 6 6m0-6-6 6"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-opacity="0.4"
    stroke-width="1.5"
  />
</svg>

<style>
  .trail {
    stroke-dasharray: 0.012 0.03;
  }
</style>

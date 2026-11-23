<script lang="ts">
  import type { Snippet } from "svelte";

  let { class: className, children }: { class?: string; children: Snippet } =
    $props();
</script>

<!-- The shared 24×24 line-icon box for drill and pattern icons. -->
<svg
  class={["size-5 shrink-0", className]}
  aria-hidden="true"
  fill="none"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="1.65"
  viewBox="0 0 24 24"
>
  {@render children()}
</svg>

<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let { class: className, children }: { class?: string; children: Snippet } =
    $props();
</script>

<!-- The shared 24×24 line-icon box for drill and pattern icons. -->
<svg
  class={cn(
    "text-foreground in-data-highlighted:text-accent-foreground size-5 shrink-0",
    className
  )}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.65"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {@render children()}
</svg>

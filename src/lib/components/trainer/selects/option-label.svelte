<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    label,
    class: className,
    children,
  }: {
    label: string;
    class?: string;
    /** The icon shown before the label. */
    children: Snippet;
  } = $props();
</script>

<span class={cn("flex min-w-0 items-center gap-2", className)}>
  {@render children()}
  <span class="truncate">{label}</span>
</span>

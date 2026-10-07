<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    label,
    children,
  }: {
    label: string;
    /** The icon shown before the label. */
    children: Snippet;
  } = $props();
</script>

<span class="flex min-w-0 items-center gap-2">
  {@render children()}
  <span class="truncate">{label}</span>
</span>

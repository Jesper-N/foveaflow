<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    caption,
    value,
    children,
  }: {
    caption: string;
    value: string;
    /** Icon shown before the value on wider screens. */
    children: Snippet;
  } = $props();
</script>

<span class="flex w-full min-w-0 flex-col items-start gap-1">
  <span class="text-muted-foreground max-w-full truncate pr-5">
    {caption}
  </span>
  <span class="flex w-full min-w-0 items-center gap-2">
    <span class="hidden sm:inline-flex">{@render children()}</span>
    <span
      class="min-w-0 text-left wrap-anywhere whitespace-normal md:truncate md:whitespace-nowrap"
    >
      {value}
    </span>
  </span>
</span>

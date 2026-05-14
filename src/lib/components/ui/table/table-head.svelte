<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ThHTMLAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<ThHTMLAttributes, HTMLTableCellElement> & {
    children?: Snippet;
  } = $props();
</script>

<th
  bind:this={ref}
  data-slot="table-head"
  class={cn(
    "text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</th>

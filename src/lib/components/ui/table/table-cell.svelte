<script lang="ts">
  import type { Snippet } from "svelte";
  import type { TdHTMLAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<TdHTMLAttributes, HTMLTableCellElement> & {
    children?: Snippet;
  } = $props();
</script>

<td
  bind:this={ref}
  data-slot="table-cell"
  class={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
  {...restProps}
>
  {@render children?.()}
</td>

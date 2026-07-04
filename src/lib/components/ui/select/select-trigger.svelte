<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { cn, type WithoutChild } from "$lib/utils.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

  type SelectTriggerVariant = "default" | "outline";
  type SelectTriggerSize = "sm" | "default" | "icon";

  let {
    ref = $bindable(null),
    class: className,
    children,
    variant = "default",
    size = "default",
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & {
    variant?: SelectTriggerVariant;
    size?: SelectTriggerSize;
  } = $props();
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-slot="select-trigger"
  data-variant={variant}
  data-size={size}
  class={cn(
    "data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-3xl border px-3 py-2 text-sm transition-[color,box-shadow,background-color] focus-visible:ring-3 aria-invalid:ring-3 data-[size=default]:h-9 data-[size=sm]:h-8 data-[size=icon]:size-9 data-[size=icon]:justify-center data-[size=icon]:rounded-4xl data-[size=icon]:p-0 data-[size=icon]:[&>svg:last-child]:hidden *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
    variant === "default" && "border-transparent bg-input/50",
    variant === "outline" &&
      "border-border bg-background hover:bg-muted hover:text-foreground dark:hover:bg-input/30 aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
  <ChevronDownIcon class="text-muted-foreground size-4 pointer-events-none" />
</SelectPrimitive.Trigger>

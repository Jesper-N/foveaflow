<script lang="ts" module>
  export type Side = "top" | "right" | "bottom" | "left";
</script>

<script lang="ts">
  import { Dialog as SheetPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import SheetPortal from "./sheet-portal.svelte";
  import SheetOverlay from "./sheet-overlay.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import XIcon from "@lucide/svelte/icons/x";
  import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    side = "right",
    showCloseButton = true,
    portalProps,
    children,
    ...restProps
  }: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPortal>>;
    side?: Side;
    showCloseButton?: boolean;
    children: Snippet;
  } = $props();
</script>

<SheetPortal {...portalProps}>
  <SheetOverlay />
  <SheetPrimitive.Content
    bind:ref
    data-slot="sheet-content"
    data-side={side}
    class={cn(
      "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col bg-clip-padding text-sm shadow-xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom data-[side=bottom]:data-[state=open]:slide-in-from-bottom data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:data-[state=closed]:slide-out-to-start data-[side=left]:data-[state=open]:slide-in-from-start data-[side=left]:inset-y-0 data-[side=left]:start-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-e data-[side=left]:sm:max-w-sm data-[side=right]:data-[state=closed]:slide-out-to-end data-[side=right]:data-[state=open]:slide-in-from-end data-[side=right]:inset-y-0 data-[side=right]:end-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-s data-[side=right]:sm:max-w-sm data-[side=top]:data-[state=closed]:slide-out-to-top data-[side=top]:data-[state=open]:slide-in-from-top data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b rtl:data-[side=left]:data-[state=closed]:slide-out-to-end rtl:data-[side=left]:data-[state=open]:slide-in-from-end rtl:data-[side=right]:data-[state=closed]:slide-out-to-start rtl:data-[side=right]:data-[state=open]:slide-in-from-start",
      className,
    )}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <SheetPrimitive.Close data-slot="sheet-close">
        {#snippet child({ props })}
          <Button
            variant="ghost"
            class="bg-secondary absolute top-4 right-4"
            size="icon-sm"
            {...props}
          >
            <XIcon />
            <span class="sr-only">Close</span>
          </Button>
        {/snippet}
      </SheetPrimitive.Close>
    {/if}
  </SheetPrimitive.Content>
</SheetPortal>

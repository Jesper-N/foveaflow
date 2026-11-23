<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import type { Tooltip as TooltipPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";

  import { getTrainer } from "../trainer-context";

  interface Props extends Omit<TooltipPrimitive.TriggerProps, "children"> {
    /** Accessible name. Also the tooltip, unless `tooltip` is set. */
    label: string;
    tooltip?: string;
    variant?: "default" | "ghost";
    children: Snippet;
  }

  let {
    label,
    tooltip = label,
    variant = "ghost",
    disabled = false,
    children,
    ...rest
  }: Props = $props();

  const { hud } = getTrainer();
</script>

<Tooltip.Root disabled={hud.hidden || disabled === true}>
  <Tooltip.Trigger
    {...rest}
    class={cn(buttonVariants({ size: "icon", variant }), "size-11")}
    aria-label={label}
    data-slot="button"
    {disabled}
  >
    {@render children()}
  </Tooltip.Trigger>
  <Tooltip.Content class="dark" side="bottom" sideOffset={6}>
    {tooltip}
  </Tooltip.Content>
</Tooltip.Root>

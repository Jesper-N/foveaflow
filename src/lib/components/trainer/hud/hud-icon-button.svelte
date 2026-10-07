<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { getTrainer } from "../trainer-context";

  interface Props extends HTMLButtonAttributes {
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

<Tooltip.Root disabled={hud.hidden || disabled}>
  <Tooltip.Trigger
    {...rest}
    data-slot="button"
    class={cn(buttonVariants({ size: "icon", variant }), "size-11")}
    aria-label={label}
    {disabled}
  >
    {@render children()}
  </Tooltip.Trigger>
  <Tooltip.Content
    side="bottom"
    sideOffset={6}
    class="dark supports-[text-box:trim-both]:py-2"
  >
    <span class="text-trim">{tooltip}</span>
  </Tooltip.Content>
</Tooltip.Root>

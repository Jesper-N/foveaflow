<script lang="ts">
  import {
    Tooltip,
    TooltipContent,
    TooltipShortcut,
    TooltipTrigger,
  } from "@ui-sdk/svelte/tooltip";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import type { ButtonVariant } from "./button-variants";
  import Button from "./button.svelte";

  interface Props {
    label: string;
    shortcut?: string;
    variant?: ButtonVariant;
    side?: "top" | "bottom" | "left" | "right";
    onclick?: () => void;
    class?: ClassValue;
    children: Snippet;
    [attribute: `aria-${string}`]: string | undefined;
  }

  let {
    label,
    shortcut,
    variant = "ghost",
    side = "top",
    onclick,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<Tooltip delay={420} {shortcut} type="label">
  <TooltipTrigger>
    {#snippet render({ props })}
      <Button
        {...props}
        {...rest}
        class={className}
        {onclick}
        size="icon"
        {variant}
      >
        {@render children()}
      </Button>
    {/snippet}
  </TooltipTrigger>
  <TooltipContent
    class="bg-primary text-2xs text-primary-foreground flex items-center gap-2 rounded-sm px-2.25 py-1.25 font-medium tracking-wide transition-[opacity,translate] duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:-translate-y-1 data-[side=top]:data-starting-style:translate-y-1"
    {side}
    sideOffset={8}
  >
    {label}
    {#if shortcut}
      <TooltipShortcut
        class="bg-primary-foreground/16 text-2xs -me-1 inline-flex h-4 min-w-4 items-center justify-center rounded-xs px-1 font-medium uppercase"
      />
    {/if}
  </TooltipContent>
</Tooltip>

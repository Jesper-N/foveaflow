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
    grouped?: boolean;
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
    grouped = false,
    onclick,
    class: className,
    children,
    ...rest
  }: Props = $props();

  let keyName = $derived(
    shortcut === undefined
      ? undefined
      : shortcut.charAt(0).toUpperCase() + shortcut.slice(1)
  );
</script>

{#if grouped}
  <Button
    {...rest}
    class={className}
    aria-keyshortcuts={keyName}
    aria-label={label}
    data-tip={label}
    data-tip-key={keyName}
    {onclick}
    size="icon"
    {variant}
  >
    {@render children()}
  </Button>
{:else}
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
      class="bg-primary text-2xs text-primary-foreground flex origin-(--transform-origin) items-center gap-2 rounded-sm px-2.25 py-1.25 font-medium tracking-wide transition-[opacity,scale] duration-160 ease-out data-ending-style:opacity-0 data-ending-style:duration-100 data-instant:transition-none data-starting-style:scale-94 data-starting-style:opacity-0"
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
{/if}

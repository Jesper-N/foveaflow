<script lang="ts">
  import { CheckIcon, ChevronDownIcon } from "@lucide/svelte";
  import type { LucideIcon } from "@lucide/svelte";
  import {
    Select,
    SelectContent,
    SelectGroup as UiSelectGroup,
    SelectGroupLabel,
    SelectItem,
    SelectItemIndicator,
    SelectLabel,
    SelectTrigger,
  } from "@ui-sdk/svelte/select";
  import type { ComponentProps, Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { ClassValue } from "svelte/elements";
  import { on } from "svelte/events";
  import { fly } from "svelte/transition";

  import { followIndicator } from "./follow-indicator";
  import RowLabel from "./row-label.svelte";
  import type { SelectGroup, SelectOption } from "./select-types";
  import { smoothResize } from "./smooth-resize";
  import { listGroupLabel, listItem, popupSurface, pressable } from "./styles";

  interface Props {
    label: string;
    labelIcon?: LucideIcon;
    hideLabel?: boolean;
    compact?: boolean;
    appearance?: "field" | "ghost";
    triggerLabel?: string;
    tip?: string;
    groups: readonly SelectGroup[];
    value: string;
    onValueChange: (value: string) => void;
    controller?: ComponentProps<typeof Select>["controller"];
    icon?: Snippet<[string]>;
    trigger?: Snippet;
    class?: ClassValue;
    triggerClass?: ClassValue;
    "data-hud-select"?: string;
  }

  let {
    label,
    labelIcon,
    hideLabel = false,
    compact = false,
    appearance = "field",
    triggerLabel,
    tip,
    groups,
    value,
    onValueChange,
    controller,
    icon,
    trigger,
    class: className,
    triggerClass,
    "data-hud-select": hudSelect,
  }: Props = $props();

  let selectedLabel = $derived(
    groups
      .flatMap((group) => group.options)
      .find((option) => option.value === value)?.label ?? ""
  );

  const rollDistance = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 10;

  let offsets = $derived(
    groups.map((_, index) =>
      groups
        .slice(0, index)
        .reduce((total, group) => total + group.options.length, 0)
    )
  );

  const followHighlight = followIndicator({
    axis: "y",
    item: "[data-slot='select-item'][data-highlighted]",
    watch: "data-highlighted",
  });

  let stopFocusRelease: (() => void) | undefined;

  const releaseReturningFocus = () => {
    stopFocusRelease?.();
    stopFocusRelease = on(document, "focusin", ({ target }) => {
      stopFocusRelease?.();
      stopFocusRelease = undefined;

      if (
        target instanceof HTMLElement &&
        target.matches("[data-slot='select-trigger']")
      ) {
        requestAnimationFrame(() => {
          if (document.activeElement === target) {
            target.blur();
          }
        });
      }
    });
  };

  const endFocusRelease = () => {
    stopFocusRelease?.();
    stopFocusRelease = undefined;
  };

  const dealIndex =
    (index: number): Attachment<HTMLElement> =>
    (node) => {
      node.style.setProperty("--deal-index", String(index));
    };
</script>

<Select
  {controller}
  onOpenChange={(open, details) => {
    if (
      !open &&
      details.reason === "item-press" &&
      !(details.event instanceof KeyboardEvent)
    ) {
      releaseReturningFocus();
    }
  }}
  onOpenChangeComplete={endFocusRelease}
  onValueChange={(next) => {
    if (typeof next === "string") {
      onValueChange(next);
    }
  }}
  presentation={compact ? "popover" : "auto"}
  {value}
>
  <div
    class={["flex items-center justify-between gap-3", className]}
    data-setting-row={hideLabel ? undefined : ""}
  >
    <SelectLabel
      class={[hideLabel ? "sr-only" : "text-md min-w-0 font-medium"]}
    >
      <RowLabel icon={labelIcon} {label} />
    </SelectLabel>
    <SelectTrigger
      class={[
        "group/trigger inline-flex min-w-0 items-center font-medium",
        appearance === "field" &&
          "bg-fill text-md hover:bg-fill-hover data-open:bg-fill-hover h-9 gap-2 rounded-full ps-3 pe-2.5 pointer-coarse:h-11",
        appearance === "ghost" &&
          "text-md text-muted-foreground hover:bg-fill hover:text-foreground data-open:bg-fill data-open:text-foreground h-9 gap-1.5 rounded-full px-2.5 pointer-coarse:h-11",
        pressable,
        compact && "max-sm:pe-3",
        triggerClass,
      ]}
      aria-label={triggerLabel}
      data-hud-select={hudSelect}
      data-tip={tip}
    >
      {#if trigger}
        {@render trigger()}
      {:else}
        {#if icon}
          <span class="text-muted-foreground flex shrink-0" data-trigger-icon>
            {@render icon(value)}
          </span>
        {/if}
        <span
          class="me-auto min-w-0 overflow-clip text-start"
          {@attach smoothResize("width")}
        >
          <span class="relative block w-max">
            <span
              class="invisible block whitespace-nowrap before:content-[attr(data-label)]"
              aria-hidden="true"
              data-label={selectedLabel}
            ></span>
            {#key value}
              <span
                class="absolute inset-0 whitespace-nowrap"
                in:fly={{ duration: 260, opacity: 0, y: rollDistance() }}
                out:fly={{ duration: 160, opacity: 0, y: -rollDistance() }}
              >
                {selectedLabel}
              </span>
            {/key}
          </span>
        </span>
      {/if}
      <ChevronDownIcon
        class={[
          compact && "max-sm:hidden",
          "text-muted-foreground group-hover/trigger:text-foreground group-data-open/trigger:text-foreground size-4 shrink-0 transition-[rotate,color] duration-220 ease-out group-data-open/trigger:rotate-180",
        ]}
        aria-hidden="true"
      />
    </SelectTrigger>
  </div>
  <SelectContent
    class={[
      popupSurface,
      "popup-unfold data-[presentation=sheet]:before:bg-fill-active max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto overscroll-contain data-[presentation=sheet]:max-h-[85dvh] data-[presentation=sheet]:rounded-t-4xl data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:p-2 data-[presentation=sheet]:pb-[calc(0.5rem+env(safe-area-inset-bottom))] data-[presentation=sheet]:before:mx-auto data-[presentation=sheet]:before:mb-1 data-[presentation=sheet]:before:block data-[presentation=sheet]:before:h-1 data-[presentation=sheet]:before:w-9 data-[presentation=sheet]:before:rounded-full",
    ]}
    {@attach followHighlight}
    collisionPadding={12}
    sideOffset={8}
  >
    <span
      class="bg-fill stretch-indicator-y pointer-events-none absolute inset-x-2 rounded-xl opacity-0"
      aria-hidden="true"
      data-indicator
    ></span>
    {#each groups as group, index (group.label ?? index)}
      {#if group.label}
        <UiSelectGroup>
          <SelectGroupLabel class={listGroupLabel}
            >{group.label}</SelectGroupLabel
          >
          {@render options(group.options, offsets[index] ?? 0)}
        </UiSelectGroup>
      {:else}
        {@render options(group.options, offsets[index] ?? 0)}
      {/if}
    {/each}
  </SelectContent>
</Select>

{#snippet options(list: readonly SelectOption[], offset: number)}
  {#each list as option, index (option.value)}
    <SelectItem
      class={listItem}
      {@attach dealIndex(offset + index)}
      label={option.label}
      value={option.value}
    >
      {#if icon}
        <span class="text-muted-foreground flex shrink-0">
          {@render icon(option.value)}
        </span>
      {/if}
      <span class="min-w-0 flex-1 truncate">{option.label}</span>
      <SelectItemIndicator
        class="bg-foreground text-background grid size-4.5 shrink-0 place-items-center rounded-md"
      >
        <CheckIcon class="size-3.5" aria-hidden="true" stroke-width={2.5} />
      </SelectItemIndicator>
    </SelectItem>
  {/each}
{/snippet}

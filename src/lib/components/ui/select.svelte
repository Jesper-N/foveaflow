<script lang="ts">
  import { CheckIcon, ChevronDownIcon } from "@lucide/svelte";
  import {
    Select,
    SelectContent,
    SelectGroup as UiSelectGroup,
    SelectGroupLabel,
    SelectItem,
    SelectItemIndicator,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@ui-sdk/svelte/select";
  import type { ComponentProps, Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import type { SelectGroup, SelectOption } from "./select-types";
  import {
    listGroupLabel,
    listItem,
    popupMotion,
    popupSurface,
    pressable,
  } from "./styles";

  interface Props {
    label: string;
    hideLabel?: boolean;
    compact?: boolean;
    triggerLabel?: string;
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
    hideLabel = false,
    compact = false,
    triggerLabel,
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
</script>

<Select
  {controller}
  onValueChange={(next) => {
    if (typeof next === "string") {
      onValueChange(next);
    }
  }}
  presentation={compact ? "popover" : "auto"}
  {value}
>
  <div class={["flex items-center justify-between gap-3", className]}>
    <SelectLabel class={[hideLabel ? "sr-only" : "text-md font-medium"]}>
      {label}
    </SelectLabel>
    <SelectTrigger
      class={[
        "group/trigger bg-fill text-md hover:bg-fill-hover data-open:bg-fill-hover inline-flex h-9 min-w-0 items-center gap-2 rounded-full ps-3 pe-2.5 font-medium pointer-coarse:h-11",
        pressable,
        compact && "max-sm:pe-3",
        triggerClass,
      ]}
      aria-label={triggerLabel}
      data-hud-select={hudSelect}
    >
      {#if trigger}
        {@render trigger()}
      {:else}
        {#if icon}
          <span class="text-muted-foreground flex shrink-0" data-trigger-icon>
            {@render icon(value)}
          </span>
        {/if}
        <SelectValue class="min-w-0 flex-1 truncate text-start" />
      {/if}
      <ChevronDownIcon
        class={[
          compact && "max-sm:hidden",
          "text-muted-foreground size-4 shrink-0 transition-transform duration-220 ease-out group-data-open/trigger:rotate-180",
        ]}
        aria-hidden="true"
      />
    </SelectTrigger>
  </div>
  <SelectContent
    class={[
      popupSurface,
      popupMotion,
      "data-[presentation=sheet]:before:bg-fill-active max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto overscroll-contain data-[presentation=sheet]:max-h-[85dvh] data-[presentation=sheet]:rounded-t-4xl data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:p-2 data-[presentation=sheet]:pb-[calc(0.5rem+env(safe-area-inset-bottom))] data-[presentation=sheet]:before:mx-auto data-[presentation=sheet]:before:mb-1 data-[presentation=sheet]:before:block data-[presentation=sheet]:before:h-1 data-[presentation=sheet]:before:w-9 data-[presentation=sheet]:before:rounded-full",
    ]}
    collisionPadding={12}
    sideOffset={8}
  >
    {#each groups as group, index (group.label ?? index)}
      {#if group.label}
        <UiSelectGroup>
          <SelectGroupLabel class={listGroupLabel}
            >{group.label}</SelectGroupLabel
          >
          {@render options(group.options)}
        </UiSelectGroup>
      {:else}
        {@render options(group.options)}
      {/if}
    {/each}
  </SelectContent>
</Select>

{#snippet options(list: readonly SelectOption[])}
  {#each list as option (option.value)}
    <SelectItem
      class={[listItem, "pe-2"]}
      label={option.label}
      value={option.value}
    >
      {#if icon}
        <span class="text-muted-foreground flex shrink-0">
          {@render icon(option.value)}
        </span>
      {/if}
      <span class="min-w-0 flex-1 truncate">{option.label}</span>
      <SelectItemIndicator class="flex shrink-0">
        <CheckIcon class="size-4" aria-hidden="true" />
      </SelectItemIndicator>
    </SelectItem>
  {/each}
{/snippet}

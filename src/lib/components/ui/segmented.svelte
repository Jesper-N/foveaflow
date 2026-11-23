<script lang="ts">
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import { segmentItem, segmentThumb, segmentTrack } from "./styles";

  interface SegmentedOption {
    value: string;
    label: string;
  }

  interface Props {
    label: string;
    options: readonly SegmentedOption[];
    value: string;
    onValueChange: (value: string) => void;
    icon?: Snippet<[string]>;
    class?: ClassValue;
  }

  let {
    label,
    options,
    value,
    onValueChange,
    icon,
    class: className,
  }: Props = $props();
</script>

<SegmentedControl
  class={[segmentTrack, className]}
  aria-label={label}
  onValueChange={(next) => {
    if (typeof next === "string") {
      onValueChange(next);
    }
  }}
  {value}
>
  <SegmentedControlIndicator
    class={[
      segmentThumb,
      "top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width)",
    ]}
  />
  {#each options as option (option.value)}
    <SegmentedControlItem
      class={[segmentItem, "data-checked:text-foreground"]}
      value={option.value}
    >
      {@render icon?.(option.value)}
      <span class="truncate">{option.label}</span>
    </SegmentedControlItem>
  {/each}
</SegmentedControl>

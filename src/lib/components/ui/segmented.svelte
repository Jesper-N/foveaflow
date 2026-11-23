<script lang="ts">
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { ClassValue } from "svelte/elements";

  import {
    segmentItem,
    segmentThumb,
    segmentTrack,
    setTravelDirection,
  } from "./styles";

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

  let track = $state.raw<HTMLElement>();

  const trackElement: Attachment<HTMLElement> = (node) => {
    track = node;
  };

  const indexOf = (option: string) =>
    options.findIndex((candidate) => candidate.value === option);
</script>

<SegmentedControl
  class={[segmentTrack, className]}
  {@attach trackElement}
  aria-label={label}
  onValueChange={(next) => {
    if (typeof next === "string") {
      setTravelDirection(track, indexOf(value), indexOf(next));
      onValueChange(next);
    }
  }}
  {value}
>
  <SegmentedControlIndicator
    class={[
      segmentThumb,
      "top-(--segmented-control-indicator-top) right-[calc(100%-var(--segmented-control-indicator-left)-var(--segmented-control-indicator-width))] left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height)",
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

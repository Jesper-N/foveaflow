<script lang="ts">
  import {
    Slider,
    SliderControl,
    SliderIndicator,
    SliderThumb,
    SliderTrack,
    SliderValue,
  } from "@ui-sdk/svelte/slider";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    label: string;
    thumbLabel?: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (value: number) => string;
    onValueChange: (value: number) => void;
    class?: ClassValue;
  }

  let {
    label,
    thumbLabel = label,
    value,
    min,
    max,
    step,
    format,
    onValueChange,
    class: className,
  }: Props = $props();
</script>

<Slider
  class={[
    "group/slider grid grid-cols-[1fr_auto] items-center gap-x-3",
    className,
  ]}
  {format}
  {max}
  {min}
  onValueChange={(next) => {
    if (typeof next === "number") {
      onValueChange(next);
    }
  }}
  {step}
  {value}
>
  <span class="text-md font-medium" aria-hidden="true">{label}</span>
  <SliderValue class="text-md text-muted-foreground font-medium tabular-nums" />
  <SliderControl
    class="col-span-2 flex h-8 cursor-pointer touch-none items-center pointer-coarse:h-11"
  >
    <SliderTrack class="ticks text-fill-active relative h-5 w-full">
      <SliderIndicator class="ticks text-foreground h-full" />
      <SliderThumb
        class="bg-foreground has-focus-visible:outline-ring h-7 w-0.75 -translate-x-1/2 rounded-full transition-[scale] duration-160 ease-out group-data-dragging/slider:scale-y-115 has-focus-visible:outline-2 has-focus-visible:outline-offset-3"
        aria-label={thumbLabel}
      />
    </SliderTrack>
  </SliderControl>
</Slider>

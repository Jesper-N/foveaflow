<script lang="ts">
  import {
    Slider,
    SliderControl,
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
    ticks?: number;
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
    ticks = 32,
    format,
    onValueChange,
    class: className,
  }: Props = $props();

  const wakeScale = [
    "scale-y-170",
    "scale-y-145",
    "scale-y-125",
    "scale-y-110",
  ] as const;

  let track = $state<HTMLDivElement>();
  let pointerIndex = $state<number | null>(null);
  let pressed = $state(false);
  let focused = $state(false);

  let ratio = $derived(max === min ? 0 : (value - min) / (max - min));
  let valueIndex = $derived(Math.round(ratio * (ticks - 1)));
  let active = $derived(pressed || focused || pointerIndex !== null);
  let wakeIndex = $derived(pressed || focused ? valueIndex : pointerIndex);
  let indexes = $derived(Array.from({ length: ticks }, (_, index) => index));

  const tickScale = (index: number) => {
    if (wakeIndex === null) {
      return "scale-y-100";
    }

    return wakeScale[Math.abs(index - wakeIndex)] ?? "scale-y-100";
  };

  const trackPointer = (event: PointerEvent) => {
    if (!track || event.pointerType === "touch") {
      return;
    }

    const box = track.getBoundingClientRect();
    const position = (event.clientX - box.left) / box.width;
    const clamped = Math.min(1, Math.max(0, position));

    pointerIndex = Math.round(clamped * (ticks - 1));
  };
</script>

<svelte:window
  onpointercancel={() => (pressed = false)}
  onpointerup={() => (pressed = false)}
/>

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
  onfocusin={(event: FocusEvent) => {
    focused =
      event.target instanceof Element && event.target.matches(":focus-visible");
  }}
  onfocusout={() => (focused = false)}
  {step}
  {value}
>
  <span
    class={[
      "text-md font-medium transition-colors duration-160 ease-out",
      active ? "text-foreground" : "text-muted-foreground",
    ]}
    aria-hidden="true"
  >
    {label}
  </span>
  <SliderValue
    class={[
      "text-md font-medium tabular-nums transition-colors duration-160 ease-out",
      active ? "text-foreground" : "text-muted-foreground",
    ]}
  />
  <SliderControl
    class="col-span-2 flex h-9 cursor-pointer touch-pan-y items-center pointer-coarse:h-11"
    onpointerdown={() => (pressed = true)}
    onpointerleave={() => (pointerIndex = null)}
    onpointermove={trackPointer}
  >
    <SliderTrack class="relative h-5 w-full">
      <div
        bind:this={track}
        class="flex h-full w-full items-center justify-between"
        aria-hidden="true"
      >
        {#each indexes as index (index)}
          <span
            class={[
              "ease-spring h-3.5 w-0.75 rounded-full transition-[scale,background-color] duration-220",
              index <= valueIndex ? "bg-foreground" : "bg-faint",
              tickScale(index),
            ]}
          ></span>
        {/each}
      </div>
      <SliderThumb
        class="before:bg-foreground before:ease-spring has-focus-visible:outline-ring top-1/2 h-7 w-3 -translate-1/2 rounded-full outline-none before:absolute before:inset-y-0 before:left-1/2 before:w-0.75 before:-translate-x-1/2 before:rounded-full before:transition-[scale] before:duration-220 group-data-dragging/slider:before:scale-y-115 has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
        aria-label={thumbLabel}
      />
    </SliderTrack>
  </SliderControl>
</Slider>

<script lang="ts">
  import { isPersonChange, sound } from "$lib/sound/sound.svelte";
  import { Field, FieldLabel } from "@ui-sdk/svelte/field";
  import {
    Slider,
    SliderControl,
    SliderThumb,
    SliderTrack,
    SliderValue,
  } from "@ui-sdk/svelte/slider";
  import type { Attachment } from "svelte/attachments";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    label: string;
    mutedLabel?: boolean;
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
    mutedLabel = false,
    thumbLabel = label,
    value,
    min,
    max,
    step,
    format,
    onValueChange,
    class: className,
  }: Props = $props();

  let ownName = $derived(
    thumbLabel === label
      ? {}
      : { "aria-label": thumbLabel, "aria-labelledby": "" }
  );

  const activeText =
    "text-muted-foreground group-data-dragging/slider:text-foreground group-has-focus-visible/slider:text-foreground";

  const WAKE_HEIGHT = 1.3;
  const WAKE_DECAY = 6.5;
  const KEY_PUSH = 0.3;
  const TICK_PITCH = 7;
  const TICK_WIDTH = 3;

  let ticks = $state(28);

  const fitTicks: Attachment<HTMLElement> = (row) => {
    const observer = new ResizeObserver(() => {
      ticks = Math.max(
        8,
        Math.floor((row.clientWidth + TICK_PITCH - TICK_WIDTH) / TICK_PITCH)
      );
    });

    observer.observe(row);

    return () => {
      observer.disconnect();
    };
  };

  const bars: (HTMLSpanElement | undefined)[] = [];
  let energy = new Float32Array(0);
  let frame = 0;
  let lastX = 0;
  let lastTime = 0;
  let speed = 0;

  let ratio = $derived(max === min ? 0 : (value - min) / (max - min));
  let valueIndex = $derived(Math.round(ratio * (ticks - 1)));
  let indexes = $derived(Array.from({ length: ticks }, (_, index) => index));

  const registerBar =
    (index: number): Attachment<HTMLSpanElement> =>
    (node) => {
      bars[index] = node;

      return () => {
        bars[index] = undefined;
      };
    };

  const prefersStill = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const settle = (now: number, previous: number) => {
    const elapsed = Math.min(0.05, (now - previous) / 1000);
    const fall = Math.exp(-elapsed * WAKE_DECAY);
    let moving = false;

    for (const [index, bar] of bars.entries()) {
      const next = (energy[index] ?? 0) * fall;
      energy[index] = next < 0.002 ? 0 : next;
      moving ||= next >= 0.002;
      bar?.style.setProperty(
        "scale",
        `1 ${(1 + (energy[index] ?? 0) * WAKE_HEIGHT).toFixed(3)}`
      );
    }

    frame = moving
      ? requestAnimationFrame((time) => {
          settle(time, now);
        })
      : 0;
  };

  const wake = (from: number, to: number, push: number) => {
    if (push <= 0 || prefersStill()) {
      return;
    }

    if (energy.length !== ticks) {
      energy = new Float32Array(ticks);
    }

    for (
      let index = Math.min(from, to);
      index <= Math.max(from, to);
      index += 1
    ) {
      energy[index] = Math.max(energy[index] ?? 0, push);
    }

    if (frame === 0) {
      const start = performance.now();
      frame = requestAnimationFrame((time) => {
        settle(time, start);
      });
    }
  };

  const indexOf = (next: number) =>
    Math.round(((next - min) / (max - min || 1)) * (ticks - 1));

  const trackSpeed = (event: PointerEvent) => {
    if (event.buttons === 0) {
      return;
    }

    const now = performance.now();
    const elapsed = Math.max(0.008, (now - lastTime) / 1000);

    speed = speed * 0.5 + (Math.abs(event.clientX - lastX) / elapsed) * 0.5;
    lastX = event.clientX;
    lastTime = now;
  };

  const stopWake: Attachment<HTMLElement> = () => () => {
    cancelAnimationFrame(frame);
  };
</script>

<Field class={className} data-setting-row>
  <Slider
    class="group/slider grid grid-cols-[1fr_auto] items-center gap-x-3"
    {format}
    {max}
    {min}
    onValueChange={(next, details) => {
      if (typeof next !== "number") {
        return;
      }

      if (isPersonChange(details) && next !== value) {
        sound.slide((next - min) / (max - min || 1));
      }

      const push =
        details.reason === "step-key" ? KEY_PUSH : 1 - Math.exp(-speed / 900);

      wake(valueIndex, indexOf(next), push);
      onValueChange(next);
    }}
    {step}
    {value}
  >
    <FieldLabel
      class={[
        "text-md min-w-0 cursor-pointer truncate font-medium transition-colors duration-160 ease-out",
        mutedLabel ? activeText : "text-foreground",
      ]}
    >
      {label}
    </FieldLabel>
    <SliderValue
      class={[
        "text-md font-medium tabular-nums transition-colors duration-160 ease-out",
        activeText,
      ]}
    />
    <SliderControl
      class="col-span-2 flex h-10 cursor-pointer touch-pan-y items-center pointer-coarse:h-11"
      onpointerdown={(event: PointerEvent) => {
        speed = 0;
        lastX = event.clientX;
        lastTime = performance.now();
      }}
      onpointermove={trackSpeed}
    >
      <SliderTrack class="relative h-4 w-full">
        <div
          class="flex h-full w-full items-center gap-1"
          {@attach stopWake}
          {@attach fitTicks}
          aria-hidden="true"
        >
          {#each indexes as index (index)}
            <span
              class={[
                "h-4 w-0.75 rounded-full transition-colors duration-160 ease-out",
                index <= valueIndex ? "bg-foreground" : "bg-faint",
              ]}
              {@attach registerBar(index)}
            ></span>
          {/each}
        </div>
        <SliderThumb
          class="has-focus-visible:outline-ring top-1/2 h-7 w-2.5 -translate-1/2 rounded-full outline-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
          {...ownName}
        />
      </SliderTrack>
    </SliderControl>
  </Slider>
</Field>

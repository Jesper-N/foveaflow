<script lang="ts">
  import { isPersonChange, sound } from "$lib/sound/sound.svelte";
  import type { LucideIcon } from "@lucide/svelte";
  import {
    Slider,
    SliderControl,
    SliderThumb,
    SliderTrack,
    SliderValue,
  } from "@ui-sdk/svelte/slider";
  import type { Attachment } from "svelte/attachments";
  import type { ClassValue } from "svelte/elements";

  import RowLabel from "./row-label.svelte";

  interface Props {
    label: string;
    icon?: LucideIcon;
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
    icon,
    thumbLabel = label,
    value,
    min,
    max,
    step,
    format,
    onValueChange,
    class: className,
  }: Props = $props();

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
  let pressed = $state(false);
  let focused = $state(false);
  let lastX = 0;
  let lastTime = 0;
  let speed = 0;

  let ratio = $derived(max === min ? 0 : (value - min) / (max - min));
  let valueIndex = $derived(Math.round(ratio * (ticks - 1)));
  let active = $derived(pressed || focused);
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

    frame =
      moving || pressed
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
    if (!pressed) {
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

<svelte:window
  onpointercancel={() => (pressed = false)}
  onpointerup={() => (pressed = false)}
/>

<Slider
  class={[
    "group/slider grid grid-cols-[1fr_auto] items-center gap-x-3",
    className,
  ]}
  data-setting-row
  {format}
  {max}
  {min}
  onValueChange={(next, details) => {
    if (typeof next !== "number") {
      return;
    }

    if (isPersonChange(details) && next !== value) {
      sound.step(next > value ? "forward" : "back");
    }

    const push = pressed ? 1 - Math.exp(-speed / 900) : KEY_PUSH;

    wake(valueIndex, indexOf(next), push);
    onValueChange(next);
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
      "text-md min-w-0 font-medium transition-colors duration-160 ease-out",
      active || icon ? "text-foreground" : "text-muted-foreground",
    ]}
    aria-hidden="true"
  >
    <RowLabel {active} {icon} {label} />
  </span>
  <SliderValue
    class={[
      "text-md font-medium tabular-nums transition-colors duration-160 ease-out",
      active ? "text-foreground" : "text-muted-foreground",
    ]}
  />
  <SliderControl
    class={[
      "col-span-2 flex h-10 cursor-pointer touch-pan-y items-center pointer-coarse:h-11",
      icon && "ms-10",
    ]}
    onpointerdown={(event: PointerEvent) => {
      pressed = true;
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
        aria-label={thumbLabel}
      />
    </SliderTrack>
  </SliderControl>
</Slider>

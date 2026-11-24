<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { cue } from "$lib/sound/sound.svelte";
  import type { LucideIcon } from "@lucide/svelte";
  import {
    ColorPicker,
    ColorPickerArea,
    ColorPickerAreaThumb,
    ColorPickerInput,
    ColorPickerSlider,
    ColorPickerSliderThumb,
    ColorPickerSwatch,
    ColorPickerSwatches,
    ColorPickerSwatchItem,
  } from "@ui-sdk/svelte/color-picker";
  import { Label } from "@ui-sdk/svelte/label";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@ui-sdk/svelte/popover";

  import RowLabel from "./row-label.svelte";
  import { popupSurface, pressable } from "./styles";
  import SwatchDot from "./swatch-dot.svelte";

  interface Props {
    label: string;
    icon?: LucideIcon;
    value: string;
    presets: readonly string[];
    onValueChange: (color: string) => void;
  }

  let { label, icon, value, presets, onValueChange }: Props = $props();

  const triggerId = $props.id();

  const colorThumb =
    "size-5 -translate-1/2 rounded-full bg-(--color-picker-color) shadow-[0_0_0_2px_white,0_1px_6px_rgb(0_0_0/0.35)] outline-none transition-[scale] duration-160 ease-out has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring data-dragging:scale-115";
</script>

<ColorPicker
  aria-label={label}
  data-setting-row
  format="hex"
  onValueChange={(next, details) => {
    if (details.reason === "item-press" && next !== value) {
      cue("select");
    }

    onValueChange(next);
  }}
  space="hsv"
  {value}
>
  <div class="flex min-h-9 items-center justify-between gap-3">
    <Label class="text-md min-w-0 cursor-pointer font-medium" for={triggerId}>
      <RowLabel {icon} {label} />
    </Label>
    <Popover
      onOpenChange={(open) => {
        cue(open ? "open" : "close", { emphasis: "subtle" });
      }}
    >
      <PopoverTrigger
        id={triggerId}
        class={[
          "group/color bg-fill hover:bg-fill-hover data-open:bg-fill-hover flex h-9 items-center gap-2 rounded-full ps-1.5 pe-3 pointer-coarse:h-11",
          pressable,
        ]}
      >
        <ColorPickerSwatch
          class="ease-spring size-6 rounded-full bg-(--color-picker-color) transition-[scale] duration-220 group-hover/color:scale-108"
        />
        <span
          class="text-muted-foreground text-sm font-medium uppercase tabular-nums"
        >
          {value}
        </span>
      </PopoverTrigger>
      <PopoverContent
        class={[popupSurface, "popup-unfold grid w-64 gap-3 p-3"]}
        align="end"
        sideOffset={8}
      >
        <ColorPickerArea
          class="relative h-36 cursor-crosshair touch-none rounded-xl bg-(image:--color-area-background) shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
        >
          <ColorPickerAreaThumb class={colorThumb} />
        </ColorPickerArea>
        <ColorPickerSlider
          class="relative h-3 cursor-pointer touch-none rounded-full bg-(image:--color-slider-background)"
          channel="hue"
        >
          <ColorPickerSliderThumb class={[colorThumb, "top-1/2"]} />
        </ColorPickerSlider>
        <ColorPickerSwatches class="grid grid-cols-8 gap-1" aria-label={label}>
          {#each presets as preset (preset)}
            <ColorPickerSwatchItem
              class="group/swatch focus-visible:outline-ring grid aspect-square cursor-pointer place-items-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-1"
              value={preset}
            >
              <SwatchDot color={preset} />
            </ColorPickerSwatchItem>
          {/each}
        </ColorPickerSwatches>
        <ColorPickerInput
          class="bg-fill text-md focus-visible:outline-ring h-9 w-full rounded-xl px-3 font-medium uppercase tabular-nums outline-none focus-visible:outline-2 pointer-coarse:h-11 pointer-coarse:text-base"
          aria-label={t("Hex")}
          data-cuelume-type
          spellcheck={false}
        />
      </PopoverContent>
    </Popover>
  </div>
</ColorPicker>

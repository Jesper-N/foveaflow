<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { SliderBinding } from "$lib/trainer/control-actions";

  import { compactSliderClass, settingsRowClass } from "./settings-styles";

  let {
    label,
    valueLabel,
    ariaLabel,
    slider,
    min,
    max,
    step,
  }: {
    label: string;
    valueLabel: string;
    ariaLabel: string;
    slider: SliderBinding;
    min: number;
    max: number;
    step: number;
  } = $props();
</script>

<Field.Field class={settingsRowClass}>
  <Field.Title>{label}</Field.Title>
  <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] items-center gap-3">
    <Slider
      bind:value={slider.value, slider.set}
      {min}
      {max}
      {step}
      aria-label={ariaLabel}
      class={compactSliderClass}
    />
    <span class="text-muted-foreground text-right text-sm tabular-nums"
      >{valueLabel}</span
    >
  </div>
</Field.Field>

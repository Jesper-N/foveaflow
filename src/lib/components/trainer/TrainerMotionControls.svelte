<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Field from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { maxSpeedByUnit, speedStepByUnit } from "$lib/trainer/options";
  import {
    trainerSettingBounds,
    type TrainerSliderValue,
  } from "$lib/trainer/settings";

  let {
    settings,
    speedSliderValue,
    setSpeedSliderValue,
    handleSpeedUnitChange,
    sliderRow,
  }: {
    settings: TrainerSettings;
    speedSliderValue: () => number[];
    setSpeedSliderValue: (value: TrainerSliderValue) => void;
    handleSpeedUnitChange: (value: string) => void;
    sliderRow: Snippet<[string, string]>;
  } = $props();
</script>

<Field.Field>
  {@render sliderRow(
    "Speed",
    `${settings.speed.value.toFixed(1)} ${settings.speed.unit}`,
  )}
  <Slider
    bind:value={speedSliderValue, setSpeedSliderValue}
    min={trainerSettingBounds.speedValue.min}
    max={maxSpeedByUnit[settings.speed.unit]}
    step={speedStepByUnit[settings.speed.unit]}
    aria-label="Speed"
  />
</Field.Field>

<Field.Field>
  <Field.Label for="trainer-speed-unit">Unit</Field.Label>
  <Select.Root
    type="single"
    value={settings.speed.unit}
    onValueChange={handleSpeedUnitChange}
  >
    <Select.Trigger
      id="trainer-speed-unit"
      class="w-full"
      aria-label="Speed unit"
    >
      {settings.speed.unit}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Item value="deg/s">deg/s</Select.Item>
        <Select.Item value="cm/s">cm/s</Select.Item>
        <Select.Item value="screen/s">screen/s</Select.Item>
      </Select.Group>
    </Select.Content>
  </Select.Root>
</Field.Field>

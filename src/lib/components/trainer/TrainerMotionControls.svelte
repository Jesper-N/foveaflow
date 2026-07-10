<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Field from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import {
    maxSpeedByUnit,
    minSpeedByUnit,
    speedDecimalPlacesByUnit,
    speedSliderStepByUnit,
  } from "$lib/trainer/options";
  import type { TrainerSliderValue } from "$lib/trainer/settings";

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

  let locale = $derived(languageState.locale);
</script>

<Field.Field>
  {@render sliderRow(
    t(locale, "Speed"),
    `${settings.speed.value.toFixed(speedDecimalPlacesByUnit[settings.speed.unit])} ${settings.speed.unit}`,
  )}
  <Slider
    bind:value={speedSliderValue, setSpeedSliderValue}
    min={minSpeedByUnit[settings.speed.unit]}
    max={maxSpeedByUnit[settings.speed.unit]}
    step={speedSliderStepByUnit[settings.speed.unit]}
    aria-label={t(locale, "Speed")}
  />
</Field.Field>

<Field.Field>
  <Field.Label for="trainer-speed-unit">{t(locale, "Unit")}</Field.Label>
  <Select.Root
    type="single"
    value={settings.speed.unit}
    onValueChange={handleSpeedUnitChange}
  >
    <Select.Trigger
      id="trainer-speed-unit"
      class="w-full"
      aria-label={t(locale, "Speed unit")}
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

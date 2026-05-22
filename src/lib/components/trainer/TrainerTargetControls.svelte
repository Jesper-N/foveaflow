<script lang="ts">
  import type { Snippet } from "svelte";

  import TrainerLetterControls from "$lib/components/trainer/TrainerLetterControls.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { getShapeName, shapeOptions } from "$lib/trainer/options";
  import {
    trainerSettingBounds,
    type TrainerSliderValue,
  } from "$lib/trainer/settings";

  type Props = {
    settings: TrainerSettings;
    isMotMode: boolean;
    handleColorInput: (event: Event) => void;
    handleShapeChange: (value: string) => void;
    handleLetterColorInput: (event: Event) => void;
    handleLetterWeightChange: (value: string) => void;
    sizeSliderValue: () => number[];
    setSizeSliderValue: (value: TrainerSliderValue) => void;
    opacitySliderValue: () => number[];
    setOpacitySliderValue: (value: TrainerSliderValue) => void;
    targetCountSliderValue: () => number[];
    setTargetCountSliderValue: (value: TrainerSliderValue) => void;
    distractorCountSliderValue: () => number[];
    setDistractorCountSliderValue: (value: TrainerSliderValue) => void;
    distractorBrightnessSliderValue: () => number[];
    setDistractorBrightnessSliderValue: (value: TrainerSliderValue) => void;
    letterScaleSliderValue: () => number[];
    setLetterScaleSliderValue: (value: TrainerSliderValue) => void;
    sliderRow: Snippet<[string, string]>;
  };

  let {
    settings = $bindable(),
    isMotMode,
    handleColorInput,
    handleShapeChange,
    handleLetterColorInput,
    handleLetterWeightChange,
    sizeSliderValue,
    setSizeSliderValue,
    opacitySliderValue,
    setOpacitySliderValue,
    targetCountSliderValue,
    setTargetCountSliderValue,
    distractorCountSliderValue,
    setDistractorCountSliderValue,
    distractorBrightnessSliderValue,
    setDistractorBrightnessSliderValue,
    letterScaleSliderValue,
    setLetterScaleSliderValue,
    sliderRow,
  }: Props = $props();
</script>

{#if isMotMode}
  <div class="space-y-4">
    <Field.Field>
      {@render sliderRow("Targets", String(settings.targetCount))}
      <Slider
        bind:value={targetCountSliderValue, setTargetCountSliderValue}
        min={trainerSettingBounds.targetCount.min}
        max={trainerSettingBounds.targetCount.max}
        step={1}
        aria-label="Targets"
      />
    </Field.Field>
    <Field.Field>
      {@render sliderRow("Distractors", String(settings.distractorCount))}
      <Slider
        bind:value={distractorCountSliderValue, setDistractorCountSliderValue}
        min={trainerSettingBounds.distractorCount.min}
        max={trainerSettingBounds.distractorCount.max}
        step={1}
        aria-label="Distractors"
      />
    </Field.Field>
  </div>
{/if}

<Field.Field>
  <label
    class="flex h-11 min-w-0 cursor-pointer items-center gap-3 rounded-full border bg-input/50 px-3 transition-[color,box-shadow,background-color] hover:ring-4 hover:ring-ring/30"
    for="trainer-color"
  >
    <svg
      viewBox="0 0 24 24"
      class="size-6 shrink-0 rounded-full border shadow-sm"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill={settings.ballColor} />
    </svg>
    <span class="min-w-0 truncate font-sans text-sm uppercase text-foreground">
      {settings.ballColor}
    </span>
    <Input
      id="trainer-color"
      class="sr-only"
      type="color"
      value={settings.ballColor}
      oninput={handleColorInput}
      aria-label="Ball color"
    />
  </label>
</Field.Field>

{#if isMotMode}
  <Field.Field>
    {@render sliderRow(
      "Distractor color",
      `${Math.round(settings.distractorBrightness * 100)}%`,
    )}
    <Slider
      bind:value={
        distractorBrightnessSliderValue, setDistractorBrightnessSliderValue
      }
      min={trainerSettingBounds.distractorBrightness.min}
      max={trainerSettingBounds.distractorBrightness.max}
      step={0.01}
      aria-label="Distractor color brightness"
    />
  </Field.Field>
{/if}

<Field.Field>
  {@render sliderRow("Opacity", `${Math.round(settings.targetOpacity * 100)}%`)}
  <Slider
    bind:value={opacitySliderValue, setOpacitySliderValue}
    min={trainerSettingBounds.targetOpacity.min}
    max={trainerSettingBounds.targetOpacity.max}
    step={0.01}
    aria-label="Target opacity"
  />
</Field.Field>

<Field.Field>
  <Field.Label for="trainer-shape">Shape</Field.Label>
  <Select.Root
    type="single"
    value={settings.targetShape}
    onValueChange={handleShapeChange}
  >
    <Select.Trigger id="trainer-shape" class="w-full" aria-label="Shape">
      {getShapeName(settings.targetShape)}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each shapeOptions as option (option.id)}
          <Select.Item value={option.id}>{option.name}</Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</Field.Field>

<Field.Field>
  {@render sliderRow("Size", `${Math.round(settings.baseRadiusPx)} px`)}
  <Slider
    bind:value={sizeSliderValue, setSizeSliderValue}
    min={trainerSettingBounds.baseRadiusPx.min}
    max={trainerSettingBounds.baseRadiusPx.max}
    step={1}
    aria-label="Target size"
  />
</Field.Field>

<TrainerLetterControls
  bind:settings
  {handleLetterColorInput}
  {handleLetterWeightChange}
  {letterScaleSliderValue}
  {setLetterScaleSliderValue}
  {sliderRow}
/>

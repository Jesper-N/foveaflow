<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import {
    getLetterWeightName,
    letterWeightOptions,
  } from "$lib/trainer/options";
  import {
    trainerSettingBounds,
    type TrainerSliderValue,
  } from "$lib/trainer/settings";

  let {
    settings = $bindable(),
    handleLetterColorInput,
    handleLetterWeightChange,
    letterScaleSliderValue,
    setLetterScaleSliderValue,
    sliderRow,
  }: {
    settings: TrainerSettings;
    handleLetterColorInput: (event: Event) => void;
    handleLetterWeightChange: (value: string) => void;
    letterScaleSliderValue: () => number[];
    setLetterScaleSliderValue: (value: TrainerSliderValue) => void;
    sliderRow: Snippet<[string, string]>;
  } = $props();
</script>

<div class="flex min-h-12 items-center justify-between gap-4">
  <span class="text-base font-medium">Letter</span>
  <Switch
    bind:checked={settings.letterEnabled}
    aria-label="Show target letters"
  />
</div>

{#if settings.letterEnabled}
  <Field.Field>
    <Field.Label for="trainer-letter-color">Letter color</Field.Label>
    <label
      class="flex h-11 min-w-0 cursor-pointer items-center gap-3 rounded-full border bg-input/50 px-3 transition-[color,box-shadow,background-color] hover:ring-4 hover:ring-ring/30"
      for="trainer-letter-color"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-6 shrink-0 rounded-full border bg-background shadow-sm"
        aria-hidden="true"
      >
        <text
          x="12"
          y="12"
          dominant-baseline="middle"
          text-anchor="middle"
          fill={settings.letterColor}
          font-size="15"
          font-weight={settings.letterWeight}
          font-family="Inter, Arial, sans-serif"
        >
          A
        </text>
      </svg>
      <span
        class="min-w-0 truncate font-sans text-sm uppercase text-foreground"
      >
        {settings.letterColor}
      </span>
      <Input
        id="trainer-letter-color"
        class="sr-only"
        type="color"
        value={settings.letterColor}
        oninput={handleLetterColorInput}
        aria-label="Letter color"
      />
    </label>
  </Field.Field>

  <Field.Field>
    <Field.Label for="trainer-letter-weight">Weight</Field.Label>
    <Select.Root
      type="single"
      value={String(settings.letterWeight)}
      onValueChange={handleLetterWeightChange}
    >
      <Select.Trigger
        id="trainer-letter-weight"
        class="w-full"
        aria-label="Letter weight"
      >
        {getLetterWeightName(settings.letterWeight)}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each letterWeightOptions as option (option.id)}
            <Select.Item value={String(option.id)}>{option.name}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </Field.Field>

  <Field.Field>
    {@render sliderRow(
      "Text size",
      `${Math.round(settings.letterScale * 100)}%`,
    )}
    <Slider
      bind:value={letterScaleSliderValue, setLetterScaleSliderValue}
      min={trainerSettingBounds.letterScale.min}
      max={trainerSettingBounds.letterScale.max}
      step={0.01}
      aria-label="Letter text size"
    />
  </Field.Field>
{/if}

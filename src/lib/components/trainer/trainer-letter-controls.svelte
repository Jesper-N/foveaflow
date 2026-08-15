<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import {
    getLetterWeightName,
    letterWeightOptions,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";
  import type { TrainerSliderValue } from "$lib/trainer/settings";
  import type { Snippet } from "svelte";

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

  let locale = $derived(languageState.locale);
  let currentLetterWeightName = $derived(
    t(locale, getLetterWeightName(settings.letterWeight))
  );
</script>

<Field.Field orientation="horizontal" class="min-h-12 justify-between">
  <Field.Label for="trainer-letter-enabled" class="text-base font-medium">
    {t(locale, "Letter")}
  </Field.Label>
  <Switch
    id="trainer-letter-enabled"
    bind:checked={settings.letterEnabled}
    aria-label={t(locale, "Show target letters")}
  />
</Field.Field>

{#if settings.letterEnabled}
  <Field.Field>
    <Field.Label for="trainer-letter-color">
      {t(locale, "Letter color")}
    </Field.Label>
    <label
      class="bg-input/50 hover:ring-ring/30 focus-within:ring-foreground flex h-11 min-w-0 cursor-pointer items-center gap-3 rounded-full border px-3 transition-[color,box-shadow,background-color] focus-within:ring-3 hover:ring-4"
      for="trainer-letter-color"
    >
      <svg
        viewBox="0 0 24 24"
        class="bg-background size-6 shrink-0 rounded-full border shadow-sm"
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
        class="text-foreground min-w-0 truncate font-sans text-sm uppercase"
      >
        {settings.letterColor}
      </span>
      <Input
        id="trainer-letter-color"
        class="sr-only"
        type="color"
        value={settings.letterColor}
        oninput={handleLetterColorInput}
        aria-label={t(locale, "Letter color")}
      />
    </label>
  </Field.Field>

  <Field.Field>
    <Field.Label for="trainer-letter-weight">{t(locale, "Weight")}</Field.Label>
    <Select.Root
      type="single"
      value={String(settings.letterWeight)}
      onValueChange={handleLetterWeightChange}
    >
      <Select.Trigger
        id="trainer-letter-weight"
        class="w-full"
        aria-label={t(locale, "Letter weight")}
      >
        {currentLetterWeightName}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each letterWeightOptions as option (option.id)}
            <Select.Item value={String(option.id)}
              >{t(locale, option.name)}</Select.Item
            >
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </Field.Field>

  <Field.Field>
    {@render sliderRow(
      t(locale, "Text size"),
      `${Math.round(settings.letterScale * 100)}%`
    )}
    <Slider
      bind:value={letterScaleSliderValue, setLetterScaleSliderValue}
      min={trainerSettingBounds.letterScale.min}
      max={trainerSettingBounds.letterScale.max}
      step={0.01}
      aria-label={t(locale, "Letter text size")}
    />
  </Field.Field>
{/if}

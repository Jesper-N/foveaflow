<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import {
    getLetterWeightName,
    letterWeightOptions,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";

  import SettingsSliderRow from "./settings-slider-row.svelte";
  import {
    settingsColorClass,
    settingsColorValueClass,
    settingsRowClass,
    settingsSwitchRowClass,
  } from "./settings-styles";

  let {
    actions,
    settings = $bindable(),
    ballColor,
  }: {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    ballColor: string;
  } = $props();

  let locale = $derived(languageState.locale);
  let currentLetterWeightName = $derived(
    t(locale, getLetterWeightName(settings.letterWeight))
  );
</script>

<Field.Field orientation="horizontal" class={settingsSwitchRowClass}>
  <Field.Label for="trainer-letter-enabled">
    {t(locale, "Show target letters")}
  </Field.Label>
  <Switch id="trainer-letter-enabled" bind:checked={settings.letterEnabled} />
</Field.Field>

{#if settings.letterEnabled}
  <Field.Field class={settingsRowClass}>
    <Field.Label for="trainer-letter-color">
      {t(locale, "Letter color")}
    </Field.Label>
    <label class={settingsColorClass} for="trainer-letter-color">
      <!-- Preview the letter on the ball, the way it renders on the canvas. -->
      <svg viewBox="0 0 24 24" class="size-6 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill={ballColor} />
        <text
          x="12"
          y="12"
          dominant-baseline="middle"
          text-anchor="middle"
          fill={settings.letterColor}
          font-size="15"
          font-weight={settings.letterWeight}
        >
          A
        </text>
      </svg>
      <span class={settingsColorValueClass}>{settings.letterColor}</span>
      <Input
        id="trainer-letter-color"
        class="sr-only"
        type="color"
        value={settings.letterColor}
        oninput={actions.handleLetterColorInput}
        aria-label={t(locale, "Letter color")}
      />
    </label>
  </Field.Field>

  <Field.Field class={settingsRowClass}>
    <Field.Label for="trainer-letter-weight">{t(locale, "Weight")}</Field.Label>
    <Select.Root
      type="single"
      value={String(settings.letterWeight)}
      onValueChange={actions.handleLetterWeightChange}
    >
      <Select.Trigger
        id="trainer-letter-weight"
        class="min-h-11 w-full"
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

  <SettingsSliderRow
    label={t(locale, "Text size")}
    valueLabel={`${Math.round(settings.letterScale * 100)}%`}
    ariaLabel={t(locale, "Letter text size")}
    slider={actions.letterScaleSlider}
    min={trainerSettingBounds.letterScale.min}
    max={trainerSettingBounds.letterScale.max}
    step={0.01}
  />
{/if}

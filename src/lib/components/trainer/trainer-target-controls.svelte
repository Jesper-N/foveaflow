<script lang="ts">
  import TrainerLetterControls from "$lib/components/trainer/trainer-letter-controls.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import { getTargetFormName, targetFormOptions } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";
  import type { Snippet } from "svelte";

  interface Props {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    isMotMode: boolean;
    sliderRow: Snippet<[string, string]>;
  }

  let {
    actions,
    settings = $bindable(),
    isMotMode,
    sliderRow,
  }: Props = $props();

  let locale = $derived(languageState.locale);
  let currentTargetFormName = $derived(
    t(locale, getTargetFormName(settings.targetForm))
  );
</script>

{#if isMotMode}
  <div class="grid gap-4">
    <Field.Field>
      {@render sliderRow(t(locale, "Targets"), String(settings.targetCount))}
      <Slider
        bind:value={
          actions.targetCountSlider.value, actions.targetCountSlider.set
        }
        min={trainerSettingBounds.targetCount.min}
        max={trainerSettingBounds.targetCount.max}
        step={1}
        aria-label={t(locale, "Targets")}
      />
    </Field.Field>
    <Field.Field>
      {@render sliderRow(
        t(locale, "Distractors"),
        String(settings.distractorCount)
      )}
      <Slider
        bind:value={
          actions.distractorCountSlider.value, actions.distractorCountSlider.set
        }
        min={trainerSettingBounds.distractorCount.min}
        max={trainerSettingBounds.distractorCount.max}
        step={1}
        aria-label={t(locale, "Distractors")}
      />
    </Field.Field>
  </div>
{/if}

<Field.Field>
  <Field.Label
    class="bg-input/50 hover:ring-ring/30 focus-within:ring-foreground flex h-11 min-w-0 cursor-pointer items-center gap-3 rounded-full border px-3 transition-[color,box-shadow,background-color] focus-within:ring-3 hover:ring-4"
    for="trainer-color"
  >
    <svg
      viewBox="0 0 24 24"
      class="size-6 shrink-0 rounded-full border shadow-sm"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill={settings.ballColor} />
    </svg>
    <span class="text-foreground min-w-0 truncate font-sans text-sm uppercase">
      {settings.ballColor}
    </span>
    <Input
      id="trainer-color"
      class="sr-only"
      type="color"
      value={settings.ballColor}
      oninput={actions.handleColorInput}
      aria-label={t(locale, "Ball color")}
    />
  </Field.Label>
</Field.Field>

{#if isMotMode}
  <Field.Field>
    {@render sliderRow(
      t(locale, "Distractor color"),
      `${Math.round(settings.distractorBrightness * 100)}%`
    )}
    <Slider
      bind:value={
        actions.distractorBrightnessSlider.value,
        actions.distractorBrightnessSlider.set
      }
      min={trainerSettingBounds.distractorBrightness.min}
      max={trainerSettingBounds.distractorBrightness.max}
      step={0.01}
      aria-label={t(locale, "Distractor color brightness")}
    />
  </Field.Field>
{/if}

<Field.Field>
  {@render sliderRow(
    t(locale, "Opacity"),
    `${Math.round(settings.targetOpacity * 100)}%`
  )}
  <Slider
    bind:value={actions.opacitySlider.value, actions.opacitySlider.set}
    min={trainerSettingBounds.targetOpacity.min}
    max={trainerSettingBounds.targetOpacity.max}
    step={0.01}
    aria-label={t(locale, "Target opacity")}
  />
</Field.Field>

<Field.Field>
  <Field.Label for="trainer-shape">{t(locale, "Target form")}</Field.Label>
  <Select.Root
    type="single"
    value={settings.targetForm}
    onValueChange={actions.handleTargetFormChange}
  >
    <Select.Trigger
      id="trainer-shape"
      class="w-full"
      aria-label={t(locale, "Target form")}
    >
      {currentTargetFormName}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each targetFormOptions as option (option.id)}
          <Select.Item value={option.id}>{t(locale, option.name)}</Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</Field.Field>

<Field.Field>
  {@render sliderRow(
    t(locale, "Size"),
    `${Math.round(settings.baseRadiusPx)} px`
  )}
  <Slider
    bind:value={actions.sizeSlider.value, actions.sizeSlider.set}
    min={trainerSettingBounds.baseRadiusPx.min}
    max={trainerSettingBounds.baseRadiusPx.max}
    step={1}
    aria-label={t(locale, "Target size")}
  />
</Field.Field>

<TrainerLetterControls bind:settings {actions} {sliderRow} />

<script lang="ts">
  import TrainerLetterControls from "$lib/components/trainer/trainer-letter-controls.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import {
    getLilacChaserColorName,
    targetFormOptions,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";

  import SettingsSliderRow from "./settings-slider-row.svelte";
  import {
    settingsColorClass,
    settingsColorValueClass,
    settingsRowClass,
    settingsRowsClass,
    settingsSectionClass,
  } from "./settings-styles";
  import TrainerHudColorSelectOptions from "./trainer-hud-color-select-options.svelte";
  import TrainerTargetGlyph from "./trainer-target-glyph.svelte";

  interface Props {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    ballColor: string;
    isMotMode: boolean;
    isLilacChaserMode: boolean;
  }

  let {
    actions,
    settings = $bindable(),
    ballColor,
    isMotMode,
    isLilacChaserMode,
  }: Props = $props();

  let locale = $derived(languageState.locale);
  let currentLilacChaserColorName = $derived(
    t(locale, getLilacChaserColorName(settings.lilacChaserBallColor))
  );
</script>

<Field.FieldSet
  class={settingsSectionClass}
  aria-label={t(locale, "Appearance")}
>
  <Field.FieldGroup class={settingsRowsClass}>
    {#if isLilacChaserMode}
      <Field.Field class={settingsRowClass}>
        <Field.Label for="lilac-chaser-color"
          >{t(locale, "Ball color")}</Field.Label
        >
        <Select.Root
          type="single"
          value={settings.lilacChaserBallColor}
          onValueChange={actions.handleLilacChaserColorChange}
        >
          <Select.Trigger
            id="lilac-chaser-color"
            class="min-h-11 w-full"
            aria-label={t(locale, "Lilac Chaser ball color")}
            >{currentLilacChaserColorName}</Select.Trigger
          >
          <Select.Content
            ><TrainerHudColorSelectOptions {locale} /></Select.Content
          >
        </Select.Root>
      </Field.Field>
      <SettingsSliderRow
        label={t(locale, "Scale")}
        valueLabel={`${settings.lilacChaserScale.toFixed(2)}x`}
        ariaLabel={t(locale, "Lilac Chaser scale")}
        slider={actions.lilacChaserScaleSlider}
        min={trainerSettingBounds.lilacChaserScale.min}
        max={trainerSettingBounds.lilacChaserScale.max}
        step={0.05}
      />
    {:else}
      <Field.Field class={settingsRowClass}>
        <Field.Label for="trainer-color">{t(locale, "Ball color")}</Field.Label>
        <label class={settingsColorClass} for="trainer-color">
          <span
            class="size-6 shrink-0"
            style:color={ballColor}
            style:opacity={settings.targetOpacity}
            aria-hidden="true"
          >
            <TrainerTargetGlyph form={settings.targetForm} filled />
          </span>
          <span class={settingsColorValueClass}>{ballColor}</span>
          <Input
            id="trainer-color"
            class="sr-only"
            type="color"
            value={ballColor}
            oninput={actions.handleColorInput}
            aria-label={t(locale, "Ball color")}
          />
        </label>
      </Field.Field>
      <Field.Field class={settingsRowClass}>
        <Field.Label id="trainer-shape-label"
          >{t(locale, "Target form")}</Field.Label
        >
        <ToggleGroup.Root
          class="grid w-full grid-cols-6"
          type="single"
          bind:value={() => settings.targetForm, actions.handleTargetFormChange}
          aria-labelledby="trainer-shape-label"
          variant="outline"
        >
          {#each targetFormOptions as option (option.id)}
            <ToggleGroup.Item
              value={option.id}
              class="min-h-11 px-0"
              aria-label={t(locale, option.name)}
              title={t(locale, option.name)}
            >
              <span class="size-5"><TrainerTargetGlyph form={option.id} /></span
              >
            </ToggleGroup.Item>
          {/each}
        </ToggleGroup.Root>
      </Field.Field>
      <SettingsSliderRow
        label={t(locale, "Size")}
        valueLabel={`${Math.round(settings.baseRadiusPx)} px`}
        ariaLabel={t(locale, "Target size")}
        slider={actions.sizeSlider}
        min={trainerSettingBounds.baseRadiusPx.min}
        max={trainerSettingBounds.baseRadiusPx.max}
        step={1}
      />
      <SettingsSliderRow
        label={t(locale, "Opacity")}
        valueLabel={`${Math.round(settings.targetOpacity * 100)}%`}
        ariaLabel={t(locale, "Target opacity")}
        slider={actions.opacitySlider}
        min={trainerSettingBounds.targetOpacity.min}
        max={trainerSettingBounds.targetOpacity.max}
        step={0.01}
      />
      <TrainerLetterControls bind:settings {actions} {ballColor} />
    {/if}
  </Field.FieldGroup>
</Field.FieldSet>
{#if isMotMode}
  <Field.FieldSet class={settingsSectionClass}>
    <Field.Legend variant="label">{t(locale, "Distractions")}</Field.Legend>
    <Field.FieldGroup class={settingsRowsClass}>
      <SettingsSliderRow
        label={t(locale, "Targets")}
        valueLabel={String(settings.targetCount)}
        ariaLabel={t(locale, "Targets")}
        slider={actions.targetCountSlider}
        min={trainerSettingBounds.targetCount.min}
        max={trainerSettingBounds.targetCount.max}
        step={1}
      />
      <SettingsSliderRow
        label={t(locale, "Distractors")}
        valueLabel={String(settings.distractorCount)}
        ariaLabel={t(locale, "Distractors")}
        slider={actions.distractorCountSlider}
        min={trainerSettingBounds.distractorCount.min}
        max={trainerSettingBounds.distractorCount.max}
        step={1}
      />
      <SettingsSliderRow
        label={t(locale, "Distractor color")}
        valueLabel={`${Math.round(settings.distractorBrightness * 100)}%`}
        ariaLabel={t(locale, "Distractor color brightness")}
        slider={actions.distractorBrightnessSlider}
        min={trainerSettingBounds.distractorBrightness.min}
        max={trainerSettingBounds.distractorBrightness.max}
        step={0.01}
      />
    </Field.FieldGroup>
  </Field.FieldSet>
{/if}

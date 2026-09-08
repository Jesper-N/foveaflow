<script lang="ts">
  import TrainerLetterControls from "$lib/components/trainer/trainer-letter-controls.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
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
  import type { Snippet } from "svelte";

  import {
    settingsSectionClass,
    settingsColumnsClass,
    settingsColorClass,
  } from "./settings-styles";
  import TrainerHudColorSelectOptions from "./trainer-hud-color-select-options.svelte";
  import TrainerTargetGlyph from "./trainer-target-glyph.svelte";

  interface Props {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    ballColor: string;
    isMotMode: boolean;
    isLilacChaserMode: boolean;
    sliderRow: Snippet<[string, string]>;
  }

  let {
    actions,
    settings = $bindable(),
    ballColor,
    isMotMode,
    isLilacChaserMode,
    sliderRow,
  }: Props = $props();

  let locale = $derived(languageState.locale);
  let currentLilacChaserColorName = $derived(
    t(locale, getLilacChaserColorName(settings.lilacChaserBallColor))
  );
</script>

<Field.FieldSet class={settingsSectionClass}>
  <Field.Legend>{t(locale, "Appearance")}</Field.Legend>
  {#if isLilacChaserMode}
    <Field.FieldGroup>
      <Field.Field>
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
      <Field.Field>
        {@render sliderRow(
          t(locale, "Scale"),
          `${settings.lilacChaserScale.toFixed(2)}x`
        )}
        <Slider
          bind:value={
            actions.lilacChaserScaleSlider.value,
            actions.lilacChaserScaleSlider.set
          }
          min={trainerSettingBounds.lilacChaserScale.min}
          max={trainerSettingBounds.lilacChaserScale.max}
          step={0.05}
          aria-label={t(locale, "Lilac Chaser scale")}
        />
      </Field.Field>
    </Field.FieldGroup>
  {:else}
    <Field.Field>
      <Field.Label for="trainer-color">{t(locale, "Ball color")}</Field.Label>
      <label class={settingsColorClass} for="trainer-color">
        <span
          class="size-5 shrink-0"
          style:color={ballColor}
          style:opacity={settings.targetOpacity}
          aria-hidden="true"
        >
          <TrainerTargetGlyph form={settings.targetForm} filled />
        </span>
        <span class="truncate font-mono text-xs uppercase">{ballColor}</span>
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
    <Field.Field>
      <Field.Label id="trainer-shape-label"
        >{t(locale, "Target form")}</Field.Label
      >
      <ToggleGroup.Root
        class="grid w-full grid-cols-6 max-[640px]:grid-cols-3"
        spacing={2}
        type="single"
        bind:value={() => settings.targetForm, actions.handleTargetFormChange}
        aria-labelledby="trainer-shape-label"
        variant="outline"
      >
        {#each targetFormOptions as option (option.id)}
          <ToggleGroup.Item
            value={option.id}
            class="aria-checked:inset-ring-ring h-auto min-h-18 flex-col gap-2 rounded-[0.75rem] px-1 py-3 wrap-anywhere whitespace-normal aria-checked:inset-ring"
            aria-label={t(locale, option.name)}
          >
            <span class="size-6"><TrainerTargetGlyph form={option.id} /></span>
            <span class="text-xs">{t(locale, option.name)}</span>
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </Field.Field>
    <Field.FieldGroup class={settingsColumnsClass}>
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
    </Field.FieldGroup>
  {/if}
</Field.FieldSet>
{#if !isLilacChaserMode}
  <TrainerLetterControls bind:settings {actions} {sliderRow} />
{/if}
{#if isMotMode}
  <Field.FieldSet class={settingsSectionClass}
    ><Field.Legend>{t(locale, "Distractions")}</Field.Legend><Field.FieldGroup
      class={settingsColumnsClass}
    >
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
            actions.distractorCountSlider.value,
            actions.distractorCountSlider.set
          }
          min={trainerSettingBounds.distractorCount.min}
          max={trainerSettingBounds.distractorCount.max}
          step={1}
          aria-label={t(locale, "Distractors")}
        />
      </Field.Field>
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
    </Field.FieldGroup>
  </Field.FieldSet>
{/if}

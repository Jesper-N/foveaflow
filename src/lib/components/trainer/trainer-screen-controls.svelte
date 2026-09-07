<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import { trainerSettingBounds } from "$lib/trainer/settings";

  import {
    settingsSectionClass,
    settingsColumnsClass,
  } from "./settings-styles";

  let {
    actions,
    settings,
    isLilacChaserMode,
    isDarkMode,
  }: {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    isDarkMode: boolean;
  } = $props();

  const handleViewingDistanceInput = (event: Event) => {
    actions.handleCalibrationInput(event, "viewingDistanceCm");
  };

  const handleCssPixelsPerCmInput = (event: Event) => {
    actions.handleCalibrationInput(event, "cssPxPerCm");
  };

  let locale = $derived(languageState.locale);
</script>

<Field.FieldSet class={settingsSectionClass}>
  <Field.Legend>{t(locale, "Appearance")}</Field.Legend>
  <Field.Field
    orientation="horizontal"
    class="flex min-h-11 flex-wrap items-center justify-between gap-6"
  >
    <Field.Label for="trainer-theme">{t(locale, "Dark mode")}</Field.Label>
    <Switch
      id="trainer-theme"
      checked={isDarkMode}
      onCheckedChange={actions.handleThemeCheckedChange}
      aria-label={t(locale, "Use dark theme")}
    />
  </Field.Field>
</Field.FieldSet>
{#if !isLilacChaserMode}
  <Field.FieldSet class={settingsSectionClass}>
    <Field.Legend>{t(locale, "Calibration")}</Field.Legend>
    <Field.Description
      >{t(
        locale,
        "Used to calculate speed in deg/s and cm/s."
      )}</Field.Description
    >
    <Field.FieldGroup class={settingsColumnsClass}>
      <Field.Field>
        <Field.Label for="trainer-distance"
          >{t(locale, "Viewing distance")}
          <span class="text-muted-foreground">(cm)</span></Field.Label
        >
        <Input
          class="min-h-11"
          id="trainer-distance"
          type="number"
          min={trainerSettingBounds.viewingDistanceCm.min}
          max={trainerSettingBounds.viewingDistanceCm.max}
          value={settings.calibration.viewingDistanceCm}
          oninput={handleViewingDistanceInput}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="trainer-css-px-cm"
          >{t(locale, "CSS pixels/cm")}</Field.Label
        >
        <Input
          class="min-h-11"
          id="trainer-css-px-cm"
          type="number"
          min={trainerSettingBounds.cssPxPerCm.min}
          max={trainerSettingBounds.cssPxPerCm.max}
          step="0.1"
          value={settings.calibration.cssPxPerCm}
          oninput={handleCssPixelsPerCmInput}
        />
      </Field.Field>
    </Field.FieldGroup>
  </Field.FieldSet>
{/if}

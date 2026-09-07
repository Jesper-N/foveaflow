<script lang="ts">
  import ModePathPreview from "$lib/components/mode-path-preview.svelte";
  import TrainerPatternSelectGroups from "$lib/components/trainer/trainer-pattern-select-groups.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { exercisePresets } from "$lib/engine/presets";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import { getPatternName, getPresetName } from "$lib/trainer/options";

  import {
    settingsSectionClass,
    settingsColumnsClass,
  } from "./settings-styles";

  let {
    actions,
    settings,
    patternSelectContentClass,
  }: {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    patternSelectContentClass: string;
  } = $props();

  let locale = $derived(languageState.locale);
  let currentPresetName = $derived(t(locale, getPresetName(settings.presetId)));
  let currentPatternName = $derived(
    t(locale, getPatternName(settings.patternId))
  );
</script>

<Field.FieldSet class={settingsSectionClass} aria-label={t(locale, "Drill")}>
  <Field.FieldGroup class={settingsColumnsClass}>
    <Field.Field>
      <Field.Label for="trainer-mode">{t(locale, "Drill")}</Field.Label>
      <Select.Root
        type="single"
        value={settings.presetId}
        onValueChange={actions.handlePresetChange}
      >
        <Select.Trigger
          id="trainer-mode"
          class="min-h-11 w-full"
          aria-label={t(locale, "Drill")}
        >
          {currentPresetName}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each exercisePresets as preset (preset.id)}
              <Select.Item value={preset.id}>
                <span class="flex min-w-0 items-center gap-2">
                  <ModePathPreview mode={preset.id} />
                  <span class="truncate">{t(locale, preset.name)}</span>
                </span>
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Field.Field>

    {#if settings.presetId === "pursuit"}
      <Field.Field>
        <Field.Label for="trainer-pattern"
          >{t(locale, "Motion path")}</Field.Label
        >
        <Select.Root
          type="single"
          value={settings.patternId}
          onValueChange={actions.handlePatternChange}
        >
          <Select.Trigger
            id="trainer-pattern"
            class="min-h-11 w-full"
            aria-label={t(locale, "Motion path")}
          >
            {currentPatternName}
          </Select.Trigger>
          <Select.Content class={patternSelectContentClass}>
            <TrainerPatternSelectGroups />
          </Select.Content>
        </Select.Root>
      </Field.Field>
    {/if}
  </Field.FieldGroup>
</Field.FieldSet>

<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { behaviorOptions } from "$lib/trainer/behavior";
  import type { BehaviorId } from "$lib/trainer/behavior";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import { getBehaviorName } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";

  import SettingsSliderRow from "./settings-slider-row.svelte";
  import {
    settingsRowClass,
    settingsRowsClass,
    settingsSectionClass,
    settingsSwitchRowClass,
  } from "./settings-styles";

  let {
    actions,
    behaviorValue,
    settings = $bindable(),
    isLilacChaserMode,
    canToggleDirection,
  }: {
    actions: TrainerDialogActions;
    behaviorValue: BehaviorId;
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    canToggleDirection: boolean;
  } = $props();
  let locale = $derived(languageState.locale);
  let currentBehaviorName = $derived(t(locale, getBehaviorName(behaviorValue)));
  let motionDirectionValue = $derived(
    settings.motionDirection === 1 ? "forward" : "reverse"
  );
</script>

{#if !isLilacChaserMode}
  <Field.FieldSet class={settingsSectionClass}>
    <Field.Legend variant="label">{t(locale, "Motion")}</Field.Legend>
    <Field.FieldGroup class={settingsRowsClass}>
      <Field.Field class={settingsRowClass}>
        <Field.Label for="trainer-behavior"
          >{t(locale, "Motion feel")}</Field.Label
        >
        <Select.Root
          type="single"
          value={behaviorValue}
          onValueChange={actions.handleBehaviorChange}
        >
          <Select.Trigger
            id="trainer-behavior"
            class="min-h-11 w-full"
            aria-label={t(locale, "Motion feel")}
          >
            {currentBehaviorName}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each behaviorOptions as option (option.id)}
                <Select.Item value={option.id}
                  >{t(locale, option.name)}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Field.Field>
      <SettingsSliderRow
        label={t(locale, "Speed")}
        valueLabel={String(settings.speed)}
        ariaLabel={t(locale, "Speed")}
        slider={actions.speedSlider}
        min={trainerSettingBounds.speed.min}
        max={trainerSettingBounds.speed.max}
        step={1}
      />
      {#if canToggleDirection}
        <Field.Field class={settingsRowClass}>
          <Field.Label id="trainer-direction-label"
            >{t(locale, "Direction")}</Field.Label
          >
          <ToggleGroup.Root
            type="single"
            class="grid w-full grid-cols-2"
            bind:value={
              () => motionDirectionValue, actions.handleMotionDirectionChange
            }
            variant="outline"
            aria-labelledby="trainer-direction-label"
          >
            <ToggleGroup.Item value="forward" class="min-h-11"
              >{t(locale, "Forward")}</ToggleGroup.Item
            >
            <ToggleGroup.Item value="reverse" class="min-h-11"
              >{t(locale, "Reverse")}</ToggleGroup.Item
            >
          </ToggleGroup.Root>
        </Field.Field>
        <Field.Field orientation="horizontal" class={settingsSwitchRowClass}>
          <Field.Label for="trainer-show-trail"
            >{t(locale, "Show trail")}</Field.Label
          >
          <Switch id="trainer-show-trail" bind:checked={settings.showTrail} />
        </Field.Field>
      {/if}
    </Field.FieldGroup>
  </Field.FieldSet>
{/if}

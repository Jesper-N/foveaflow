<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { behaviorOptions } from "$lib/trainer/behavior";
  import type { BehaviorId } from "$lib/trainer/behavior";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import {
    getBehaviorName,
    maxSpeedByUnit,
    minSpeedByUnit,
    speedDecimalPlacesByUnit,
    speedSliderStepByUnit,
  } from "$lib/trainer/options";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import type { Snippet } from "svelte";

  import { settingsSectionClass } from "./settings-styles";

  let {
    actions,
    behaviorValue,
    settings = $bindable(),
    sliderRow,
    isLilacChaserMode,
    canToggleDirection,
    motionDirectionLabel,
  }: {
    actions: TrainerDialogActions;
    behaviorValue: BehaviorId;
    settings: TrainerSettings;
    sliderRow: Snippet<[string, string]>;
    isLilacChaserMode: boolean;
    canToggleDirection: boolean;
    motionDirectionLabel: string;
  } = $props();
  let locale = $derived(languageState.locale);
  let currentBehaviorName = $derived(t(locale, getBehaviorName(behaviorValue)));
</script>

{#if !isLilacChaserMode}
  <Field.FieldSet class={settingsSectionClass}>
    <Field.Legend>{t(locale, "Motion")}</Field.Legend>
    <Field.FieldGroup class="gap-4">
      <Field.Field>
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
      <Field.Field>
        {@render sliderRow(
          t(locale, "Speed"),
          `${settings.speed.value.toFixed(speedDecimalPlacesByUnit[settings.speed.unit])} ${settings.speed.unit}`
        )}
        <Slider
          bind:value={actions.speedSlider.value, actions.speedSlider.set}
          min={minSpeedByUnit[settings.speed.unit]}
          max={maxSpeedByUnit[settings.speed.unit]}
          step={speedSliderStepByUnit[settings.speed.unit]}
          aria-label={t(locale, "Speed")}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label id="trainer-speed-unit">{t(locale, "Unit")}</Field.Label>
        <ToggleGroup.Root
          type="single"
          bind:value={() => settings.speed.unit, actions.handleSpeedUnitChange}
          variant="outline"
          aria-labelledby="trainer-speed-unit"
        >
          <ToggleGroup.Item value="deg/s" class="min-h-11"
            >deg/s</ToggleGroup.Item
          >
          <ToggleGroup.Item value="cm/s" class="min-h-11">cm/s</ToggleGroup.Item
          >
          <ToggleGroup.Item value="screen/s" class="min-h-11"
            >screen/s</ToggleGroup.Item
          >
        </ToggleGroup.Root>
      </Field.Field>
      {#if canToggleDirection}
        <Field.Field
          orientation="horizontal"
          class="flex min-h-11 flex-wrap items-center justify-between gap-6"
        >
          <Field.Label>{t(locale, "Direction")}</Field.Label>
          <Button
            variant="outline"
            class="min-h-11"
            aria-describedby="trainer-motion-status"
            onclick={actions.toggleMotionDirection}
          >
            <ArrowLeftRightIcon
              data-icon="inline-start"
            />{motionDirectionLabel}
          </Button>
        </Field.Field>
        <Field.Field
          orientation="horizontal"
          class="flex min-h-11 flex-wrap items-center justify-between gap-6"
        >
          <Field.Label for="trainer-show-trail"
            >{t(locale, "Show trail")}</Field.Label
          >
          <Switch id="trainer-show-trail" bind:checked={settings.showTrail} />
        </Field.Field>
      {/if}
    </Field.FieldGroup>
  </Field.FieldSet>
{/if}

<script lang="ts">
  import DrillIcon from "$lib/components/drills/drill-icon.svelte";
  import PatternIcon from "$lib/components/drills/pattern-icon.svelte";
  import * as Field from "$lib/components/ui/field";
  import * as Select from "$lib/components/ui/select";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { t } from "$lib/i18n/translate";
  import { behaviors, getBehaviorName } from "$lib/trainer/settings/behaviors";
  import { getDrill } from "$lib/trainer/settings/drills";
  import { getPatternName } from "$lib/trainer/settings/patterns";

  import DrillSelectContent from "../selects/drill-select-content.svelte";
  import OptionLabel from "../selects/option-label.svelte";
  import PatternSelectContent from "../selects/pattern-select-content.svelte";
  import { getTrainer } from "../trainer-context";
  import SettingsRow from "./settings-row.svelte";
  import SettingsSection from "./settings-section.svelte";
  import SliderRow from "./slider-row.svelte";
  import SwitchRow from "./switch-row.svelte";

  const trainer = getTrainer();
</script>

<SettingsSection label={t("Drill")}>
  <SettingsRow>
    <Field.FieldLabel for="trainer-drill">{t("Drill")}</Field.FieldLabel>
    <Select.Root
      type="single"
      value={trainer.settings.drillId}
      onValueChange={trainer.selectDrill}
    >
      <Select.Trigger id="trainer-drill" class="min-h-11 w-full">
        <OptionLabel label={t(getDrill(trainer.settings.drillId).name)}>
          <DrillIcon drillId={trainer.settings.drillId} />
        </OptionLabel>
      </Select.Trigger>
      <DrillSelectContent />
    </Select.Root>
  </SettingsRow>

  {#if trainer.isPursuit}
    <SettingsRow>
      <Field.FieldLabel for="trainer-pattern">
        {t("Motion path")}
      </Field.FieldLabel>
      <Select.Root
        type="single"
        value={trainer.settings.patternId}
        onValueChange={trainer.selectPattern}
      >
        <Select.Trigger id="trainer-pattern" class="min-h-11 w-full">
          <OptionLabel label={t(getPatternName(trainer.settings.patternId))}>
            <PatternIcon patternId={trainer.settings.patternId} />
          </OptionLabel>
        </Select.Trigger>
        <PatternSelectContent />
      </Select.Root>
    </SettingsRow>
  {/if}
</SettingsSection>

<!-- Lilac Chaser does not move, so it has no motion settings. -->
{#if !trainer.isLilacChaser}
  <SettingsSection legend={t("Motion")}>
    <SettingsRow>
      <Field.FieldLabel for="trainer-behavior">
        {t("Motion feel")}
      </Field.FieldLabel>
      <Select.Root
        type="single"
        value={trainer.behavior}
        onValueChange={trainer.selectBehavior}
      >
        <Select.Trigger id="trainer-behavior" class="min-h-11 w-full">
          {t(getBehaviorName(trainer.behavior))}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each behaviors as behavior (behavior.id)}
              <Select.Item value={behavior.id}>{t(behavior.name)}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </SettingsRow>

    <SliderRow setting="speed" label={t("Speed")} />

    {#if trainer.canReverse}
      <SettingsRow>
        <Field.FieldLabel id="trainer-direction-label">
          {t("Direction")}
        </Field.FieldLabel>
        <ToggleGroup.Root
          type="single"
          class="grid w-full grid-cols-2"
          bind:value={
            () =>
              trainer.settings.motionDirection === 1 ? "forward" : "reverse",
            trainer.setDirection
          }
          variant="outline"
          aria-labelledby="trainer-direction-label"
        >
          <ToggleGroup.Item value="forward" class="min-h-11">
            {t("Forward")}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="reverse" class="min-h-11">
            {t("Reverse")}
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </SettingsRow>
      <SwitchRow
        id="trainer-show-trail"
        label={t("Show trail")}
        bind:checked={trainer.settings.showTrail}
      />
    {/if}
  </SettingsSection>
{/if}

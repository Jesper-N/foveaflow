<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import * as Select from "$lib/components/ui/select";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { t } from "$lib/i18n/translate";
  import {
    getLilacChaserColorName,
    targetForms,
  } from "$lib/trainer/settings/options";

  import LilacColorSelectContent from "../selects/lilac-color-select-content.svelte";
  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import LetterSettings from "./letter-settings.svelte";
  import SettingsRow from "./settings-row.svelte";
  import SettingsSection from "./settings-section.svelte";
  import SliderRow from "./slider-row.svelte";
  import TargetGlyph from "./target-glyph.svelte";

  const trainer = getTrainer();
</script>

<SettingsSection label={t("Appearance")}>
  {#if trainer.isLilacChaser}
    <SettingsRow>
      <Field.FieldLabel for="trainer-lilac-color">
        {t("Ball color")}
      </Field.FieldLabel>
      <Select.Root
        type="single"
        value={trainer.settings.lilacChaserBallColor}
        onValueChange={trainer.setLilacChaserColor}
      >
        <Select.Trigger
          id="trainer-lilac-color"
          class="min-h-11 w-full"
          aria-label={t("Lilac Chaser ball color")}
        >
          {t(getLilacChaserColorName(trainer.settings.lilacChaserBallColor))}
        </Select.Trigger>
        <LilacColorSelectContent />
      </Select.Root>
    </SettingsRow>
    <SliderRow
      setting="lilacChaserScale"
      label={t("Scale")}
      sliderLabel={t("Lilac Chaser scale")}
    />
  {:else}
    <ColorRow
      id="trainer-color"
      label={t("Ball color")}
      value={trainer.targetColor}
      onValueChange={trainer.setBallColor}
    >
      {#snippet swatch()}
        <span
          class="size-6 shrink-0"
          style:color={trainer.targetColor}
          style:opacity={trainer.settings.targetOpacity}
          aria-hidden="true"
        >
          <TargetGlyph form={trainer.settings.targetForm} filled />
        </span>
      {/snippet}
    </ColorRow>
    <SettingsRow>
      <Field.FieldLabel id="trainer-shape-label">
        {t("Target form")}
      </Field.FieldLabel>
      <ToggleGroup.Root
        class="grid w-full grid-cols-6"
        type="single"
        bind:value={() => trainer.settings.targetForm, trainer.setTargetForm}
        aria-labelledby="trainer-shape-label"
        variant="outline"
      >
        {#each targetForms as form (form.id)}
          <ToggleGroup.Item
            value={form.id}
            class="min-h-11 px-0"
            aria-label={t(form.name)}
            title={t(form.name)}
          >
            <span class="size-5"><TargetGlyph form={form.id} /></span>
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </SettingsRow>
    <SliderRow
      setting="baseRadiusPx"
      label={t("Size")}
      sliderLabel={t("Target size")}
    />
    <SliderRow
      setting="targetOpacity"
      label={t("Opacity")}
      sliderLabel={t("Target opacity")}
    />
    <LetterSettings />
  {/if}
</SettingsSection>

{#if trainer.isDistractions}
  <SettingsSection legend={t("Distractions")}>
    <SliderRow setting="targetCount" label={t("Targets")} />
    <SliderRow setting="distractorCount" label={t("Distractors")} />
    <SliderRow
      setting="distractorBrightness"
      label={t("Distractor color")}
      sliderLabel={t("Distractor color brightness")}
    />
  </SettingsSection>
{/if}

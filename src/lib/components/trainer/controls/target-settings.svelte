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
        onValueChange={trainer.setLilacChaserColor}
        type="single"
        value={trainer.settings.lilacChaserBallColor}
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
      label={t("Scale")}
      setting="lilacChaserScale"
      sliderLabel={t("Lilac Chaser scale")}
    />
  {:else}
    <ColorRow
      id="trainer-color"
      label={t("Ball color")}
      onValueChange={trainer.setBallColor}
      value={trainer.targetColor}
    >
      {#snippet swatch()}
        <span class="size-6 shrink-0" aria-hidden="true">
          <TargetGlyph
            color={trainer.targetColor}
            filled
            form={trainer.settings.targetForm}
            opacity={trainer.settings.targetOpacity}
          />
        </span>
      {/snippet}
    </ColorRow>
    <SettingsRow>
      <Field.FieldLabel id="trainer-shape-label">
        {t("Target form")}
      </Field.FieldLabel>
      <ToggleGroup.Root
        class="grid w-full grid-cols-6"
        aria-labelledby="trainer-shape-label"
        type="single"
        variant="outline"
        bind:value={() => trainer.settings.targetForm, trainer.setTargetForm}
      >
        {#each targetForms as form (form.id)}
          <ToggleGroup.Item
            class="min-h-11 px-0"
            aria-label={t(form.name)}
            title={t(form.name)}
            value={form.id}
          >
            <span class="size-5"><TargetGlyph form={form.id} /></span>
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </SettingsRow>
    <SliderRow
      label={t("Size")}
      setting="baseRadiusPx"
      sliderLabel={t("Target size")}
    />
    <SliderRow
      label={t("Opacity")}
      setting="targetOpacity"
      sliderLabel={t("Target opacity")}
    />
    <LetterSettings />
  {/if}
</SettingsSection>

{#if trainer.isDistractions}
  <SettingsSection legend={t("Distractions")}>
    <SliderRow label={t("Targets")} setting="targetCount" />
    <SliderRow label={t("Distractors")} setting="distractorCount" />
    <SliderRow
      label={t("Distractor color")}
      setting="distractorBrightness"
      sliderLabel={t("Distractor color brightness")}
    />
  </SettingsSection>
{/if}

<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { targetForms } from "$lib/trainer/settings/options";

  import LilacColorOptions from "../selects/lilac-color-options.svelte";
  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import LetterSettings from "./letter-settings.svelte";
  import RadioGroup from "./radio-group.svelte";
  import SettingsRow from "./settings-row.svelte";
  import SettingsSection from "./settings-section.svelte";
  import SliderRow from "./slider-row.svelte";
  import TargetGlyph from "./target-glyph.svelte";

  const trainer = getTrainer();

  let formOptions = $derived(
    targetForms.map((form) => ({ label: t(form.name), value: form.id }))
  );
</script>

<SettingsSection label={t("Appearance")}>
  {#if trainer.isLilacChaser}
    <SettingsRow>
      <label for="trainer-lilac-color">{t("Ball color")}</label>
      <select
        id="trainer-lilac-color"
        class="min-h-11"
        aria-label={t("Lilac Chaser ball color")}
        onchange={(event) => {
          trainer.setLilacChaserColor(event.currentTarget.value);
        }}
        value={trainer.settings.lilacChaserBallColor}
      >
        <LilacColorOptions />
      </select>
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
    <RadioGroup
      name="trainer-target-form"
      legend={t("Target form")}
      onValueChange={trainer.setTargetForm}
      options={formOptions}
      value={trainer.settings.targetForm}
    >
      {#snippet item(form)}
        <span class="size-5" aria-hidden="true">
          <TargetGlyph {form} />
        </span>
      {/snippet}
    </RadioGroup>
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

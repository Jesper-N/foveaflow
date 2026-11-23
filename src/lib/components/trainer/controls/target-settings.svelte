<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { targetForms } from "$lib/trainer/settings/options";

  import LilacColorOptions from "../selects/lilac-color-options.svelte";
  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import LetterSettings from "./letter-settings.svelte";
  import RadioGroup from "./radio-group.svelte";
  import SettingsSection from "./settings-section.svelte";
  import SliderRow from "./slider-row.svelte";

  const trainer = getTrainer();

  let formOptions = $derived(
    targetForms.map((form) => ({ label: t(form.name), value: form.id }))
  );
</script>

<section aria-labelledby="trainer-target-settings">
  <h3 id="trainer-target-settings">{t("Targets")}</h3>
  <p>{t("Fine-tune what you follow.")}</p>

  {#if trainer.isLilacChaser}
    <div>
      <label for="trainer-lilac-color">{t("Ball color")}</label>
      <select
        id="trainer-lilac-color"
        aria-label={t("Lilac Chaser ball color")}
        onchange={(event) => {
          trainer.setLilacChaserColor(event.currentTarget.value);
        }}
        value={trainer.settings.lilacChaserBallColor}
      >
        <LilacColorOptions />
      </select>
    </div>
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
    />
    <RadioGroup
      name="trainer-target-form"
      legend={t("Target form")}
      onValueChange={trainer.setTargetForm}
      options={formOptions}
      value={trainer.settings.targetForm}
    />
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
</section>

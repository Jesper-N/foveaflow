<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { targetForms } from "$lib/trainer/settings/options";
  import { Radio, RadioGroup } from "@ui-sdk/svelte/radio";

  import TargetFormGlyph from "../../icons/target-form-glyph.svelte";
  import { pressable, settingsGroup } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import LetterSettings from "./letter-settings.svelte";
  import LilacColorSwatches from "./lilac-color-swatches.svelte";
  import SettingSlider from "./setting-slider.svelte";
  import SettingsIntro from "./settings-intro.svelte";

  const trainer = getTrainer();
</script>

<SettingsIntro>{t("Fine-tune what you follow.")}</SettingsIntro>

{#if trainer.isLilacChaser}
  <div class={settingsGroup}>
    <LilacColorSwatches />
    <SettingSlider
      label={t("Scale")}
      setting="lilacChaserScale"
      thumbLabel={t("Lilac Chaser scale")}
    />
  </div>
{:else}
  <div class={settingsGroup}>
    <ColorRow
      id="trainer-color"
      label={t("Ball color")}
      onValueChange={trainer.setBallColor}
      value={trainer.targetColor}
    />
    <div class="grid gap-2">
      <span id="trainer-target-form" class="text-md font-medium">
        {t("Target form")}
      </span>
      <RadioGroup
        class="grid grid-cols-6 gap-1"
        aria-labelledby="trainer-target-form"
        onValueChange={(value) => {
          if (typeof value === "string") {
            trainer.setTargetForm(value);
          }
        }}
        value={trainer.settings.targetForm}
      >
        {#each targetForms as form (form.id)}
          <Radio
            class={[
              "text-2xs text-muted-foreground hover:bg-fill-hover hover:text-foreground data-checked:bg-primary data-checked:text-primary-foreground grid cursor-pointer justify-items-center gap-1 rounded-xl py-2 font-medium",
              pressable,
            ]}
            value={form.id}
          >
            <TargetFormGlyph class="size-5" form={form.id} />
            <span class="max-w-full truncate px-0.5">{t(form.name)}</span>
          </Radio>
        {/each}
      </RadioGroup>
    </div>
    <SettingSlider
      label={t("Size")}
      setting="baseRadiusPx"
      thumbLabel={t("Target size")}
    />
    <SettingSlider
      label={t("Opacity")}
      setting="targetOpacity"
      thumbLabel={t("Target opacity")}
    />
  </div>
  <div class={settingsGroup}>
    <LetterSettings />
  </div>
{/if}

{#if trainer.isDistractions}
  <section class={settingsGroup} aria-labelledby="trainer-distraction-settings">
    <h3
      id="trainer-distraction-settings"
      class="text-muted-foreground text-sm font-medium"
    >
      {t("Distractions")}
    </h3>
    <SettingSlider label={t("Targets")} setting="targetCount" />
    <SettingSlider label={t("Distractors")} setting="distractorCount" />
    <SettingSlider
      label={t("Distractor color")}
      setting="distractorBrightness"
      thumbLabel={t("Distractor color brightness")}
    />
  </section>
{/if}

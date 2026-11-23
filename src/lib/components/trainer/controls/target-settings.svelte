<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { targetForms } from "$lib/trainer/settings/options";
  import {
    BlendIcon,
    CircleDashedIcon,
    PaletteIcon,
    ScalingIcon,
    SunDimIcon,
    TargetIcon,
    TriangleIcon,
  } from "@lucide/svelte";
  import { Radio, RadioGroup } from "@ui-sdk/svelte/radio";

  import TargetFormGlyph from "../../icons/target-form-glyph.svelte";
  import ColorField from "../../ui/color-field.svelte";
  import { followIndicator } from "../../ui/follow-indicator";
  import RowLabel from "../../ui/row-label.svelte";
  import { pressable } from "../../ui/styles";
  import { ballColorPresets } from "../select-options";
  import { getTrainer } from "../trainer-context";
  import LetterSettings from "./letter-settings.svelte";
  import LilacColorSwatches from "./lilac-color-swatches.svelte";
  import SettingSlider from "./setting-slider.svelte";
  import SettingsSection from "./settings-section.svelte";
  import TargetPreview from "./target-preview.svelte";

  const trainer = getTrainer();

  const followChecked = followIndicator({
    axis: "x",
    item: "[role='radio'][data-checked]",
    watch: "data-checked",
  });
</script>

{#if trainer.isLilacChaser}
  <SettingsSection id="trainer-lilac-settings">
    <LilacColorSwatches icon />
    <SettingSlider
      icon={ScalingIcon}
      label={t("Scale")}
      setting="lilacChaserScale"
      thumbLabel={t("Lilac Chaser scale")}
    />
  </SettingsSection>
{:else}
  <TargetPreview />
  <SettingsSection id="trainer-target-settings">
    <ColorField
      icon={PaletteIcon}
      label={t("Ball color")}
      onValueChange={trainer.setBallColor}
      presets={ballColorPresets}
      value={trainer.targetColor}
    />
    <div class="grid gap-3" data-setting-row>
      <span id="trainer-target-form" class="text-md font-medium">
        <RowLabel icon={TriangleIcon} label={t("Target form")} />
      </span>
      <RadioGroup
        class="relative grid grid-cols-6 gap-1"
        {@attach followChecked}
        aria-labelledby="trainer-target-form"
        onValueChange={(value) => {
          if (typeof value === "string") {
            trainer.setTargetForm(value);
          }
        }}
        value={trainer.settings.targetForm}
      >
        <span
          class="bg-primary stretch-indicator pointer-events-none absolute inset-y-0 rounded-xl opacity-0"
          aria-hidden="true"
          data-indicator
        ></span>
        {#each targetForms as form (form.id)}
          <Radio
            class={[
              "group/form text-2xs text-muted-foreground hover:text-foreground not-data-checked:hover:bg-fill data-checked:text-primary-foreground relative z-1 grid cursor-pointer justify-items-center gap-1 rounded-xl py-2 font-medium transition-colors duration-160 ease-out data-checked:delay-100",
              pressable,
            ]}
            value={form.id}
          >
            <TargetFormGlyph
              class="ease-spring size-5 transition-[scale] duration-260 group-data-checked/form:scale-115"
              form={form.id}
            />
            <span class="max-w-full truncate px-0.5">{t(form.name)}</span>
          </Radio>
        {/each}
      </RadioGroup>
    </div>
    <SettingSlider
      icon={ScalingIcon}
      label={t("Size")}
      setting="baseRadiusPx"
      thumbLabel={t("Target size")}
    />
    <SettingSlider
      icon={BlendIcon}
      label={t("Opacity")}
      setting="targetOpacity"
      thumbLabel={t("Target opacity")}
    />
  </SettingsSection>
  <SettingsSection id="trainer-letter-settings">
    <LetterSettings />
  </SettingsSection>
{/if}

{#if trainer.isDistractions}
  <SettingsSection id="trainer-distraction-settings" title={t("Distractions")}>
    <SettingSlider
      icon={TargetIcon}
      label={t("Targets")}
      setting="targetCount"
    />
    <SettingSlider
      icon={CircleDashedIcon}
      label={t("Distractors")}
      setting="distractorCount"
    />
    <SettingSlider
      icon={SunDimIcon}
      label={t("Distractor color")}
      setting="distractorBrightness"
      thumbLabel={t("Distractor color brightness")}
    />
  </SettingsSection>
{/if}

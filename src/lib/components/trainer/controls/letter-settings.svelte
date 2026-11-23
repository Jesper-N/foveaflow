<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import {
    ALargeSmallIcon,
    BoldIcon,
    PaletteIcon,
    TypeIcon,
  } from "@lucide/svelte";

  import ColorField from "../../ui/color-field.svelte";
  import Select from "../../ui/select.svelte";
  import Switch from "../../ui/switch.svelte";
  import { letterColorPresets, letterWeightGroups } from "../select-options";
  import { getTrainer } from "../trainer-context";
  import SettingSlider from "./setting-slider.svelte";

  const trainer = getTrainer();
</script>

<Switch
  icon={TypeIcon}
  label={t("Show target letters")}
  bind:checked={trainer.settings.letterEnabled}
/>

{#if trainer.settings.letterEnabled}
  <ColorField
    icon={PaletteIcon}
    label={t("Letter color")}
    onValueChange={trainer.setLetterColor}
    presets={letterColorPresets}
    value={trainer.settings.letterColor}
  />
  <Select
    groups={letterWeightGroups()}
    label={t("Weight")}
    labelIcon={BoldIcon}
    onValueChange={trainer.setLetterWeight}
    triggerLabel={t("Letter weight")}
    value={String(trainer.settings.letterWeight)}
  />
  <SettingSlider
    icon={ALargeSmallIcon}
    label={t("Text size")}
    setting="letterScale"
    thumbLabel={t("Letter text size")}
  />
{/if}

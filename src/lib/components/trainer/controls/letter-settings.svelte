<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import Select from "../../ui/select.svelte";
  import Switch from "../../ui/switch.svelte";
  import { letterWeightGroups } from "../select-options";
  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import SettingSlider from "./setting-slider.svelte";

  const trainer = getTrainer();
</script>

<Switch
  label={t("Show target letters")}
  bind:checked={trainer.settings.letterEnabled}
/>

{#if trainer.settings.letterEnabled}
  <ColorRow
    id="trainer-letter-color"
    label={t("Letter color")}
    onValueChange={trainer.setLetterColor}
    value={trainer.settings.letterColor}
  />
  <Select
    groups={letterWeightGroups()}
    label={t("Weight")}
    onValueChange={trainer.setLetterWeight}
    triggerLabel={t("Letter weight")}
    value={String(trainer.settings.letterWeight)}
  />
  <SettingSlider
    label={t("Text size")}
    setting="letterScale"
    thumbLabel={t("Letter text size")}
  />
{/if}

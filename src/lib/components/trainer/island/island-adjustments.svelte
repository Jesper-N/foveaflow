<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import LilacColorSwatches from "../controls/lilac-color-swatches.svelte";
  import SettingSlider from "../controls/setting-slider.svelte";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
</script>

{#if trainer.isLilacChaser}
  <LilacColorSwatches />
  <SettingSlider
    label={t("Scale")}
    mutedLabel
    setting="lilacChaserScale"
    thumbLabel={t("Lilac Chaser scale")}
  />
{:else}
  <SettingSlider
    label={t("Size")}
    mutedLabel
    setting="baseRadiusPx"
    thumbLabel={t("Header target size")}
  />
  <SettingSlider
    label={t("Speed")}
    mutedLabel
    setting="speed"
    thumbLabel={t("Header target speed")}
  />
{/if}

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
    setting="lilacChaserScale"
    thumbLabel={t("Lilac Chaser scale")}
  />
{:else}
  <SettingSlider
    label={t("Size")}
    setting="baseRadiusPx"
    thumbLabel={t("Header target size")}
    ticks={24}
  />
  <SettingSlider
    label={t("Speed")}
    setting="speed"
    thumbLabel={t("Header target speed")}
    ticks={24}
  />
{/if}

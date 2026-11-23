<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import SliderRow from "../controls/slider-row.svelte";
  import LilacColorOptions from "../selects/lilac-color-options.svelte";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
</script>

{#if trainer.isLilacChaser}
  <label>
    {t("Ball color")}
    <select
      aria-label={t("Lilac Chaser ball color")}
      onchange={(event) => {
        trainer.setLilacChaserColor(event.currentTarget.value);
      }}
      value={trainer.settings.lilacChaserBallColor}
    >
      <LilacColorOptions />
    </select>
  </label>
  <SliderRow
    label={t("Scale")}
    setting="lilacChaserScale"
    sliderLabel={t("Lilac Chaser scale")}
  />
{:else}
  <SliderRow
    label={t("Size")}
    setting="baseRadiusPx"
    sliderLabel={t("Header target size")}
  />
  <SliderRow
    label={t("Speed")}
    setting="speed"
    sliderLabel={t("Header target speed")}
  />
{/if}

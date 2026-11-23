<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import type { RangedSetting } from "$lib/trainer/settings/settings";

  import { formatSetting } from "../controls/format-setting";
  import SettingSlider from "../controls/setting-slider.svelte";
  import LilacColorOptions from "../selects/lilac-color-options.svelte";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
  const { hud } = trainer;
</script>

{#snippet slider(setting: RangedSetting, label: string, sliderLabel: string)}
  <div class="flex min-w-0 flex-col gap-1">
    <span class="flex justify-between gap-2">
      <span>{label}</span>
      <output>{formatSetting(setting, trainer.settings[setting])}</output>
    </span>
    <SettingSlider label={sliderLabel} {setting} />
  </div>
{/snippet}

<div class="grid grid-cols-2 gap-4">
  {#if trainer.isLilacChaser}
    <label class="flex min-w-0 flex-col gap-1">
      {t("Ball color")}
      <select
        class="min-h-11 min-w-0"
        aria-label={t("Lilac Chaser ball color")}
        onblur={hud.handleMenuBlur}
        onchange={(event) => {
          trainer.setLilacChaserColor(event.currentTarget.value);
        }}
        onfocus={hud.handleMenuFocus}
        value={trainer.settings.lilacChaserBallColor}
      >
        <LilacColorOptions />
      </select>
    </label>
    {@render slider("lilacChaserScale", t("Scale"), t("Lilac Chaser scale"))}
  {:else}
    {@render slider("baseRadiusPx", t("Size"), t("Header target size"))}
    {@render slider("speed", t("Speed"), t("Header target speed"))}
  {/if}
</div>

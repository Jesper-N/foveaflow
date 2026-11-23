<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";

  import { getTrainer } from "../trainer-context";
  import HudDrillSelects from "./hud-drill-selects.svelte";
  import HudQuickAdjustments from "./hud-quick-adjustments.svelte";

  const trainer = getTrainer();
</script>

<header id="trainer-controls" class="relative" data-nosnippet>
  <a href="/">{siteMetadata.name}</a>

  <nav aria-label={t("App actions")}>
    <button
      aria-describedby="trainer-motion-status"
      onclick={trainer.togglePaused}
      type="button"
    >
      {trainer.motionPaused ? t("Resume motion") : t("Pause motion")}
    </button>
    {#if trainer.canReverse}
      <button
        aria-describedby="trainer-motion-status"
        onclick={trainer.toggleDirection}
        type="button"
      >
        {trainer.settings.motionDirection === 1
          ? t("Reverse motion direction")
          : t("Use forward motion direction")}
      </button>
    {/if}
    <button
      aria-controls="trainer-guide"
      onclick={trainer.openGuide}
      type="button"
    >
      {trainer.route ? t("Open guide") : t("About FoveaFlow")}
    </button>
    <button onclick={trainer.openControls} type="button">
      {t("Open controls")}
    </button>
    <LanguageSelect />
  </nav>

  <HudDrillSelects />
  <HudQuickAdjustments />
</header>

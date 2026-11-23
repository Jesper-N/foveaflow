<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";

  import { getTrainer } from "../trainer-context";
  import HudDrillSelects from "./hud-drill-selects.svelte";
  import HudIconButton from "./hud-icon-button.svelte";
  import HudQuickAdjustments from "./hud-quick-adjustments.svelte";

  const trainer = getTrainer();
  const { hud } = trainer;

  let playbackLabel = $derived(
    trainer.motionPaused ? t("Resume motion") : t("Pause motion")
  );

  let directionLabel = $derived(
    trainer.settings.motionDirection === 1
      ? t("Reverse motion direction")
      : t("Use forward motion direction")
  );

  let guideLabel = $derived(
    trainer.route
      ? `${t("Open")} ${t(trainer.guideCopy.heading)} ${t("guide")}`
      : t("About FoveaFlow eye trainer")
  );

  let guideTooltip = $derived(
    trainer.route ? t("Open guide") : t("About FoveaFlow")
  );
</script>

<svelte:window
  onpointercancel={hud.handleWindowPointerEnd}
  onpointerdown={hud.handleWindowPointerDown}
  onpointermove={hud.handleWindowPointerMove}
  onpointerup={hud.handleWindowPointerEnd}
/>

{#if hud.hidden}
  <button
    class="absolute top-0 left-1/2 z-30 h-12 w-36 -translate-x-1/2"
    aria-controls="trainer-island"
    aria-expanded="false"
    aria-label={t("Reveal controls")}
    onfocus={hud.handleRevealFocus}
    onpointerdown={hud.handleRevealPointerDown}
    type="button"
  ></button>
{/if}

<div
  class="group/island absolute top-3 left-1/2 z-20 w-[min(35rem,calc(100dvw-1.5rem))] -translate-x-1/2 data-[hidden=true]:pointer-events-none"
  {@attach hud.attach}
  data-hidden={hud.hidden}
  data-nosnippet
>
  <header
    id="trainer-island"
    class="flex flex-col gap-4 border bg-[Canvas] p-4 group-data-[hidden=true]/island:invisible"
    inert={hud.hidden}
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <a
        class="flex min-h-11 items-center gap-2"
        aria-label={t("FoveaFlow home")}
        href="/"
      >
        <img
          class="size-6"
          alt=""
          height="24"
          src="/logo-render/logo.svg"
          width="24"
        />
        <span class="hidden min-[400px]:inline">{siteMetadata.name}</span>
      </a>

      <nav class="flex flex-wrap items-center" aria-label={t("App actions")}>
        <HudIconButton
          aria-describedby="trainer-motion-status"
          data-hud-focus-target
          label={playbackLabel}
          onclick={trainer.togglePaused}
        >
          {#if trainer.motionPaused}
            <PlayIcon />
          {:else}
            <PauseIcon />
          {/if}
        </HudIconButton>

        {#if trainer.canReverse}
          <HudIconButton
            aria-describedby="trainer-motion-status"
            label={directionLabel}
            onclick={trainer.toggleDirection}
          >
            <ArrowLeftRightIcon />
          </HudIconButton>
        {/if}

        <HudIconButton
          aria-controls="trainer-guide"
          label={guideLabel}
          onclick={trainer.openGuide}
          tooltip={guideTooltip}
        >
          <BookOpenIcon />
        </HudIconButton>

        <HudIconButton
          label={t("Open controls")}
          onclick={trainer.openControls}
        >
          <SettingsIcon />
        </HudIconButton>

        <LanguageSelect
          onblur={hud.handleMenuBlur}
          onfocus={hud.handleMenuFocus}
        />
      </nav>
    </div>

    <HudDrillSelects />
    <HudQuickAdjustments />
  </header>
</div>

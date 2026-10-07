<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";

  import { getTrainer } from "../trainer-context";
  import HudDrillSelects from "./hud-drill-selects.svelte";
  import HudIconButton from "./hud-icon-button.svelte";
  import HudQuickAdjustments from "./hud-quick-adjustments.svelte";
  import { islandLayoutMotion, islandPresenceMotion } from "./island-motion";

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
  onpointerdown={hud.handleWindowPointerDown}
  onpointermove={hud.handleWindowPointerMove}
  onpointerup={hud.handleWindowPointerEnd}
  onpointercancel={hud.handleWindowPointerEnd}
/>

{#if hud.hidden}
  <button
    type="button"
    class="focus-visible:ring-foreground absolute top-[max(0px,calc(env(safe-area-inset-top)-0.75rem))] left-1/2 z-30 h-12 w-36 -translate-x-1/2 rounded-full outline-hidden focus-visible:ring-3"
    aria-label={t("Reveal controls")}
    aria-controls="trainer-island"
    aria-expanded="false"
    onpointerdown={hud.handleRevealPointerDown}
    onfocus={hud.handleRevealFocus}
  ></button>
{/if}

<!-- The island always uses the dark theme. Its menus and tooltips render in a
     portal outside it, so they take `class="dark"` as well. -->
<div
  {@attach hud.attach}
  class="group/island dark absolute top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-20 w-[min(35rem,calc(100dvw-1.5rem))] -translate-x-1/2 data-[hidden=true]:pointer-events-none"
  data-hidden={hud.hidden}
  data-instant-reveal={hud.instantReveal}
  data-nosnippet
>
  <!-- The card is a pseudo-element so it can shrink into a small tab while hidden. -->
  <header
    id="trainer-island"
    class="text-foreground before:bg-card before:border-border group-data-[hidden=true]/island:before:bg-muted-foreground/30 relative isolate before:absolute before:inset-x-0 before:top-0 before:-z-1 before:mx-auto before:size-full before:rounded-[2rem] before:border before:shadow-[0_12px_32px_-12px_rgb(0_0_0/30%),inset_0_1px_0_rgb(255_255_255/4%)] before:transition-[width,height,border-radius,background-color,border-color] before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:content-[''] group-has-focus-visible/island:before:transition-none group-data-[hidden=true]/island:before:h-2 group-data-[hidden=true]/island:before:w-22 group-data-[hidden=true]/island:before:rounded-sm group-data-[hidden=true]/island:before:border-transparent group-data-[hidden=true]/island:before:delay-60 group-data-[instant-reveal=true]/island:before:transition-none motion-reduce:before:transition-none sm:before:rounded-[2.25rem]"
    inert={hud.hidden}
  >
    <div
      class="flex origin-top transform-[translateY(0)_scale(1)] flex-col gap-4 p-4 opacity-100 [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1)_40ms,opacity_180ms_ease_40ms] group-has-focus-visible/island:transition-none group-data-[hidden=true]/island:transform-[translateY(-6px)_scale(0.96)] group-data-[hidden=true]/island:opacity-0 group-data-[hidden=true]/island:[transition:transform_200ms_cubic-bezier(0.215,0.61,0.355,1),opacity_80ms_ease] group-data-[instant-reveal=true]/island:transition-none motion-reduce:transition-opacity motion-reduce:duration-150 motion-reduce:group-data-[hidden=true]/island:transition-none sm:p-5"
    >
      <div class="flex items-center justify-between gap-2">
        <a
          href="/"
          class="focus-visible:border-ring focus-visible:ring-ring/30 text-subtitle min-[480px]:text-title flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 rounded-4xl border border-transparent font-semibold outline-hidden focus-visible:ring-3"
          aria-label={t("FoveaFlow home")}
        >
          <img
            src="/logo-render/logo.svg"
            alt=""
            width="24"
            height="24"
            class="size-5 shrink-0 rounded-sm object-cover min-[480px]:size-7"
          />
          <!-- Five actions and the wordmark only share one row from 400px. -->
          <span class="hidden min-[400px]:inline">{siteMetadata.name}</span>
        </a>

        <nav class="flex shrink-0 items-center" aria-label={t("App actions")}>
          <Tooltip.Provider delayDuration={450} skipDelayDuration={300}>
            <HudIconButton
              label={playbackLabel}
              variant="default"
              data-hud-focus-target
              aria-describedby="trainer-motion-status"
              onclick={trainer.togglePaused}
            >
              {#if trainer.motionPaused}
                <PlayIcon />
              {:else}
                <PauseIcon />
              {/if}
            </HudIconButton>

            <!-- Collapses when the path cannot reverse, sliding the other actions over. -->
            <div
              class={cn(
                "w-11 overflow-clip transition-[width] [overflow-clip-margin:3px] data-[visible=false]:w-0",
                islandLayoutMotion
              )}
              data-visible={trainer.canReverse}
              inert={!trainer.canReverse}
            >
              <div
                class={islandPresenceMotion}
                data-visible={trainer.canReverse}
              >
                <HudIconButton
                  label={directionLabel}
                  disabled={!trainer.canReverse}
                  aria-describedby="trainer-motion-status"
                  onclick={trainer.toggleDirection}
                >
                  <ArrowLeftRightIcon />
                </HudIconButton>
              </div>
            </div>

            <HudIconButton
              label={guideLabel}
              tooltip={guideTooltip}
              aria-controls="trainer-guide"
              onclick={trainer.openGuide}
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
              showTooltip
              tooltipDisabled={hud.hidden}
              triggerClass="min-h-11 min-w-11 border-transparent bg-transparent hover:bg-muted/50 aria-expanded:bg-muted"
              contentClass="dark"
              bind:open={trainer.languageSelectOpen}
              onOpenChange={hud.handleMenuOpenChange}
            />
          </Tooltip.Provider>
        </nav>
      </div>

      <HudDrillSelects />
      <HudQuickAdjustments />
    </div>
  </header>
</div>

<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import TrainerHudModeSelects from "$lib/components/trainer/trainer-hud-mode-selects.svelte";
  import TrainerHudQuickAdjustments from "$lib/components/trainer/trainer-hud-quick-adjustments.svelte";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { siteMetadata } from "$lib/content/site";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";
  import { cn } from "$lib/utils.js";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import type { Attachment } from "svelte/attachments";

  import { islandLayoutMotion, islandPresenceMotion } from "./island-motion";

  interface Props {
    attachHudShell: Attachment<HTMLDivElement>;
    hudHidden: boolean;
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    motionPaused: boolean;
    motionDirectionToggleLabel: string;
    canToggleDirection: boolean;
    presetSelectOpen: boolean;
    patternSelectOpen: boolean;
    lilacChaserColorSelectOpen: boolean;
    languageSelectOpen: boolean;
    guideButtonLabel: string;
    guideButtonTitle: string;
    patternSelectContentClass: string;
    actions: TrainerHudActions;
  }

  let {
    attachHudShell,
    hudHidden,
    settings,
    isLilacChaserMode,
    motionPaused,
    motionDirectionToggleLabel,
    canToggleDirection,
    presetSelectOpen = $bindable(),
    patternSelectOpen = $bindable(),
    lilacChaserColorSelectOpen = $bindable(),
    languageSelectOpen = $bindable(),
    guideButtonLabel,
    guideButtonTitle,
    patternSelectContentClass,
    actions,
  }: Props = $props();

  let locale = $derived(languageState.locale);
  let playbackLabel = $derived(
    motionPaused ? t(locale, "Resume motion") : t(locale, "Pause motion")
  );

  let pointerInside = false;
  let pointerDown = false;
  let focusInside = false;
  let instantReveal = $state(false);
  let hudElement: HTMLDivElement | null = null;

  const syncHudInteraction = () => {
    actions.setHudInteractionActive(
      pointerInside || pointerDown || focusInside
    );
  };

  // The thin strip between the island and the top edge counts as inside.
  // Hiding there let the top-edge reveal reopen the island and it flickered.
  const isPointerOverHud = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !hudElement || hudHidden) {
      return false;
    }
    const bounds = hudElement.getBoundingClientRect();
    return (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY <= bounds.bottom
    );
  };

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      return;
    }
    pointerInside = true;
    syncHudInteraction();
  };

  const handlePointerLeave = (event: PointerEvent) => {
    pointerInside = isPointerOverHud(event);
    syncHudInteraction();
  };

  const handlePointerDown = () => {
    pointerDown = true;
    syncHudInteraction();
  };

  const handlePointerEnd = (event: PointerEvent) => {
    pointerDown = false;
    pointerInside = event.type !== "pointercancel" && isPointerOverHud(event);
    syncHudInteraction();
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    if (
      !pointerInside ||
      (event.target instanceof Node && hudElement?.contains(event.target))
    ) {
      return;
    }
    pointerInside = isPointerOverHud(event);
    syncHudInteraction();
  };

  const handleFocusIn = (event: FocusEvent) => {
    focusInside =
      event.target instanceof HTMLElement &&
      event.target.matches(":focus-visible");
    syncHudInteraction();
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (
      event.currentTarget instanceof HTMLElement &&
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }

    focusInside = false;
    syncHudInteraction();
  };

  const handleKeyDown = () => {
    focusInside = true;
    syncHudInteraction();
  };

  const attachHudInteraction: Attachment<HTMLDivElement> = (node) => {
    hudElement = node;
    node.addEventListener("pointerenter", handlePointerEnter);
    node.addEventListener("pointerleave", handlePointerLeave);
    node.addEventListener("pointerdown", handlePointerDown);
    node.addEventListener("focusin", handleFocusIn);
    node.addEventListener("focusout", handleFocusOut);
    node.addEventListener("keydown", handleKeyDown);

    return () => {
      if (hudElement === node) {
        hudElement = null;
      }
      node.removeEventListener("pointerenter", handlePointerEnter);
      node.removeEventListener("pointerleave", handlePointerLeave);
      node.removeEventListener("pointerdown", handlePointerDown);
      node.removeEventListener("focusin", handleFocusIn);
      node.removeEventListener("focusout", handleFocusOut);
      node.removeEventListener("keydown", handleKeyDown);
      actions.setHudInteractionActive(false);
    };
  };

  const handleRevealFocus = (event: FocusEvent) => {
    const shouldTransferFocus =
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.matches(":focus-visible");
    instantReveal = shouldTransferFocus;
    actions.revealHud();
    if (!shouldTransferFocus) {
      return;
    }

    requestAnimationFrame(() => {
      const focusTarget = hudElement?.querySelector<HTMLElement>(
        "[data-hud-focus-target]"
      );
      if (!focusTarget) {
        instantReveal = false;
        return;
      }

      focusTarget.focus();
      focusInside = true;
      syncHudInteraction();
      requestAnimationFrame(() => {
        instantReveal = false;
      });
    });
  };

  const handleRevealPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      actions.revealHudTemporarily();
      return;
    }
    actions.revealHud();
  };
</script>

<svelte:window
  onpointermove={handleWindowPointerMove}
  onpointerup={handlePointerEnd}
  onpointercancel={handlePointerEnd}
/>

{#if hudHidden}
  <button
    type="button"
    class="focus-visible:ring-foreground absolute top-[max(0px,calc(env(safe-area-inset-top)-0.75rem))] left-1/2 z-30 h-12 w-36 -translate-x-1/2 rounded-full outline-hidden focus-visible:ring-3"
    aria-label={t(locale, "Reveal controls")}
    aria-controls="trainer-island"
    aria-expanded="false"
    onpointerdown={handleRevealPointerDown}
    onfocus={handleRevealFocus}
  >
    <span class="sr-only">{t(locale, "Reveal controls")}</span>
  </button>
{/if}

<div
  {@attach attachHudShell}
  {@attach attachHudInteraction}
  class="group/island dark absolute top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-20 w-[min(35rem,calc(100dvw-1.5rem))] -translate-x-1/2 data-[hidden=true]:pointer-events-none"
  data-hidden={hudHidden}
  data-instant-reveal={instantReveal}
  data-nosnippet
>
  <header
    id="trainer-island"
    class="text-foreground before:bg-card before:border-border group-data-[hidden=true]/island:before:bg-muted-foreground/30 relative isolate before:absolute before:inset-0 before:-z-1 before:rounded-[2rem] before:border before:shadow-[0_12px_32px_-12px_rgb(0_0_0/30%),inset_0_1px_0_rgb(255_255_255/4%)] before:transition-[inset,border-radius,background-color,border-color] before:duration-260 before:ease-[cubic-bezier(0.32,0.72,0,1)] before:content-[''] group-has-focus-visible/island:before:transition-none group-data-[hidden=true]/island:before:inset-x-[calc(50%-2.75rem)] group-data-[hidden=true]/island:before:bottom-[calc(100%-0.5rem)] group-data-[hidden=true]/island:before:rounded-sm group-data-[hidden=true]/island:before:border-transparent group-data-[hidden=true]/island:before:delay-60 group-data-[hidden=true]/island:before:duration-220 group-data-[hidden=true]/island:before:ease-[cubic-bezier(0.215,0.61,0.355,1)] group-data-[instant-reveal=true]/island:before:transition-none motion-reduce:group-data-hidden/island:before:transition-none sm:before:rounded-[2.25rem]"
    inert={hudHidden}
  >
    <div
      class="flex origin-top transform-[translateY(0)_scale(1)] flex-col gap-4 p-4 opacity-100 [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1)_40ms,opacity_180ms_ease_40ms] group-has-focus-visible/island:transition-none group-data-[hidden=true]/island:transform-[translateY(-6px)_scale(0.96)] group-data-[hidden=true]/island:opacity-0 group-data-[hidden=true]/island:[transition:transform_200ms_cubic-bezier(0.215,0.61,0.355,1),opacity_80ms_ease] group-data-[instant-reveal=true]/island:transition-none motion-reduce:transition-opacity motion-reduce:duration-150 motion-reduce:group-data-[hidden=true]/island:transition-none sm:p-5"
    >
      <div class="flex items-center justify-between gap-2">
        <a
          href="/"
          class="focus-visible:border-ring focus-visible:ring-ring/30 flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 rounded-4xl border border-transparent text-base font-semibold outline-hidden focus-visible:ring-3 min-[480px]:text-xl"
          aria-label={t(locale, `${siteMetadata.name} home`)}
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

        <nav
          class="flex shrink-0 items-center"
          aria-label={t(locale, "App actions")}
        >
          <Tooltip.Provider delayDuration={450} skipDelayDuration={300}>
            <Tooltip.Root disabled={hudHidden}>
              <Tooltip.Trigger
                data-hud-focus-target
                data-slot="button"
                class={cn(
                  buttonVariants({ variant: "default", size: "icon" }),
                  "size-11"
                )}
                aria-label={playbackLabel}
                aria-describedby="trainer-motion-status"
                onclick={actions.toggleMotionPaused}
              >
                {#if motionPaused}
                  <PlayIcon />
                {:else}
                  <PauseIcon />
                {/if}
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" sideOffset={6} class="dark"
                >{playbackLabel}</Tooltip.Content
              >
            </Tooltip.Root>

            <div
              class={cn(
                "w-11 overflow-clip transition-[width] [overflow-clip-margin:3px] data-[visible=false]:w-0",
                islandLayoutMotion
              )}
              data-visible={canToggleDirection}
              inert={!canToggleDirection}
            >
              <div
                class={islandPresenceMotion}
                data-visible={canToggleDirection}
              >
                <Tooltip.Root disabled={hudHidden || !canToggleDirection}>
                  <Tooltip.Trigger
                    data-slot="button"
                    class={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-11"
                    )}
                    aria-label={motionDirectionToggleLabel}
                    aria-describedby="trainer-motion-status"
                    disabled={!canToggleDirection}
                    onclick={actions.toggleMotionDirection}
                  >
                    <ArrowLeftRightIcon />
                  </Tooltip.Trigger>
                  <Tooltip.Content side="bottom" sideOffset={6} class="dark"
                    >{motionDirectionToggleLabel}</Tooltip.Content
                  >
                </Tooltip.Root>
              </div>
            </div>

            <Tooltip.Root disabled={hudHidden}>
              <Tooltip.Trigger
                data-slot="button"
                class={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-11"
                )}
                aria-label={guideButtonLabel}
                aria-controls="trainer-guide"
                onclick={actions.openGuide}
              >
                <BookOpenIcon />
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" sideOffset={6} class="dark"
                >{guideButtonTitle}</Tooltip.Content
              >
            </Tooltip.Root>

            <Tooltip.Root disabled={hudHidden}>
              <Tooltip.Trigger
                data-slot="button"
                class={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-11"
                )}
                aria-label={t(locale, "Open controls")}
                onclick={actions.openControlsPanel}
              >
                <SettingsIcon />
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" sideOffset={6} class="dark"
                >{t(locale, "Open controls")}</Tooltip.Content
              >
            </Tooltip.Root>

            <LanguageSelect
              showTooltip
              tooltipDisabled={hudHidden}
              triggerClass="min-h-11 min-w-11 border-transparent bg-transparent hover:bg-muted/50 aria-expanded:bg-muted"
              contentClass="dark"
              variant="default"
              bind:open={languageSelectOpen}
              onOpenChange={actions.handleHeaderSelectOpenChange}
            />
          </Tooltip.Provider>
        </nav>
      </div>

      <TrainerHudModeSelects
        {settings}
        {patternSelectContentClass}
        {actions}
        {locale}
        bind:presetSelectOpen
        bind:patternSelectOpen
      />
      <TrainerHudQuickAdjustments
        {settings}
        {isLilacChaserMode}
        {actions}
        {locale}
        bind:lilacChaserColorSelectOpen
      />
    </div>
  </header>
</div>

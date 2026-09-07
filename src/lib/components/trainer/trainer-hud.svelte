<script lang="ts">
  import "./trainer-hud.css";
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

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      return;
    }
    pointerInside = true;
    syncHudInteraction();
  };

  const handlePointerLeave = () => {
    pointerInside = false;
    syncHudInteraction();
  };

  const handlePointerDown = () => {
    pointerDown = true;
    syncHudInteraction();
  };

  const isPointerOverHud = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !hudElement || hudHidden) {
      return false;
    }
    const bounds = hudElement.getBoundingClientRect();
    return (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    );
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

  const handleRevealPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      return;
    }
    actions.revealHud();
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
    class="trainer-hud-peek focus-visible:ring-foreground absolute left-1/2 z-30 h-12 w-36 -translate-x-1/2 rounded-full outline-hidden focus-visible:ring-3"
    aria-label={t(locale, "Reveal controls")}
    aria-controls="trainer-island"
    aria-expanded="false"
    onpointerenter={handleRevealPointerEnter}
    onpointerdown={handleRevealPointerDown}
    onfocus={handleRevealFocus}
  >
    <span class="sr-only">{t(locale, "Reveal controls")}</span>
  </button>
{/if}

<div
  {@attach attachHudShell}
  {@attach attachHudInteraction}
  class="trainer-hud-shell trainer-island-theme absolute left-1/2 z-20 -translate-x-1/2"
  data-hidden={hudHidden}
  data-instant-reveal={instantReveal}
  data-nosnippet
>
  <header
    id="trainer-island"
    class="trainer-hud text-foreground relative isolate"
    inert={hudHidden}
  >
    <div class="trainer-island-content flex flex-col gap-4 p-4 sm:p-5">
      <div
        class="flex flex-col items-stretch gap-1 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between min-[380px]:gap-2"
      >
        <a
          href="/"
          class="focus-visible:ring-foreground flex h-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold tracking-tight outline-hidden focus-visible:ring-3 min-[360px]:justify-start min-[480px]:text-xl"
          aria-label={t(locale, `${siteMetadata.name} home`)}
        >
          <span>{siteMetadata.name}</span>
        </a>

        <nav
          class="flex shrink-0 items-center justify-center min-[360px]:justify-start"
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
              <Tooltip.Content
                side="bottom"
                sideOffset={6}
                class="trainer-island-theme">{playbackLabel}</Tooltip.Content
              >
            </Tooltip.Root>

            <div
              class="trainer-island-direction"
              data-visible={canToggleDirection}
              inert={!canToggleDirection}
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
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  class="trainer-island-theme"
                  >{motionDirectionToggleLabel}</Tooltip.Content
                >
              </Tooltip.Root>
            </div>

            <Tooltip.Root disabled={hudHidden}>
              <Tooltip.Trigger
                data-slot="button"
                class={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-11"
                )}
                aria-label={guideButtonLabel}
                popovertarget="trainer-guide-popover"
                onclick={actions.revealHud}
              >
                <BookOpenIcon />
              </Tooltip.Trigger>
              <Tooltip.Content
                side="bottom"
                sideOffset={6}
                class="trainer-island-theme">{guideButtonTitle}</Tooltip.Content
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
              <Tooltip.Content
                side="bottom"
                sideOffset={6}
                class="trainer-island-theme"
                >{t(locale, "Open controls")}</Tooltip.Content
              >
            </Tooltip.Root>

            <LanguageSelect
              showFlag={false}
              showTooltip
              tooltipDisabled={hudHidden}
              triggerClass="min-h-11 min-w-11 border-transparent bg-transparent hover:bg-muted"
              contentClass="trainer-island-theme"
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
      <div class="min-h-17">
        {#key isLilacChaserMode}
          <div class="trainer-island-adjustments">
            <TrainerHudQuickAdjustments
              {settings}
              {isLilacChaserMode}
              {actions}
              {locale}
              bind:lilacChaserColorSelectOpen
            />
          </div>
        {/key}
      </div>
    </div>
  </header>
</div>

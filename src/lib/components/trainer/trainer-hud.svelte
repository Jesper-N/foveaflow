<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import TrainerHudModeSelects from "$lib/components/trainer/trainer-hud-mode-selects.svelte";
  import TrainerHudQuickAdjustments from "$lib/components/trainer/trainer-hud-quick-adjustments.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { siteMetadata } from "$lib/content/site";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import type { Attachment } from "svelte/attachments";

  interface Props {
    attachHudShell: Attachment<HTMLDivElement>;
    hudHidden: boolean;
    hudContentWidth: number | null;
    attachHudContentSizer: Attachment<HTMLDivElement>;
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    motionPaused: boolean;
    motionDirectionToggleLabel: string;
    canToggleDirection: boolean;
    mobilePresetSelectOpen: boolean;
    mobilePatternSelectOpen: boolean;
    mobileLilacChaserColorSelectOpen: boolean;
    desktopPresetSelectOpen: boolean;
    desktopPatternSelectOpen: boolean;
    desktopLilacChaserColorSelectOpen: boolean;
    languageSelectOpen: boolean;
    guideButtonLabel: string;
    guideButtonTitle: string;
    patternSelectContentClass: string;
    actions: TrainerHudActions;
  }

  let {
    attachHudShell,
    hudHidden,
    hudContentWidth,
    attachHudContentSizer,
    settings,
    isLilacChaserMode,
    motionPaused,
    motionDirectionToggleLabel,
    canToggleDirection,
    mobilePresetSelectOpen = $bindable(),
    mobilePatternSelectOpen = $bindable(),
    mobileLilacChaserColorSelectOpen = $bindable(),
    desktopPresetSelectOpen = $bindable(),
    desktopPatternSelectOpen = $bindable(),
    desktopLilacChaserColorSelectOpen = $bindable(),
    languageSelectOpen = $bindable(),
    guideButtonLabel,
    guideButtonTitle,
    patternSelectContentClass,
    actions,
  }: Props = $props();

  let locale = $derived(languageState.locale);

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

  const handlePointerEnter = () => {
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

  const handlePointerEnd = () => {
    pointerDown = false;
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

  const attachHudInteraction: Attachment<HTMLDivElement> = (node) => {
    hudElement = node;
    node.addEventListener("pointerenter", handlePointerEnter);
    node.addEventListener("pointerleave", handlePointerLeave);
    node.addEventListener("pointerdown", handlePointerDown);
    node.addEventListener("focusin", handleFocusIn);
    node.addEventListener("focusout", handleFocusOut);

    return () => {
      if (hudElement === node) {
        hudElement = null;
      }
      node.removeEventListener("pointerenter", handlePointerEnter);
      node.removeEventListener("pointerleave", handlePointerLeave);
      node.removeEventListener("pointerdown", handlePointerDown);
      node.removeEventListener("focusin", handleFocusIn);
      node.removeEventListener("focusout", handleFocusOut);
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
    actions.revealHudTemporarily();
  };
</script>

<svelte:window
  onpointerup={handlePointerEnd}
  onpointercancel={handlePointerEnd}
/>

{#if hudHidden}
  <button
    type="button"
    class="trainer-hud-peek focus-visible:ring-foreground absolute top-0 left-1/2 z-30 flex h-10 w-full items-start justify-center rounded-b-full pt-2 outline-hidden focus-visible:ring-3 sm:w-32"
    aria-label={t(locale, "Reveal controls")}
    onpointerenter={handleRevealPointerEnter}
    onpointerdown={actions.revealHudTemporarily}
    onfocus={handleRevealFocus}
  >
    <span
      class="bg-accent/70 h-1 w-16 rounded-full shadow-[0_0_16px_rgba(118,217,0,0.22)]"
      aria-hidden="true"
    ></span>
  </button>
{/if}

<div
  {@attach attachHudShell}
  {@attach attachHudInteraction}
  class="trainer-hud-shell absolute top-3 left-1/2 z-20 max-w-[calc(100dvw-1.5rem)] -translate-x-1/2 sm:top-4"
  data-hidden={hudHidden}
  data-instant-reveal={instantReveal}
  data-nosnippet
>
  <header
    class="trainer-hud bg-popover/90 text-popover-foreground min-h-12 max-w-full overflow-hidden rounded-[2rem] border px-4 py-2 shadow-[0_18px_44px_-34px_rgba(20,24,22,0.42)] backdrop-blur-md 2xl:py-2.5"
    style:width={hudContentWidth === null
      ? undefined
      : `calc(${hudContentWidth}px + 2rem + 2px)`}
    inert={hudHidden}
  >
    <div {@attach attachHudContentSizer} class="flex w-max items-center gap-2">
      <div class="flex shrink-0 items-center gap-2 max-[359px]:hidden">
        <div
          class="text-foreground m-0 flex shrink-0 items-center text-base font-semibold tracking-tight"
        >
          <a
            href="/"
            class="hover:text-foreground/85 focus-visible:ring-foreground flex shrink-0 items-center gap-2 rounded-2xl outline-hidden transition-colors focus-visible:ring-3"
            aria-label={t(locale, `${siteMetadata.name} home`)}
          >
            <img
              src="/metadata/favicon-96x96.png"
              alt=""
              aria-hidden="true"
              width="28"
              height="28"
              class="size-7 object-contain dark:hidden"
            />
            <img
              src="/metadata/favicon-light-96x96.png"
              alt=""
              aria-hidden="true"
              width="28"
              height="28"
              class="hidden size-7 object-contain dark:block"
            />
            <span class="sr-only xl:not-sr-only">{siteMetadata.name}</span>
          </a>
        </div>
      </div>

      <TrainerHudModeSelects
        {settings}
        {isLilacChaserMode}
        {patternSelectContentClass}
        {actions}
        {locale}
        bind:mobilePresetSelectOpen
        bind:mobilePatternSelectOpen
        bind:mobileLilacChaserColorSelectOpen
        bind:desktopPresetSelectOpen
        bind:desktopPatternSelectOpen
      />
      <TrainerHudQuickAdjustments
        {settings}
        {isLilacChaserMode}
        {actions}
        {locale}
        bind:desktopLilacChaserColorSelectOpen
      />
      <div
        class="bg-border/80 hidden h-8 w-px shrink-0 md:block"
        aria-hidden="true"
      ></div>

      <nav
        class="flex shrink-0 items-center gap-2"
        aria-label={t(locale, "App actions")}
      >
        <Button
          data-hud-focus-target
          variant="outline"
          size="icon"
          aria-label={motionPaused
            ? t(locale, "Resume motion")
            : t(locale, "Pause motion")}
          aria-describedby="trainer-motion-status"
          onclick={actions.toggleMotionPaused}
        >
          {#if motionPaused}
            <PlayIcon />
          {:else}
            <PauseIcon />
          {/if}
        </Button>

        <Button
          class="hidden sm:inline-flex"
          variant="outline"
          size="icon"
          aria-label={motionDirectionToggleLabel}
          aria-describedby="trainer-motion-status"
          disabled={!canToggleDirection}
          onclick={actions.toggleMotionDirection}
        >
          <ArrowLeftRightIcon />
        </Button>

        <Button
          variant="outline"
          size="icon"
          aria-label={guideButtonLabel}
          title={guideButtonTitle}
          popovertarget="trainer-guide-popover"
          onclick={actions.revealHud}
        >
          <BookOpenIcon />
        </Button>

        <Button
          variant="outline"
          size="icon"
          aria-label={t(locale, "Open controls")}
          onclick={actions.openControlsPanel}
        >
          <SettingsIcon />
        </Button>

        <LanguageSelect
          bind:open={languageSelectOpen}
          onOpenChange={actions.handleHeaderSelectOpenChange}
        />
      </nav>
    </div>
  </header>
</div>

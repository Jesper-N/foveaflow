<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ModePathPreview from "$lib/components/mode-path-preview.svelte";
  import PatternPathPreview from "$lib/components/pattern-path-preview.svelte";
  import TrainerPatternSelectGroups from "$lib/components/trainer/trainer-pattern-select-groups.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { siteMetadata } from "$lib/content/site";
  import { exercisePresets } from "$lib/engine/presets";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";
  import {
    getLilacChaserColorName,
    getPatternName,
    getPresetName,
    lilacChaserColorOptions,
    maxSpeedByUnit,
    minSpeedByUnit,
    speedDecimalPlacesByUnit,
    speedSliderStepByUnit,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";
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
  let currentPresetName = $derived(t(locale, getPresetName(settings.presetId)));
  let currentPatternName = $derived(
    t(locale, getPatternName(settings.patternId))
  );
  let currentLilacChaserColorName = $derived(
    t(locale, getLilacChaserColorName(settings.lilacChaserBallColor))
  );
  let sizeLabel = $derived(t(locale, "Size"));
  let speedLabel = $derived(t(locale, "Speed"));
  let scaleLabel = $derived(t(locale, "Scale"));

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

{#snippet presetSelectOptions()}
  <Select.Group>
    {#each exercisePresets as preset (preset.id)}
      <Select.Item value={preset.id}>
        <span class="flex min-w-0 items-center gap-2">
          <ModePathPreview mode={preset.id} />
          <span class="truncate">{t(locale, preset.name)}</span>
        </span>
      </Select.Item>
    {/each}
  </Select.Group>
{/snippet}

{#snippet lilacChaserColorSelectOptions()}
  <Select.Group>
    {#each lilacChaserColorOptions as option (option.id)}
      <Select.Item value={option.id}>
        <span class="flex min-w-0 items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            class="border-border/60 size-3 shrink-0 rounded-full border"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="6" fill={option.id} />
          </svg>
          <span class="truncate">{t(locale, option.name)}</span>
        </span>
      </Select.Item>
    {/each}
  </Select.Group>
{/snippet}

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
    aria-hidden={hudHidden}
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

      <div class="flex shrink-0 items-center gap-2 md:hidden">
        <Select.Root
          bind:open={mobilePresetSelectOpen}
          type="single"
          value={settings.presetId}
          onValueChange={actions.handlePresetChange}
          onOpenChange={actions.handleHeaderPresetOpenChange}
        >
          <Select.Trigger
            data-trainer-shortcut-select="mobile-mode"
            class="size-9 justify-center rounded-full p-0 [&>svg:last-child]:hidden"
            aria-label={`${t(locale, "Drill")}: ${currentPresetName}`}
            title={`${t(locale, "Drill")}: ${currentPresetName}`}
          >
            <ModePathPreview mode={settings.presetId} />
            <span class="sr-only">{currentPresetName}</span>
          </Select.Trigger>
          <Select.Content>
            {@render presetSelectOptions()}
          </Select.Content>
        </Select.Root>

        {#if settings.presetId === "pursuit"}
          <div class="flex shrink-0">
            <Select.Root
              bind:open={mobilePatternSelectOpen}
              type="single"
              value={settings.patternId}
              onValueChange={actions.handlePatternChange}
              onOpenChange={actions.handleHeaderPatternOpenChange}
            >
              <Select.Trigger
                data-trainer-shortcut-select="mobile-pattern"
                class="size-9 justify-center rounded-full p-0 [&>svg:last-child]:hidden"
                aria-label={`${t(locale, "Motion path")}: ${currentPatternName}`}
                title={`${t(locale, "Motion path")}: ${currentPatternName}`}
              >
                <PatternPathPreview patternId={settings.patternId} />
                <span class="sr-only">
                  {currentPatternName}
                </span>
              </Select.Trigger>
              <Select.Content class={patternSelectContentClass}>
                <TrainerPatternSelectGroups />
              </Select.Content>
            </Select.Root>
          </div>
        {:else if isLilacChaserMode}
          <div class="flex shrink-0">
            <Select.Root
              bind:open={mobileLilacChaserColorSelectOpen}
              type="single"
              value={settings.lilacChaserBallColor}
              onValueChange={actions.handleLilacChaserColorChange}
              onOpenChange={actions.handleHeaderLilacChaserColorOpenChange}
            >
              <Select.Trigger
                class="size-9 justify-center rounded-full p-0 [&>svg:last-child]:hidden"
                aria-label={`${t(locale, "Lilac Chaser ball color")}: ${currentLilacChaserColorName}`}
                title={`${t(locale, "Lilac Chaser ball color")}: ${currentLilacChaserColorName}`}
              >
                <svg
                  viewBox="0 0 12 12"
                  class="border-border/60 size-4 shrink-0 rounded-full border"
                  aria-hidden="true"
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="6"
                    fill={settings.lilacChaserBallColor}
                  />
                </svg>
                <span class="sr-only">
                  {currentLilacChaserColorName}
                </span>
              </Select.Trigger>
              <Select.Content>
                {@render lilacChaserColorSelectOptions()}
              </Select.Content>
            </Select.Root>
          </div>
        {/if}
      </div>

      <div
        class="bg-border/80 hidden h-8 w-px shrink-0 md:block"
        aria-hidden="true"
      ></div>

      <div class="hidden shrink-0 items-center gap-2 md:flex">
        <Select.Root
          bind:open={desktopPresetSelectOpen}
          type="single"
          value={settings.presetId}
          onValueChange={actions.handlePresetChange}
          onOpenChange={actions.handleHeaderPresetOpenChange}
        >
          <Select.Trigger
            data-trainer-shortcut-select="desktop-mode"
            class={[
              "overflow-hidden transition-[width] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              settings.presetId === "pursuit"
                ? "w-36 lg:w-40 2xl:w-44"
                : "w-52 lg:w-56 2xl:w-60",
            ]}
            aria-label={t(locale, "Drill")}
          >
            <span class="min-w-0 truncate">
              {currentPresetName}
            </span>
          </Select.Trigger>
          <Select.Content>
            {@render presetSelectOptions()}
          </Select.Content>
        </Select.Root>

        {#if settings.presetId === "pursuit"}
          <div class="flex shrink-0">
            <Select.Root
              bind:open={desktopPatternSelectOpen}
              type="single"
              value={settings.patternId}
              onValueChange={actions.handlePatternChange}
              onOpenChange={actions.handleHeaderPatternOpenChange}
            >
              <Select.Trigger
                data-trainer-shortcut-select="desktop-pattern"
                class="w-36 overflow-hidden lg:w-40 2xl:w-44"
                aria-label={t(locale, "Motion path")}
              >
                <span class="min-w-0 truncate">
                  {currentPatternName}
                </span>
              </Select.Trigger>
              <Select.Content class={patternSelectContentClass}>
                <TrainerPatternSelectGroups />
              </Select.Content>
            </Select.Root>
          </div>
        {/if}
      </div>

      {#if !isLilacChaserMode}
        <div class="hidden shrink-0 items-center gap-2 overflow-hidden xl:flex">
          <div
            class="bg-muted/60 grid h-9 grid-cols-[auto_5.5rem_auto] items-center gap-3 rounded-full border px-3"
          >
            <span
              class="text-muted-foreground max-w-20 min-w-0 truncate text-xs font-medium"
              title={sizeLabel}
            >
              {sizeLabel}
            </span>
            <Slider
              bind:value={actions.sizeSlider.value, actions.sizeSlider.set}
              min={trainerSettingBounds.baseRadiusPx.min}
              max={trainerSettingBounds.baseRadiusPx.max}
              step={1}
              aria-label={t(locale, "Header target size")}
              class="w-full"
            />
            <span
              class="w-[3ch] text-center text-xs font-semibold tabular-nums"
            >
              {Math.round(settings.baseRadiusPx)}
            </span>
          </div>

          <div
            class="bg-muted/60 grid h-9 grid-cols-[auto_5.5rem_auto] items-center gap-3 rounded-full border px-3"
          >
            <span
              class="text-muted-foreground max-w-20 min-w-0 truncate text-xs font-medium"
              title={speedLabel}
            >
              {speedLabel}
            </span>
            <Slider
              bind:value={actions.speedSlider.value, actions.speedSlider.set}
              min={minSpeedByUnit[settings.speed.unit]}
              max={maxSpeedByUnit[settings.speed.unit]}
              step={speedSliderStepByUnit[settings.speed.unit]}
              aria-label={t(locale, "Header target speed")}
              class="w-full"
            />
            <span
              class="w-[4.5ch] text-center text-xs font-semibold tabular-nums"
            >
              {settings.speed.value.toFixed(
                speedDecimalPlacesByUnit[settings.speed.unit]
              )}
            </span>
          </div>
        </div>
      {:else}
        <div class="hidden shrink-0 items-center gap-2 overflow-hidden xl:flex">
          <Select.Root
            bind:open={desktopLilacChaserColorSelectOpen}
            type="single"
            value={settings.lilacChaserBallColor}
            onValueChange={actions.handleLilacChaserColorChange}
            onOpenChange={actions.handleHeaderLilacChaserColorOpenChange}
          >
            <Select.Trigger
              class="w-36 overflow-hidden lg:w-40"
              aria-label={t(locale, "Lilac Chaser ball color")}
            >
              <span class="min-w-0 truncate">
                {currentLilacChaserColorName}
              </span>
            </Select.Trigger>
            <Select.Content>
              {@render lilacChaserColorSelectOptions()}
            </Select.Content>
          </Select.Root>
          <div
            class="bg-muted/60 grid h-9 grid-cols-[auto_5.5rem_auto] items-center gap-3 rounded-full border px-3"
          >
            <span
              class="text-muted-foreground max-w-20 min-w-0 truncate text-xs font-medium"
              title={scaleLabel}
            >
              {scaleLabel}
            </span>
            <Slider
              bind:value={
                actions.lilacChaserScaleSlider.value,
                actions.lilacChaserScaleSlider.set
              }
              min={trainerSettingBounds.lilacChaserScale.min}
              max={trainerSettingBounds.lilacChaserScale.max}
              step={0.05}
              aria-label={t(locale, "Lilac Chaser scale")}
              class="w-full"
            />
            <span
              class="w-[4.5ch] text-center text-xs font-semibold tabular-nums"
            >
              {settings.lilacChaserScale.toFixed(2)}x
            </span>
          </div>
        </div>
      {/if}

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
          onOpenChange={actions.handleHeaderLanguageOpenChange}
        />
      </nav>
    </div>
  </header>
</div>

<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";

  import ModePathPreview from "$lib/components/ModePathPreview.svelte";
  import PatternPathPreview from "$lib/components/PatternPathPreview.svelte";
  import TrainerPatternSelectGroups from "$lib/components/trainer/TrainerPatternSelectGroups.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { siteMetadata } from "$lib/content/site";
  import { exercisePresets, type TrainerSettings } from "$lib/engine/presets";
  import {
    getLilacChaserColorName,
    getPatternName,
    getPresetName,
    lilacChaserColorOptions,
    maxSpeedByUnit,
    speedStepByUnit,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";

  type Props = {
    attachHudShell: Attachment<HTMLDivElement>;
    hudHidden: boolean;
    hudContentWidth: number | null;
    attachHudContentSizer: Attachment<HTMLDivElement>;
    hasActiveRoute: boolean;
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    motionPaused: boolean;
    motionDirectionToggleLabel: string;
    canToggleDirection: boolean;
    guideButtonLabel: string;
    guideButtonTitle: string;
    patternSelectContentClass: string;
    actions: TrainerHudActions;
  };

  let {
    attachHudShell,
    hudHidden,
    hudContentWidth,
    attachHudContentSizer,
    hasActiveRoute,
    settings,
    isLilacChaserMode,
    motionPaused,
    motionDirectionToggleLabel,
    canToggleDirection,
    guideButtonLabel,
    guideButtonTitle,
    patternSelectContentClass,
    actions,
  }: Props = $props();

  let hudControlTransition = $derived(actions.hudControlTransition);
</script>

{#snippet presetSelectOptions()}
  <Select.Group>
    {#each exercisePresets as preset (preset.id)}
      <Select.Item value={preset.id}>
        <span class="flex min-w-0 items-center gap-2">
          <ModePathPreview mode={preset.id} compact />
          <span class="truncate">{preset.name}</span>
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
            class="size-3 shrink-0 rounded-full border border-border/60"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="6" fill={option.id} />
          </svg>
          <span class="truncate">{option.name}</span>
        </span>
      </Select.Item>
    {/each}
  </Select.Group>
{/snippet}

{#if hudHidden}
  <button
    type="button"
    class="trainer-hud-peek absolute left-1/2 top-0 z-30 flex h-10 w-32 items-start justify-center rounded-b-full pt-2 outline-hidden focus-visible:ring-3 focus-visible:ring-ring/30"
    aria-label="Reveal controls"
    onpointerenter={actions.revealHud}
    onfocus={actions.revealHud}
    onclick={actions.revealHud}
  >
    <span
      class="h-1 w-16 rounded-full bg-accent/70 shadow-[0_0_16px_rgba(118,217,0,0.22)]"
      aria-hidden="true"
    ></span>
  </button>
{/if}

<div
  {@attach attachHudShell}
  class="trainer-hud-shell absolute top-3 left-1/2 z-20 max-w-[calc(100dvw-1.5rem)] -translate-x-1/2 sm:top-4"
  data-hidden={hudHidden}
  data-nosnippet
>
  <header
    class="trainer-hud min-h-12 max-w-full overflow-hidden rounded-[2rem] border bg-popover/90 px-4 py-2 text-popover-foreground shadow-[0_18px_44px_-34px_rgba(20,24,22,0.42)] backdrop-blur-md 2xl:py-2.5"
    style:width={hudContentWidth === null
      ? undefined
      : `calc(${hudContentWidth}px + 2rem + 2px)`}
    aria-hidden={hudHidden}
    inert={hudHidden}
  >
    <div {@attach attachHudContentSizer} class="flex w-max items-center gap-2">
      <div class="flex shrink-0 items-center gap-2">
        <svelte:element
          this={hasActiveRoute ? "div" : "h1"}
          class="m-0 flex shrink-0 items-center text-base font-semibold tracking-tight text-foreground"
          aria-label={hasActiveRoute
            ? undefined
            : "FoveaFlow, free online eye trainer"}
        >
          <a
            href="/"
            class="flex shrink-0 items-center gap-2 rounded-2xl outline-hidden transition-colors hover:text-foreground/85 focus-visible:ring-3 focus-visible:ring-ring/30"
            aria-label={`${siteMetadata.name} home`}
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
        </svelte:element>
      </div>

      <div class="flex shrink-0 items-center gap-2 md:hidden">
        <Select.Root
          type="single"
          value={settings.presetId}
          onValueChange={actions.handlePresetChange}
          onOpenChange={actions.handleHeaderPresetOpenChange}
        >
          <Select.Trigger
            class="pressable-ui size-9 justify-center rounded-full p-0 [&>svg:last-child]:hidden"
            aria-label={`Drill: ${getPresetName(settings.presetId)}`}
            title={`Drill: ${getPresetName(settings.presetId)}`}
          >
            <ModePathPreview mode={settings.presetId} compact />
            <span class="sr-only">{getPresetName(settings.presetId)}</span>
          </Select.Trigger>
          <Select.Content>
            {@render presetSelectOptions()}
          </Select.Content>
        </Select.Root>

        {#if settings.presetId === "pursuit"}
          <div class="flex shrink-0" in:hudControlTransition>
            <Select.Root
              type="single"
              value={settings.patternId}
              onValueChange={actions.handlePatternChange}
              onOpenChange={actions.handleHeaderPatternOpenChange}
            >
              <Select.Trigger
                class="pressable-ui size-9 justify-center rounded-full p-0 [&>svg:last-child]:hidden"
                aria-label={`Motion path: ${getPatternName(settings.patternId)}`}
                title={`Motion path: ${getPatternName(settings.patternId)}`}
              >
                <PatternPathPreview patternId={settings.patternId} compact />
                <span class="sr-only">
                  {getPatternName(settings.patternId)}
                </span>
              </Select.Trigger>
              <Select.Content class={patternSelectContentClass}>
                <TrainerPatternSelectGroups />
              </Select.Content>
            </Select.Root>
          </div>
        {:else if isLilacChaserMode}
          <div class="flex shrink-0" in:hudControlTransition>
            <Select.Root
              type="single"
              value={settings.lilacChaserBallColor}
              onValueChange={actions.handleLilacChaserColorChange}
              onOpenChange={actions.handleHeaderLilacChaserColorOpenChange}
            >
              <Select.Trigger
                class="pressable-ui size-9 justify-center rounded-full p-0 [&>svg:last-child]:hidden"
                aria-label={`Lilac Chaser ball color: ${getLilacChaserColorName(settings.lilacChaserBallColor)}`}
                title={`Lilac Chaser ball color: ${getLilacChaserColorName(settings.lilacChaserBallColor)}`}
              >
                <svg
                  viewBox="0 0 12 12"
                  class="size-4 shrink-0 rounded-full border border-border/60"
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
                  {getLilacChaserColorName(settings.lilacChaserBallColor)}
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
        class="hidden h-8 w-px shrink-0 bg-border/80 md:block"
        aria-hidden="true"
      ></div>

      <div class="hidden shrink-0 items-center gap-2 md:flex">
        <Select.Root
          type="single"
          value={settings.presetId}
          onValueChange={actions.handlePresetChange}
          onOpenChange={actions.handleHeaderPresetOpenChange}
        >
          <Select.Trigger
            class={[
              "overflow-hidden transition-[width] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              settings.presetId === "pursuit"
                ? "w-36 lg:w-40 2xl:w-44"
                : "w-52 lg:w-56 2xl:w-60",
            ]}
            aria-label="Drill"
          >
            <span class="min-w-0 truncate">
              {getPresetName(settings.presetId)}
            </span>
          </Select.Trigger>
          <Select.Content>
            {@render presetSelectOptions()}
          </Select.Content>
        </Select.Root>

        {#if settings.presetId === "pursuit"}
          <div class="flex shrink-0" in:hudControlTransition>
            <Select.Root
              type="single"
              value={settings.patternId}
              onValueChange={actions.handlePatternChange}
              onOpenChange={actions.handleHeaderPatternOpenChange}
            >
              <Select.Trigger
                class="w-36 overflow-hidden lg:w-40 2xl:w-44"
                aria-label="Motion path"
              >
                <span class="min-w-0 truncate">
                  {getPatternName(settings.patternId)}
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
        <div
          class="hidden shrink-0 items-center gap-2 overflow-hidden xl:flex"
          in:hudControlTransition
        >
          <div
            class="flex h-9 w-44 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-48"
          >
            <span class="w-8 text-xs font-medium text-muted-foreground 2xl:w-9">
              Size
            </span>
            <Slider
              bind:value={actions.sizeSlider.value, actions.sizeSlider.set}
              min={trainerSettingBounds.baseRadiusPx.min}
              max={trainerSettingBounds.baseRadiusPx.max}
              step={1}
              aria-label="Header target size"
            />
            <span class="w-10 text-right text-xs font-semibold tabular-nums">
              {Math.round(settings.baseRadiusPx)}
            </span>
          </div>

          <div
            class="flex h-9 w-44 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-48"
          >
            <span class="w-8 text-xs font-medium text-muted-foreground 2xl:w-9">
              Speed
            </span>
            <Slider
              bind:value={actions.speedSlider.value, actions.speedSlider.set}
              min={trainerSettingBounds.speedValue.min}
              max={maxSpeedByUnit[settings.speed.unit]}
              step={speedStepByUnit[settings.speed.unit]}
              aria-label="Header target speed"
            />
            <span class="w-12 text-right text-xs font-semibold tabular-nums">
              {settings.speed.value.toFixed(1)}
            </span>
          </div>
        </div>
      {:else}
        <div
          class="hidden shrink-0 items-center gap-2 overflow-hidden xl:flex"
          in:hudControlTransition
        >
          <Select.Root
            type="single"
            value={settings.lilacChaserBallColor}
            onValueChange={actions.handleLilacChaserColorChange}
            onOpenChange={actions.handleHeaderLilacChaserColorOpenChange}
          >
            <Select.Trigger
              class="w-36 overflow-hidden lg:w-40"
              aria-label="Lilac Chaser ball color"
            >
              <span class="min-w-0 truncate">
                {getLilacChaserColorName(settings.lilacChaserBallColor)}
              </span>
            </Select.Trigger>
            <Select.Content>
              {@render lilacChaserColorSelectOptions()}
            </Select.Content>
          </Select.Root>
          <div
            class="flex h-9 w-48 items-center gap-3 rounded-full border bg-muted/60 px-3 2xl:w-52"
          >
            <span class="w-9 text-xs font-medium text-muted-foreground">
              Scale
            </span>
            <Slider
              bind:value={
                actions.lilacChaserScaleSlider.value,
                actions.lilacChaserScaleSlider.set
              }
              min={trainerSettingBounds.lilacChaserScale.min}
              max={trainerSettingBounds.lilacChaserScale.max}
              step={0.05}
              aria-label="Lilac Chaser scale"
            />
            <span class="w-12 text-right text-xs font-semibold tabular-nums">
              {settings.lilacChaserScale.toFixed(2)}x
            </span>
          </div>
        </div>
      {/if}

      <div
        class="hidden h-8 w-px shrink-0 bg-border/80 md:block"
        aria-hidden="true"
      ></div>

      <nav class="flex shrink-0 items-center gap-2" aria-label="App actions">
        <Button
          class="pressable-ui hidden sm:inline-flex"
          variant="outline"
          size="icon"
          aria-label={motionPaused ? "Resume motion" : "Pause motion"}
          aria-pressed={motionPaused}
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
          class="pressable-ui hidden sm:inline-flex"
          variant="outline"
          size="icon"
          aria-label={motionDirectionToggleLabel}
          aria-pressed={settings.motionDirection === -1}
          aria-describedby="trainer-motion-status"
          disabled={!canToggleDirection}
          onclick={actions.toggleMotionDirection}
        >
          <ArrowLeftRightIcon />
        </Button>

        <Button
          class="pressable-ui"
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
          class="pressable-ui"
          variant="outline"
          size="icon"
          aria-label="Open controls"
          onclick={actions.openControlsPanel}
        >
          <SettingsIcon />
        </Button>
      </nav>
    </div>
  </header>
</div>

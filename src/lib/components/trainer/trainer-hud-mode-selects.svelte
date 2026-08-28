<script lang="ts">
  import ModePathPreview from "$lib/components/mode-path-preview.svelte";
  import PatternPathPreview from "$lib/components/pattern-path-preview.svelte";
  import TrainerHudColorSelectOptions from "$lib/components/trainer/trainer-hud-color-select-options.svelte";
  import TrainerPatternSelectGroups from "$lib/components/trainer/trainer-pattern-select-groups.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { exercisePresets } from "$lib/engine/presets";
  import type { TrainerSettings } from "$lib/engine/presets";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";
  import {
    getLilacChaserColorName,
    getPatternName,
    getPresetName,
  } from "$lib/trainer/options";

  let {
    settings,
    isLilacChaserMode,
    patternSelectContentClass,
    actions,
    locale,
    mobilePresetSelectOpen = $bindable(),
    mobilePatternSelectOpen = $bindable(),
    mobileLilacChaserColorSelectOpen = $bindable(),
    desktopPresetSelectOpen = $bindable(),
    desktopPatternSelectOpen = $bindable(),
  }: {
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    patternSelectContentClass: string;
    actions: TrainerHudActions;
    locale: AppLocale;
    mobilePresetSelectOpen: boolean;
    mobilePatternSelectOpen: boolean;
    mobileLilacChaserColorSelectOpen: boolean;
    desktopPresetSelectOpen: boolean;
    desktopPatternSelectOpen: boolean;
  } = $props();

  let currentPresetName = $derived(t(locale, getPresetName(settings.presetId)));
  let currentPatternName = $derived(
    t(locale, getPatternName(settings.patternId))
  );
  let currentLilacChaserColorName = $derived(
    t(locale, getLilacChaserColorName(settings.lilacChaserBallColor))
  );
</script>

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
            <circle cx="6" cy="6" r="6" fill={settings.lilacChaserBallColor} />
          </svg>
          <span class="sr-only">
            {currentLilacChaserColorName}
          </span>
        </Select.Trigger>
        <Select.Content>
          <TrainerHudColorSelectOptions {locale} />
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

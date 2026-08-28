<script lang="ts">
  import TrainerHudColorSelectOptions from "$lib/components/trainer/trainer-hud-color-select-options.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";
  import {
    getLilacChaserColorName,
    maxSpeedByUnit,
    minSpeedByUnit,
    speedDecimalPlacesByUnit,
    speedSliderStepByUnit,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";

  let {
    settings,
    isLilacChaserMode,
    actions,
    locale,
    desktopLilacChaserColorSelectOpen = $bindable(),
  }: {
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    actions: TrainerHudActions;
    locale: AppLocale;
    desktopLilacChaserColorSelectOpen: boolean;
  } = $props();

  let currentLilacChaserColorName = $derived(
    t(locale, getLilacChaserColorName(settings.lilacChaserBallColor))
  );
  let sizeLabel = $derived(t(locale, "Size"));
  let speedLabel = $derived(t(locale, "Speed"));
  let scaleLabel = $derived(t(locale, "Scale"));
</script>

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
      <span class="w-[3ch] text-center text-xs font-semibold tabular-nums">
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
      <span class="w-[4.5ch] text-center text-xs font-semibold tabular-nums">
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
        <TrainerHudColorSelectOptions {locale} />
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
      <span class="w-[4.5ch] text-center text-xs font-semibold tabular-nums">
        {settings.lilacChaserScale.toFixed(2)}x
      </span>
    </div>
  </div>
{/if}

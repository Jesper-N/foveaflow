<script lang="ts">
  import TrainerHudColorSelectOptions from "$lib/components/trainer/trainer-hud-color-select-options.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
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
    speedSliderStepByUnit,
  } from "$lib/trainer/options";
  import { trainerSettingBounds } from "$lib/trainer/settings";
  import { cn } from "$lib/utils.js";

  import { islandPresenceMotion } from "./island-motion";

  const adjustmentsClass = cn(
    "col-start-1 row-start-1 grid min-w-0 grid-cols-2 items-start gap-5 px-1",
    islandPresenceMotion
  );

  let {
    settings,
    isLilacChaserMode,
    actions,
    locale,
    lilacChaserColorSelectOpen = $bindable(),
  }: {
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    actions: TrainerHudActions;
    locale: AppLocale;
    lilacChaserColorSelectOpen: boolean;
  } = $props();

  let currentLilacChaserColorName = $derived(
    t(locale, getLilacChaserColorName(settings.lilacChaserBallColor))
  );
  let sizeLabel = $derived(t(locale, "Size"));
  let speedLabel = $derived(t(locale, "Speed"));
  let scaleLabel = $derived(t(locale, "Scale"));
</script>

<div class="grid min-h-17">
  <Field.FieldGroup
    class={adjustmentsClass}
    data-visible={!isLilacChaserMode}
    inert={isLilacChaserMode}
  >
    <Field.Field
      class="grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0"
    >
      <span
        class="text-muted-foreground min-w-0 truncate text-xs font-medium"
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
        class="col-span-2 row-start-2 min-h-11 w-full"
      />
      <span class="col-start-2 row-start-1 text-xs font-medium tabular-nums">
        {Math.round(settings.baseRadiusPx)}
      </span>
    </Field.Field>

    <Field.Field
      class="grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0"
    >
      <span
        class="text-muted-foreground min-w-0 truncate text-xs font-medium"
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
        class="col-span-2 row-start-2 min-h-11 w-full"
      />
      <span class="col-start-2 row-start-1 text-xs font-medium tabular-nums">
        {Math.round(settings.speed.value)}
      </span>
    </Field.Field>
  </Field.FieldGroup>
  <Field.FieldGroup
    class={adjustmentsClass}
    data-visible={isLilacChaserMode}
    inert={!isLilacChaserMode}
  >
    <Field.Field class="gap-1">
      <span class="text-muted-foreground text-xs font-medium"
        >{t(locale, "Ball color")}</span
      >
      <Select.Root
        bind:open={lilacChaserColorSelectOpen}
        type="single"
        value={settings.lilacChaserBallColor}
        onValueChange={actions.handleLilacChaserColorChange}
        onOpenChange={actions.handleHeaderSelectOpenChange}
      >
        <Select.Trigger
          class="min-h-11 w-full min-w-0 overflow-hidden rounded-xl px-2.5"
          aria-label={t(locale, "Lilac Chaser ball color")}
        >
          <span class="flex min-w-0 items-center gap-2">
            <svg viewBox="0 0 12 12" class="size-3 shrink-0" aria-hidden="true">
              <circle
                cx="6"
                cy="6"
                r="5"
                fill={settings.lilacChaserBallColor}
              />
            </svg>
            <span class="truncate text-xs">
              {currentLilacChaserColorName}
            </span>
          </span>
        </Select.Trigger>
        <Select.Content class="dark">
          <TrainerHudColorSelectOptions {locale} />
        </Select.Content>
      </Select.Root>
    </Field.Field>
    <Field.Field
      class="grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0"
    >
      <span
        class="text-muted-foreground min-w-0 truncate text-xs font-medium"
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
        class="col-span-2 row-start-2 min-h-12 w-full"
      />
      <span class="col-start-2 row-start-1 text-xs font-medium tabular-nums">
        {settings.lilacChaserScale.toFixed(2)}x
      </span>
    </Field.Field>
  </Field.FieldGroup>
</div>

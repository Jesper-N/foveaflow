<script lang="ts">
  import ModePathPreview from "$lib/components/mode-path-preview.svelte";
  import PatternPathPreview from "$lib/components/pattern-path-preview.svelte";
  import TrainerPatternSelectGroups from "$lib/components/trainer/trainer-pattern-select-groups.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { exercisePresets } from "$lib/engine/presets";
  import type { TrainerSettings } from "$lib/engine/presets";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import type { TrainerHudActions } from "$lib/trainer/control-actions";
  import { getPatternName, getPresetName } from "$lib/trainer/options";
  import { cn } from "$lib/utils.js";

  import { islandLayoutMotion, islandPresenceMotion } from "./island-motion";

  const fieldTriggerClass =
    "relative h-auto min-h-16 w-full min-w-0 items-start rounded-2xl px-3 py-2.5 data-[size=default]:h-auto sm:px-4 [&>svg:last-child]:absolute [&>svg:last-child]:top-3 [&>svg:last-child]:right-3";

  let {
    settings,
    patternSelectContentClass,
    actions,
    locale,
    presetSelectOpen = $bindable(),
    patternSelectOpen = $bindable(),
  }: {
    settings: TrainerSettings;
    patternSelectContentClass: string;
    actions: TrainerHudActions;
    locale: AppLocale;
    presetSelectOpen: boolean;
    patternSelectOpen: boolean;
  } = $props();

  let currentPresetName = $derived(t(locale, getPresetName(settings.presetId)));
  let currentPatternName = $derived(
    t(locale, getPatternName(settings.patternId))
  );
</script>

<!-- Both states need explicit track lists for the columns to interpolate. -->
<div
  class={cn(
    "@container grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-2 transition-[grid-template-columns,column-gap] data-[has-pattern=false]:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] data-[has-pattern=false]:gap-x-0 max-[359px]:min-h-21",
    islandLayoutMotion
  )}
  data-has-pattern={settings.presetId === "pursuit"}
>
  <Select.Root
    bind:open={presetSelectOpen}
    type="single"
    value={settings.presetId}
    onValueChange={actions.handlePresetChange}
    onOpenChange={actions.handleHeaderSelectOpenChange}
  >
    <Select.Trigger
      data-trainer-shortcut-select="header-mode"
      class={fieldTriggerClass}
      aria-label={`${t(locale, "Drill")}: ${currentPresetName}`}
      title={`${t(locale, "Drill")}: ${currentPresetName}`}
    >
      <span class="flex w-full min-w-0 flex-col items-start gap-1">
        <span class="text-muted-foreground max-w-full truncate pr-5 text-xs"
          >{t(locale, "Drill")}</span
        >
        <span class="flex w-full min-w-0 items-center gap-2">
          <span class="hidden sm:inline-flex"
            ><ModePathPreview mode={settings.presetId} /></span
          >
          <span
            class="min-w-0 text-left text-sm leading-snug font-medium wrap-anywhere whitespace-normal md:truncate md:whitespace-nowrap"
            >{currentPresetName}</span
          >
        </span>
      </span>
    </Select.Trigger>
    <Select.Content class="dark">
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
    </Select.Content>
  </Select.Root>

  <div
    class={cn(
      "flex min-w-0 overflow-clip [overflow-clip-margin:3px]",
      islandPresenceMotion
    )}
    data-visible={settings.presetId === "pursuit"}
    inert={settings.presetId !== "pursuit"}
  >
    <Select.Root
      bind:open={patternSelectOpen}
      type="single"
      value={settings.patternId}
      onValueChange={actions.handlePatternChange}
      onOpenChange={actions.handleHeaderSelectOpenChange}
    >
      <Select.Trigger
        data-trainer-shortcut-select="header-pattern"
        class={cn(fieldTriggerClass, "w-[calc(50cqw-0.25rem)] shrink-0")}
        aria-label={`${t(locale, "Motion path")}: ${currentPatternName}`}
        title={`${t(locale, "Motion path")}: ${currentPatternName}`}
      >
        <span class="flex w-full min-w-0 flex-col items-start gap-1">
          <span class="text-muted-foreground max-w-full truncate pr-5 text-xs"
            >{t(locale, "Motion path")}</span
          >
          <span class="flex w-full min-w-0 items-center gap-2">
            <span class="hidden sm:inline-flex"
              ><PatternPathPreview patternId={settings.patternId} /></span
            >
            <span
              class="min-w-0 text-left text-sm leading-snug font-medium wrap-anywhere whitespace-normal md:truncate md:whitespace-nowrap"
              >{currentPatternName}</span
            >
          </span>
        </span>
      </Select.Trigger>
      <Select.Content class={["dark", patternSelectContentClass]}>
        <TrainerPatternSelectGroups />
      </Select.Content>
    </Select.Root>
  </div>
</div>

<script lang="ts">
  import DrillIcon from "$lib/components/drills/drill-icon.svelte";
  import PatternIcon from "$lib/components/drills/pattern-icon.svelte";
  import * as Select from "$lib/components/ui/select";
  import { t } from "$lib/i18n/translate";
  import { getDrill } from "$lib/trainer/settings/drills";
  import { getPatternName } from "$lib/trainer/settings/patterns";
  import { cn } from "$lib/utils";

  import DrillSelectContent from "../selects/drill-select-content.svelte";
  import PatternSelectContent from "../selects/pattern-select-content.svelte";
  import { getTrainer } from "../trainer-context";
  import HudSelectLabel from "./hud-select-label.svelte";
  import { islandLayoutMotion, islandPresenceMotion } from "./island-motion";

  const trainer = getTrainer();

  let drillName = $derived(t(getDrill(trainer.settings.drillId).name));
  let patternName = $derived(t(getPatternName(trainer.settings.patternId)));

  // A two-line field: a small caption over the current value.
  const triggerClass =
    "relative h-auto min-h-16 w-full min-w-0 items-start rounded-2xl px-3 py-2.5 data-[size=default]:h-auto sm:px-4 [&>svg:last-child]:absolute [&>svg:last-child]:top-3 [&>svg:last-child]:right-3";
</script>

<!-- Both states need explicit track lists for the columns to interpolate. -->
<div
  class={cn(
    "@container grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-2 transition-[grid-template-columns,column-gap] data-[has-pattern=false]:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] data-[has-pattern=false]:gap-x-0 max-[359px]:min-h-21",
    islandLayoutMotion
  )}
  data-has-pattern={trainer.isPursuit}
>
  <Select.Root
    bind:open={trainer.drillSelectOpen}
    type="single"
    value={trainer.settings.drillId}
    onValueChange={trainer.selectDrill}
    onOpenChange={trainer.hud.handleMenuOpenChange}
  >
    <Select.Trigger
      data-hud-select="drill"
      class={triggerClass}
      aria-label={`${t("Drill")}: ${drillName}`}
      title={`${t("Drill")}: ${drillName}`}
    >
      <HudSelectLabel caption={t("Drill")} value={drillName}>
        <DrillIcon drillId={trainer.settings.drillId} />
      </HudSelectLabel>
    </Select.Trigger>
    <DrillSelectContent class="dark" />
  </Select.Root>

  <!-- Only Smooth Pursuit has paths. The select slides away for other drills. -->
  <div
    class={cn(
      "flex min-w-0 overflow-clip [overflow-clip-margin:3px]",
      islandPresenceMotion
    )}
    data-visible={trainer.isPursuit}
    inert={!trainer.isPursuit}
  >
    <Select.Root
      bind:open={trainer.patternSelectOpen}
      type="single"
      value={trainer.settings.patternId}
      onValueChange={trainer.selectPattern}
      onOpenChange={trainer.hud.handleMenuOpenChange}
    >
      <Select.Trigger
        data-hud-select="pattern"
        class={cn(triggerClass, "w-[calc(50cqw-0.25rem)] shrink-0")}
        aria-label={`${t("Motion path")}: ${patternName}`}
        title={`${t("Motion path")}: ${patternName}`}
      >
        <HudSelectLabel caption={t("Motion path")} value={patternName}>
          <PatternIcon patternId={trainer.settings.patternId} />
        </HudSelectLabel>
      </Select.Trigger>
      <PatternSelectContent class="dark" />
    </Select.Root>
  </div>
</div>

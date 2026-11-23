<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { isPursuitPattern } from "$lib/trainer/settings/patterns";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import PatternGlyph from "../../icons/pattern-glyph.svelte";
  import Select from "../../ui/select.svelte";
  import { drillGroups, patternGroups } from "../select-options";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
</script>

<Select
  class="min-w-0"
  controller={trainer.drillSelect}
  data-hud-select="drill"
  groups={drillGroups()}
  hideLabel
  label={t("Drill")}
  onValueChange={trainer.selectDrill}
  triggerClass="w-full"
  value={trainer.settings.drillId}
>
  {#snippet icon(drillId)}
    <DrillIcon class="size-4.5" {drillId} />
  {/snippet}
</Select>

{#if trainer.isPursuit}
  <Select
    class="min-w-0 max-sm:col-span-full"
    controller={trainer.patternSelect}
    data-hud-select="pattern"
    groups={patternGroups()}
    hideLabel
    label={t("Motion path")}
    onValueChange={trainer.selectPattern}
    triggerClass="w-full"
    value={trainer.settings.patternId}
  >
    {#snippet icon(patternId)}
      {#if isPursuitPattern(patternId)}
        <PatternGlyph class="h-4 w-5.5" {patternId} />
      {/if}
    {/snippet}
  </Select>
{/if}

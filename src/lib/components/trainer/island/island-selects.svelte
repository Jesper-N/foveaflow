<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { isPursuitPattern } from "$lib/trainer/settings/patterns";

  import PatternGlyph from "../../icons/pattern-glyph.svelte";
  import Select from "../../ui/select.svelte";
  import { patternGroups } from "../select-options";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
</script>

{#if trainer.isPursuit}
  <Select
    class="min-w-0"
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

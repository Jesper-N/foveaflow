<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import DrillOptions from "../selects/drill-options.svelte";
  import PatternOptions from "../selects/pattern-options.svelte";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
</script>

<label>
  {t("Drill")}
  <select
    data-hud-select="drill"
    onchange={(event) => {
      trainer.selectDrill(event.currentTarget.value);
    }}
    value={trainer.settings.drillId}
  >
    <DrillOptions />
  </select>
</label>

<!-- Only Smooth Pursuit has paths. -->
{#if trainer.isPursuit}
  <label>
    {t("Motion path")}
    <select
      data-hud-select="pattern"
      onchange={(event) => {
        trainer.selectPattern(event.currentTarget.value);
      }}
      value={trainer.settings.patternId}
    >
      <PatternOptions />
    </select>
  </label>
{/if}

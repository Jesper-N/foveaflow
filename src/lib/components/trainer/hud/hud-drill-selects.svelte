<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import DrillOptions from "../selects/drill-options.svelte";
  import PatternOptions from "../selects/pattern-options.svelte";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
  const { hud } = trainer;
</script>

<div class="grid grid-cols-2 gap-2">
  <label class="flex min-w-0 flex-col gap-1">
    {t("Drill")}
    <select
      class="min-h-11 min-w-0"
      data-hud-select="drill"
      onblur={hud.handleMenuBlur}
      onchange={(event) => {
        trainer.selectDrill(event.currentTarget.value);
      }}
      onfocus={hud.handleMenuFocus}
      value={trainer.settings.drillId}
    >
      <DrillOptions />
    </select>
  </label>

  <!-- Only Smooth Pursuit has paths. -->
  {#if trainer.isPursuit}
    <label class="flex min-w-0 flex-col gap-1">
      {t("Motion path")}
      <select
        class="min-h-11 min-w-0"
        data-hud-select="pattern"
        onblur={hud.handleMenuBlur}
        onchange={(event) => {
          trainer.selectPattern(event.currentTarget.value);
        }}
        onfocus={hud.handleMenuFocus}
        value={trainer.settings.patternId}
      >
        <PatternOptions />
      </select>
    </label>
  {/if}
</div>

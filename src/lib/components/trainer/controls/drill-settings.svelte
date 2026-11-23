<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { behaviors } from "$lib/trainer/settings/behaviors";

  import DrillOptions from "../selects/drill-options.svelte";
  import PatternOptions from "../selects/pattern-options.svelte";
  import { getTrainer } from "../trainer-context";
  import RadioGroup from "./radio-group.svelte";
  import SettingsSection from "./settings-section.svelte";
  import SliderRow from "./slider-row.svelte";
  import SwitchRow from "./switch-row.svelte";

  const trainer = getTrainer();
</script>

<section aria-labelledby="trainer-drill-settings">
  <h3 id="trainer-drill-settings">{t("Drill")}</h3>
  <p>{t("Choose your exercise and how it moves.")}</p>

  <div>
    <label for="trainer-drill">{t("Drill")}</label>
    <select
      id="trainer-drill"
      onchange={(event) => {
        trainer.selectDrill(event.currentTarget.value);
      }}
      value={trainer.settings.drillId}
    >
      <DrillOptions />
    </select>
  </div>

  {#if trainer.isPursuit}
    <div>
      <label for="trainer-pattern">{t("Motion path")}</label>
      <select
        id="trainer-pattern"
        onchange={(event) => {
          trainer.selectPattern(event.currentTarget.value);
        }}
        value={trainer.settings.patternId}
      >
        <PatternOptions />
      </select>
    </div>
  {/if}

  <!-- Lilac Chaser does not move, so it has no motion settings. -->
  {#if !trainer.isLilacChaser}
    <SettingsSection legend={t("Motion")}>
      <div>
        <label for="trainer-behavior">{t("Motion feel")}</label>
        <select
          id="trainer-behavior"
          onchange={(event) => {
            trainer.selectBehavior(event.currentTarget.value);
          }}
          value={trainer.behavior}
        >
          {#each behaviors as behavior (behavior.id)}
            <option value={behavior.id}>{t(behavior.name)}</option>
          {/each}
        </select>
      </div>

      <SliderRow label={t("Speed")} setting="speed" />

      {#if trainer.canReverse}
        <RadioGroup
          name="trainer-direction"
          legend={t("Direction")}
          onValueChange={trainer.setDirection}
          options={[
            { label: t("Forward"), value: "forward" },
            { label: t("Reverse"), value: "reverse" },
          ]}
          value={trainer.settings.motionDirection === 1 ? "forward" : "reverse"}
        />
        <SwitchRow
          id="trainer-show-trail"
          label={t("Show trail")}
          bind:checked={trainer.settings.showTrail}
        />
      {/if}
    </SettingsSection>
  {/if}
</section>

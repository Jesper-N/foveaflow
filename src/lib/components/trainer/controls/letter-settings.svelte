<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { letterWeights } from "$lib/trainer/settings/options";

  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import SliderRow from "./slider-row.svelte";
  import SwitchRow from "./switch-row.svelte";

  const trainer = getTrainer();
</script>

<SwitchRow
  id="trainer-letter-enabled"
  label={t("Show target letters")}
  bind:checked={trainer.settings.letterEnabled}
/>

{#if trainer.settings.letterEnabled}
  <ColorRow
    id="trainer-letter-color"
    label={t("Letter color")}
    onValueChange={trainer.setLetterColor}
    value={trainer.settings.letterColor}
  />

  <div>
    <label for="trainer-letter-weight">{t("Weight")}</label>
    <select
      id="trainer-letter-weight"
      aria-label={t("Letter weight")}
      onchange={(event) => {
        trainer.setLetterWeight(event.currentTarget.value);
      }}
      value={String(trainer.settings.letterWeight)}
    >
      {#each letterWeights as weight (weight.id)}
        <option value={String(weight.id)}>{t(weight.name)}</option>
      {/each}
    </select>
  </div>

  <SliderRow
    label={t("Text size")}
    setting="letterScale"
    sliderLabel={t("Letter text size")}
  />
{/if}

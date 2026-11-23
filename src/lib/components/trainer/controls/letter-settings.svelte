<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { letterWeights } from "$lib/trainer/settings/options";

  import { getTrainer } from "../trainer-context";
  import ColorRow from "./color-row.svelte";
  import SettingsRow from "./settings-row.svelte";
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
  >
    {#snippet swatch()}
      <!-- The letter on the ball, as the drill draws it. -->
      <svg class="size-6 shrink-0" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" fill={trainer.targetColor} r="12" />
        <text
          dominant-baseline="middle"
          fill={trainer.settings.letterColor}
          font-size="15"
          font-weight={trainer.settings.letterWeight}
          text-anchor="middle"
          x="12"
          y="12"
        >
          A
        </text>
      </svg>
    {/snippet}
  </ColorRow>

  <SettingsRow>
    <label for="trainer-letter-weight">{t("Weight")}</label>
    <select
      id="trainer-letter-weight"
      class="min-h-11"
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
  </SettingsRow>

  <SliderRow
    label={t("Text size")}
    setting="letterScale"
    sliderLabel={t("Letter text size")}
  />
{/if}

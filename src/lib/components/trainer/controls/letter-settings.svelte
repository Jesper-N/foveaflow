<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import * as Select from "$lib/components/ui/select";
  import { t } from "$lib/i18n/translate";
  import {
    getLetterWeightName,
    letterWeights,
  } from "$lib/trainer/settings/options";

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
    value={trainer.settings.letterColor}
    onValueChange={trainer.setLetterColor}
  >
    {#snippet swatch()}
      <!-- The letter on the ball, as the drill draws it. -->
      <svg viewBox="0 0 24 24" class="size-6 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill={trainer.targetColor} />
        <text
          x="12"
          y="12"
          dominant-baseline="middle"
          text-anchor="middle"
          fill={trainer.settings.letterColor}
          font-size="15"
          font-weight={trainer.settings.letterWeight}
        >
          A
        </text>
      </svg>
    {/snippet}
  </ColorRow>

  <SettingsRow>
    <Field.FieldLabel for="trainer-letter-weight">
      {t("Weight")}
    </Field.FieldLabel>
    <Select.Root
      type="single"
      value={String(trainer.settings.letterWeight)}
      onValueChange={trainer.setLetterWeight}
    >
      <Select.Trigger
        id="trainer-letter-weight"
        class="min-h-11 w-full"
        aria-label={t("Letter weight")}
      >
        {t(getLetterWeightName(trainer.settings.letterWeight))}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each letterWeights as weight (weight.id)}
            <Select.Item value={String(weight.id)}>{t(weight.name)}</Select.Item
            >
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </SettingsRow>

  <SliderRow
    setting="letterScale"
    label={t("Text size")}
    sliderLabel={t("Letter text size")}
  />
{/if}

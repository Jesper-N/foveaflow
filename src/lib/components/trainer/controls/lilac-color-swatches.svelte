<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { lilacChaserColors } from "$lib/trainer/settings/options";
  import { Radio, RadioGroup } from "@ui-sdk/svelte/radio";

  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();
</script>

<div class="flex items-center justify-between gap-3">
  <span class="text-md font-medium whitespace-nowrap" aria-hidden="true">
    {t("Ball color")}
  </span>
  <RadioGroup
    class="flex items-center gap-1"
    aria-label={t("Lilac Chaser ball color")}
    onValueChange={(value) => {
      if (typeof value === "string") {
        trainer.setLilacChaserColor(value);
      }
    }}
    value={trainer.settings.lilacChaserBallColor}
  >
    {#each lilacChaserColors as color (color.id)}
      <Radio
        class="group/swatch grid size-8 cursor-pointer place-items-center rounded-full transition-[scale] duration-160 ease-out select-none active:duration-100 motion-safe:active:scale-90 pointer-coarse:size-11"
        aria-label={t(color.name)}
        value={color.id}
      >
        <svg
          class="ring-offset-popover ease-spring group-data-checked/swatch:ring-foreground size-6 rounded-full ring-2 ring-transparent ring-offset-2 transition-[box-shadow,scale] duration-220 group-data-checked/swatch:scale-90"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" fill={color.id} r="12" />
        </svg>
      </Radio>
    {/each}
  </RadioGroup>
</div>

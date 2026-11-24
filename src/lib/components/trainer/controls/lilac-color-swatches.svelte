<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { cueChoice, isPersonChange } from "$lib/sound/sound.svelte";
  import { lilacChaserColors } from "$lib/trainer/settings/options";
  import { PaletteIcon } from "@lucide/svelte";
  import { Radio, RadioGroup } from "@ui-sdk/svelte/radio";

  import RowLabel from "../../ui/row-label.svelte";
  import SwatchDot from "../../ui/swatch-dot.svelte";
  import { getTrainer } from "../trainer-context";

  let { icon = false }: { icon?: boolean } = $props();

  const trainer = getTrainer();

  const colorIndex = (color: string) =>
    lilacChaserColors.findIndex((candidate) => candidate.id === color);
</script>

<div class="flex items-center justify-between gap-3" data-setting-row>
  <span class="text-md min-w-0 font-medium" aria-hidden="true">
    <RowLabel icon={icon ? PaletteIcon : undefined} label={t("Ball color")} />
  </span>
  <RadioGroup
    class="flex items-center gap-1"
    aria-label={t("Lilac Chaser ball color")}
    onValueChange={(value, details) => {
      if (typeof value === "string") {
        if (isPersonChange(details)) {
          cueChoice(
            colorIndex(trainer.settings.lilacChaserBallColor),
            colorIndex(value)
          );
        }

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
        <SwatchDot color={color.id} />
      </Radio>
    {/each}
  </RadioGroup>
</div>

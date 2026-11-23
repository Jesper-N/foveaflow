<script lang="ts">
  import { settingRanges } from "$lib/trainer/settings/settings";
  import type { RangedSetting } from "$lib/trainer/settings/settings";
  import type { ClassValue } from "svelte/elements";

  import Slider from "../../ui/slider.svelte";
  import { getTrainer } from "../trainer-context";
  import { formatSetting } from "./format-setting";

  interface Props {
    setting: RangedSetting;
    label: string;
    thumbLabel?: string;
    class?: ClassValue;
  }

  let {
    setting,
    label,
    thumbLabel = label,
    class: className,
  }: Props = $props();

  const trainer = getTrainer();
  let range = $derived(settingRanges[setting]);
</script>

<Slider
  class={className}
  format={(value) => formatSetting(setting, value)}
  {label}
  max={range.max}
  min={range.min}
  onValueChange={(value) => {
    trainer.setRanged(setting, value);
  }}
  step={range.step}
  {thumbLabel}
  value={trainer.settings[setting]}
/>

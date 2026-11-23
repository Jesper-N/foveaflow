<script lang="ts">
  import type { RangedSetting } from "$lib/trainer/settings/settings";

  import { getTrainer } from "../trainer-context";
  import { formatSetting } from "./format-setting";
  import SettingSlider from "./setting-slider.svelte";

  let {
    setting,
    label,
    sliderLabel = label,
  }: {
    setting: RangedSetting;
    label: string;
    /** Accessible name of the slider, when the row label alone is ambiguous. */
    sliderLabel?: string;
  } = $props();

  const trainer = getTrainer();
  const id = $props.id();
</script>

<div>
  <label for={id}>{label}</label>
  <SettingSlider {id} label={sliderLabel} {setting} />
  <output for={id}>{formatSetting(setting, trainer.settings[setting])}</output>
</div>

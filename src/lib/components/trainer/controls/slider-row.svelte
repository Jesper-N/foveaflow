<script lang="ts">
  import type { RangedSetting } from "$lib/trainer/settings/settings";

  import { getTrainer } from "../trainer-context";
  import { formatSetting } from "./format-setting";
  import SettingSlider from "./setting-slider.svelte";
  import SettingsRow from "./settings-row.svelte";

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

<SettingsRow>
  <label for={id}>{label}</label>
  <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] items-center gap-3">
    <SettingSlider {id} label={sliderLabel} {setting} />
    <output class="text-right tabular-nums" for={id}>
      {formatSetting(setting, trainer.settings[setting])}
    </output>
  </div>
</SettingsRow>

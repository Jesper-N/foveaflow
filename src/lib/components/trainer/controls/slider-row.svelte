<script lang="ts">
  import * as Field from "$lib/components/ui/field";
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
</script>

<SettingsRow>
  <Field.FieldTitle>{label}</Field.FieldTitle>
  <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] items-center gap-3">
    <SettingSlider {setting} label={sliderLabel} />
    <span class="text-muted-foreground text-right text-sm tabular-nums">
      {formatSetting(setting, trainer.settings[setting])}
    </span>
  </div>
</SettingsRow>

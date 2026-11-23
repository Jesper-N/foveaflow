<script lang="ts">
  import { settingRanges } from "$lib/trainer/settings/settings";
  import type { RangedSetting } from "$lib/trainer/settings/settings";

  import { getTrainer } from "../trainer-context";

  let {
    id,
    setting,
    label,
  }: { id?: string; setting: RangedSetting; label: string } = $props();

  const trainer = getTrainer();
  let range = $derived(settingRanges[setting]);
</script>

<input
  {id}
  class="w-full min-w-0"
  aria-label={label}
  max={range.max}
  min={range.min}
  oninput={(event) => {
    trainer.setRanged(setting, event.currentTarget.valueAsNumber);
  }}
  step={range.step}
  type="range"
  value={trainer.settings[setting]}
/>

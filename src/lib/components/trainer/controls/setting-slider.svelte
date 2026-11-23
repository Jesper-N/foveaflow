<script lang="ts">
  import { Slider } from "$lib/components/ui/slider";
  import { itemAt } from "$lib/trainer/engine/math";
  import { settingRanges } from "$lib/trainer/settings/settings";
  import type { RangedSetting } from "$lib/trainer/settings/settings";
  import { cn } from "$lib/utils";

  import { getTrainer } from "../trainer-context";

  let {
    setting,
    label,
    class: className,
  }: { setting: RangedSetting; label: string; class?: string } = $props();

  const trainer = getTrainer();
  let range = $derived(settingRanges[setting]);
</script>

<!-- The track stays compact while an invisible band keeps a 44px hit area. -->
<Slider
  class={cn(
    "h-4 before:absolute before:inset-x-0 before:-inset-y-3.5",
    className
  )}
  aria-label={label}
  max={range.max}
  min={range.min}
  step={range.step}
  type="multiple"
  bind:value={
    () => [trainer.settings[setting]],
    (values) => {
      trainer.setRanged(setting, itemAt(values, 0));
    }
  }
/>

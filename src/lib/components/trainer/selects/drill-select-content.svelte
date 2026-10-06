<script lang="ts">
  import DrillIcon from "$lib/components/drills/drill-icon.svelte";
  import * as Select from "$lib/components/ui/select";
  import { t } from "$lib/i18n/translate";
  import { drills } from "$lib/trainer/settings/drills";

  import OptionLabel from "./option-label.svelte";

  let { class: className }: { class?: string } = $props();
</script>

<Select.Content class={className}>
  <Select.Group>
    {#each drills as drill (drill.id)}
      <Select.Item value={drill.id}>
        <OptionLabel label={t(drill.name)}>
          <DrillIcon drillId={drill.id} />
        </OptionLabel>
      </Select.Item>
    {/each}
  </Select.Group>
</Select.Content>

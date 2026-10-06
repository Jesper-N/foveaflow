<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import { t } from "$lib/i18n/translate";
  import { lilacChaserColors } from "$lib/trainer/settings/options";

  import ColorDot from "./color-dot.svelte";
  import OptionLabel from "./option-label.svelte";

  let { class: className }: { class?: string } = $props();
</script>

<Select.Content class={className}>
  <Select.Group>
    {#each lilacChaserColors as color (color.id)}
      <Select.Item value={color.id}>
        <OptionLabel label={t(color.name)}>
          <ColorDot color={color.id} />
        </OptionLabel>
      </Select.Item>
    {/each}
  </Select.Group>
</Select.Content>

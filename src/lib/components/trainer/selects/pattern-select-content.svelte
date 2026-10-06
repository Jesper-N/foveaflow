<script lang="ts">
  import PatternIcon from "$lib/components/drills/pattern-icon.svelte";
  import * as Select from "$lib/components/ui/select";
  import { t } from "$lib/i18n/translate";
  import {
    predictablePatterns,
    unpredictablePatterns,
  } from "$lib/trainer/settings/patterns";
  import { cn } from "$lib/utils";

  import OptionLabel from "./option-label.svelte";

  let { class: className }: { class?: string } = $props();

  const groups = [
    { label: "Unpredictable", patterns: unpredictablePatterns },
    { label: "Predictable", patterns: predictablePatterns },
  ];
</script>

<!-- Twenty paths: cap the height so the list scrolls inside the viewport. -->
<Select.Content
  class={cn("max-h-[min(65dvh,26rem)] overscroll-contain", className)}
>
  {#each groups as group (group.label)}
    <Select.Group>
      <Select.GroupHeading>{t(group.label)}</Select.GroupHeading>
      {#each group.patterns as pattern (pattern.id)}
        <Select.Item value={pattern.id}>
          <OptionLabel label={t(pattern.name)}>
            <PatternIcon patternId={pattern.id} />
          </OptionLabel>
        </Select.Item>
      {/each}
    </Select.Group>
  {/each}
</Select.Content>

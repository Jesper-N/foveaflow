<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import {
    predictablePatterns,
    unpredictablePatterns,
  } from "$lib/trainer/settings/patterns";

  const groups = [
    { label: "Unpredictable", patterns: unpredictablePatterns },
    { label: "Predictable", patterns: predictablePatterns },
  ];
</script>

{#each groups as group (group.label)}
  <optgroup label={t(group.label)}>
    {#each group.patterns as pattern (pattern.id)}
      <option value={pattern.id}>{t(pattern.name)}</option>
    {/each}
  </optgroup>
{/each}

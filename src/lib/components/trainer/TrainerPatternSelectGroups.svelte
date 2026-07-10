<script lang="ts">
  import PatternPathPreview from "$lib/components/PatternPathPreview.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import {
    predictivePatternOptions,
    unpredictivePatternOptions,
  } from "$lib/trainer/options";

  let locale = $derived(languageState.locale);
</script>

<Select.Group>
  <Select.GroupHeading>{t(locale, "Unpredictive")}</Select.GroupHeading>
  {#each unpredictivePatternOptions as option (option.id)}
    <Select.Item value={option.id}>
      <span class="flex min-w-0 items-center gap-2">
        <PatternPathPreview patternId={option.id} />
        <span class="truncate">{t(locale, option.name)}</span>
      </span>
    </Select.Item>
  {/each}
</Select.Group>
<Select.Group>
  <Select.GroupHeading>{t(locale, "Predictive")}</Select.GroupHeading>
  {#each predictivePatternOptions as option (option.id)}
    <Select.Item value={option.id}>
      <span class="flex min-w-0 items-center gap-2">
        <PatternPathPreview patternId={option.id} />
        <span class="truncate">{t(locale, option.name)}</span>
      </span>
    </Select.Item>
  {/each}
</Select.Group>

<script lang="ts">
  import {
    getLanguageOption,
    isAppLocale,
    languageOptions,
  } from "$lib/i18n/locales";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import LanguagesIcon from "@lucide/svelte/icons/languages";
  import { onMount } from "svelte";

  let {
    id,
    onfocus,
    onblur,
  }: {
    id?: string;
    onfocus?: () => void;
    onblur?: () => void;
  } = $props();

  // Content pages have no trainer to start the language, so the select does.
  onMount(() => {
    void languageState.init();
  });

  let selectedLanguage = $derived(getLanguageOption(languageState.locale));

  const handleChange = (
    event: Event & { currentTarget: HTMLSelectElement }
  ) => {
    const { value } = event.currentTarget;

    if (isAppLocale(value)) {
      languageState.set(value);
    }
  };
</script>

<span class="inline-flex min-w-0 items-center gap-2">
  <LanguagesIcon class="size-4 shrink-0" aria-hidden="true" />
  <select
    {id}
    class="min-h-10 max-w-40 min-w-0"
    aria-label="{t('Change language')}: {selectedLanguage.nativeLabel}"
    {onblur}
    onchange={handleChange}
    {onfocus}
    title="{t('Language')}: {selectedLanguage.nativeLabel}"
    value={languageState.locale}
  >
    {#each languageOptions as option (option.locale)}
      <option value={option.locale}>
        {option.nativeLabel === option.label
          ? option.nativeLabel
          : `${option.nativeLabel} (${option.label})`}
      </option>
    {/each}
  </select>
</span>

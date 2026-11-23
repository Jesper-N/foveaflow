<script lang="ts">
  import { isAppLocale, languageOptions } from "$lib/i18n/locales";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { onMount } from "svelte";

  // Content pages have no trainer to start the language, so the select does.
  onMount(() => {
    void languageState.init();
  });

  const handleChange = (
    event: Event & { currentTarget: HTMLSelectElement }
  ) => {
    const { value } = event.currentTarget;

    if (isAppLocale(value)) {
      languageState.set(value);
    }
  };
</script>

<label>
  {t("Language")}
  <select onchange={handleChange} value={languageState.locale}>
    {#each languageOptions as option (option.locale)}
      <option value={option.locale}>
        {option.nativeLabel === option.label
          ? option.nativeLabel
          : `${option.nativeLabel} (${option.label})`}
      </option>
    {/each}
  </select>
</label>

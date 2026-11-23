<script lang="ts">
  import { isAppLocale, languageOptions } from "$lib/i18n/locales";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { LanguagesIcon } from "@lucide/svelte";
  import { onMount } from "svelte";

  import Select from "./ui/select.svelte";

  let { compact = false }: { compact?: boolean } = $props();

  onMount(() => {
    void languageState.init();
  });

  const groups = [
    {
      options: languageOptions.map((option) => ({
        label:
          option.nativeLabel === option.label
            ? option.nativeLabel
            : `${option.nativeLabel} (${option.label})`,
        value: option.locale,
      })),
    },
  ];
</script>

<Select
  {compact}
  {groups}
  hideLabel={compact}
  label={t("Language")}
  onValueChange={(value) => {
    if (isAppLocale(value)) {
      languageState.set(value);
    }
  }}
  value={languageState.locale}
>
  {#snippet trigger()}
    {#if compact}
      <LanguagesIcon class="size-4" aria-hidden="true" />
      <span class="text-sm uppercase">{languageState.locale.split("-")[0]}</span
      >
    {:else}
      <span class="truncate">
        {languageOptions.find(({ locale }) => locale === languageState.locale)
          ?.nativeLabel}
      </span>
    {/if}
  {/snippet}
</Select>

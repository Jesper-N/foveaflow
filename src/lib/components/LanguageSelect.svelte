<script lang="ts">
  import { onMount } from "svelte";

  import * as Select from "$lib/components/ui/select/index.js";
  import {
    getLanguageOption,
    isAppLocale,
    languageOptions,
  } from "$lib/i18n/locales";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils.js";

  let {
    class: className,
    triggerClass,
    contentClass,
    open = $bindable(false),
    onOpenChange,
    showSelectedName = false,
    collapseNameOnSmall = false,
    size = "default",
    variant,
  }: {
    class?: string;
    triggerClass?: string;
    contentClass?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showSelectedName?: boolean;
    collapseNameOnSmall?: boolean;
    size?: "sm" | "default";
    variant?: "default" | "outline";
  } = $props();

  onMount(() => {
    void languageState.init();
  });

  let selectedLanguage = $derived(getLanguageOption(languageState.locale));
  let triggerSize = $derived(showSelectedName ? size : "icon");
  let triggerVariant = $derived(
    variant ?? (showSelectedName ? "default" : "outline"),
  );

  const handleLanguageChange = (value: string) => {
    if (isAppLocale(value)) languageState.set(value);
  };
</script>

<Select.Root
  bind:open
  type="single"
  value={languageState.locale}
  onValueChange={handleLanguageChange}
  {onOpenChange}
>
  <Select.Trigger
    size={triggerSize}
    variant={triggerVariant}
    class={cn(
      "pressable-ui shrink-0",
      showSelectedName && "min-w-36 justify-between",
      showSelectedName &&
        collapseNameOnSmall &&
        "max-sm:size-9 max-sm:min-w-0 max-sm:justify-center max-sm:gap-0 max-sm:p-0 max-sm:[&>svg:last-child]:hidden",
      triggerClass,
      className,
    )}
    aria-label={`${t(languageState.locale, "Change language")}: ${selectedLanguage.label}`}
    title={`${t(languageState.locale, "Language")}: ${selectedLanguage.label}`}
  >
    <span aria-hidden="true">{selectedLanguage.flag}</span>
    {#if showSelectedName}
      <span
        class={cn("min-w-0 truncate", collapseNameOnSmall && "max-sm:sr-only")}
      >
        {selectedLanguage.nativeLabel}
      </span>
    {:else}
      <span class="sr-only">{selectedLanguage.label}</span>
    {/if}
  </Select.Trigger>
  <Select.Content class={cn("max-h-[min(75dvh,22rem)]", contentClass)}>
    <Select.Group>
      {#each languageOptions as option (option.locale)}
        <Select.Item value={option.locale}>
          <span class="flex min-w-0 items-center gap-2">
            <span aria-hidden="true">{option.flag}</span>
            <span class="truncate">{option.nativeLabel}</span>
            {#if option.nativeLabel !== option.label}
              <span class="truncate text-muted-foreground">{option.label}</span>
            {/if}
          </span>
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>

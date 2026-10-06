<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import {
    getLanguageOption,
    isAppLocale,
    languageOptions,
  } from "$lib/i18n/locales";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils";
  import LanguagesIcon from "@lucide/svelte/icons/languages";
  import { onMount } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    triggerClass,
    contentClass,
    open = $bindable(false),
    onOpenChange,
    showSelectedName = false,
    showTooltip = false,
    tooltipDisabled = false,
    collapseNameOnSmall = false,
    size = "default",
    variant = "default",
  }: {
    triggerClass?: string;
    /** Classes for the menu and tooltip, which render in a portal. */
    contentClass?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Shows the language name next to the icon. */
    showSelectedName?: boolean;
    /** Uses a tooltip instead of a native title. Needs a `Tooltip.Provider` above. */
    showTooltip?: boolean;
    tooltipDisabled?: boolean;
    /** Hides the name on small screens, leaving the icon. */
    collapseNameOnSmall?: boolean;
    size?: "sm" | "default";
    variant?: "default" | "ghost";
  } = $props();

  // Content pages have no trainer to start the language, so the select does.
  onMount(() => {
    void languageState.init();
  });

  let selectedLanguage = $derived(getLanguageOption(languageState.locale));

  const handleLanguageChange = (value: string) => {
    if (isAppLocale(value)) {
      languageState.set(value);
    }
  };
</script>

{#snippet languageTrigger(props: HTMLButtonAttributes = {})}
  <Select.Trigger
    {...props}
    {size}
    class={cn(
      "shrink-0",
      variant === "ghost" && buttonVariants({ size, variant }),
      !showSelectedName &&
        "size-9 justify-center rounded-4xl p-0 [&>svg:last-child]:hidden",
      showSelectedName && "min-w-36 justify-between",
      showSelectedName &&
        collapseNameOnSmall &&
        "max-sm:size-9 max-sm:min-w-0 max-sm:justify-center max-sm:gap-0 max-sm:p-0 max-sm:[&>svg:last-child]:hidden",
      variant === "ghost" &&
        "text-muted-foreground min-w-0 justify-center gap-2 bg-transparent",
      triggerClass
    )}
    aria-label={`${t("Change language")}: ${selectedLanguage.nativeLabel}`}
    title={showTooltip
      ? undefined
      : `${t("Language")}: ${selectedLanguage.nativeLabel}`}
  >
    <LanguagesIcon />
    {#if showSelectedName}
      <span
        class={cn(
          "min-w-0 flex-1 truncate text-start",
          collapseNameOnSmall && "max-sm:sr-only"
        )}
      >
        {selectedLanguage.nativeLabel}
      </span>
    {/if}
  </Select.Trigger>
{/snippet}

<Select.Root
  bind:open
  type="single"
  value={languageState.locale}
  onValueChange={handleLanguageChange}
  {onOpenChange}
>
  {#if showTooltip}
    <Tooltip.Root disabled={open || tooltipDisabled}>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          {@render languageTrigger(props)}
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom" sideOffset={6} class={contentClass}>
        {t("Language")}
      </Tooltip.Content>
    </Tooltip.Root>
  {:else}
    {@render languageTrigger()}
  {/if}
  <Select.Content
    class={cn(
      "max-h-[min(75dvh,22rem)] max-w-[calc(100dvw-1.5rem)]",
      contentClass
    )}
  >
    <Select.Group>
      {#each languageOptions as option (option.locale)}
        <Select.Item value={option.locale}>
          <span class="flex min-w-0 items-center gap-2">
            <span class="truncate">{option.nativeLabel}</span>
            {#if option.nativeLabel !== option.label}
              <span class="text-muted-foreground hidden truncate sm:inline"
                >{option.label}</span
              >
            {/if}
          </span>
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>

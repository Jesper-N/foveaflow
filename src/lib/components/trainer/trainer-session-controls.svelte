<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import LanguagesIcon from "@lucide/svelte/icons/languages";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SunIcon from "@lucide/svelte/icons/sun";

  let {
    actions,
    motionPaused,
    motionDirectionLabel,
    canToggleDirection,
    isDarkMode,
  }: {
    actions: TrainerDialogActions;
    motionPaused: boolean;
    motionDirectionLabel: string;
    canToggleDirection: boolean;
    isDarkMode: boolean;
  } = $props();

  let locale = $derived(languageState.locale);
</script>

<div class="grid gap-5">
  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      {#if motionPaused}
        <PlayIcon class="text-brand-foreground size-5 shrink-0" />
      {:else}
        <PauseIcon class="text-brand-foreground size-5 shrink-0" />
      {/if}
      <span class="truncate text-base font-medium">{t(locale, "Motion")}</span>
    </div>
    <Button
      variant="outline"
      size="sm"
      aria-describedby="trainer-motion-status"
      onclick={actions.toggleMotionPaused}
    >
      {motionPaused ? t(locale, "Resume") : t(locale, "Pause")}
    </Button>
  </div>

  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      <ArrowLeftRightIcon class="text-brand-foreground size-5 shrink-0" />
      <span class="truncate text-base font-medium">
        {t(locale, "Direction")}
      </span>
    </div>
    <Button
      variant="outline"
      size="sm"
      aria-describedby="trainer-motion-status"
      disabled={!canToggleDirection}
      onclick={actions.toggleMotionDirection}
    >
      {motionDirectionLabel}
    </Button>
  </div>

  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      {#if isDarkMode}
        <MoonIcon class="text-brand-foreground size-5 shrink-0" />
      {:else}
        <SunIcon class="text-brand-foreground size-5 shrink-0" />
      {/if}
      <span class="truncate text-base font-medium">
        {t(locale, "Dark mode")}
      </span>
    </div>
    <Switch
      checked={isDarkMode}
      onCheckedChange={actions.handleThemeCheckedChange}
      aria-label={t(locale, "Use dark theme")}
    />
  </div>

  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      <LanguagesIcon class="text-brand-foreground size-5 shrink-0" />
      <span class="truncate text-base font-medium">
        {t(locale, "Language")}
      </span>
    </div>
    <LanguageSelect showSelectedName size="sm" triggerClass="max-w-44" />
  </div>
</div>

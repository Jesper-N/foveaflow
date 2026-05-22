<script lang="ts">
  import ArrowLeftRightIcon from "@lucide/svelte/icons/arrow-left-right";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import PauseIcon from "@lucide/svelte/icons/pause";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SunIcon from "@lucide/svelte/icons/sun";

  import { Button } from "$lib/components/ui/button/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";

  let {
    settings,
    motionPaused,
    motionDirectionLabel,
    canToggleDirection,
    isDarkMode,
    toggleMotionPaused,
    toggleMotionDirection,
    handleThemeCheckedChange,
  }: {
    settings: TrainerSettings;
    motionPaused: boolean;
    motionDirectionLabel: string;
    canToggleDirection: boolean;
    isDarkMode: boolean;
    toggleMotionPaused: () => void;
    toggleMotionDirection: () => void;
    handleThemeCheckedChange: (checked: boolean) => void;
  } = $props();
</script>

<div class="grid gap-5">
  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      {#if motionPaused}
        <PlayIcon class="size-5 shrink-0 text-accent" />
      {:else}
        <PauseIcon class="size-5 shrink-0 text-accent" />
      {/if}
      <span class="truncate text-base font-medium">Motion</span>
    </div>
    <Button
      class="pressable-ui"
      variant="outline"
      size="sm"
      aria-pressed={motionPaused}
      aria-describedby="trainer-motion-status"
      onclick={toggleMotionPaused}
    >
      {motionPaused ? "Resume" : "Pause"}
    </Button>
  </div>

  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      <ArrowLeftRightIcon class="size-5 shrink-0 text-accent" />
      <span class="truncate text-base font-medium">Direction</span>
    </div>
    <Button
      class="pressable-ui"
      variant="outline"
      size="sm"
      aria-pressed={settings.motionDirection === -1}
      aria-describedby="trainer-motion-status"
      disabled={!canToggleDirection}
      onclick={toggleMotionDirection}
    >
      {motionDirectionLabel}
    </Button>
  </div>

  <div class="flex min-h-12 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      {#if isDarkMode}
        <MoonIcon class="size-5 shrink-0 text-accent" />
      {:else}
        <SunIcon class="size-5 shrink-0 text-accent" />
      {/if}
      <span class="truncate text-base font-medium">Dark mode</span>
    </div>
    <Switch
      checked={isDarkMode}
      onCheckedChange={handleThemeCheckedChange}
      aria-label="Use dark theme"
    />
  </div>
</div>

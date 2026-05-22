<script lang="ts">
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";
  import SunIcon from "@lucide/svelte/icons/sun";
  import TargetIcon from "@lucide/svelte/icons/crosshair";

  import type { ControlIconId } from "$lib/trainer/options";

  let {
    icon,
    colorMode,
    iconClass,
  }: {
    icon: ControlIconId;
    colorMode: "light" | "dark";
    iconClass?: string;
  } = $props();
</script>

{#if icon === "target"}
  <TargetIcon class={iconClass} />
{:else if icon === "motion"}
  <ActivityIcon class={iconClass} />
{:else if icon === "eye"}
  <EyeIcon class={iconClass} />
{:else if icon === "theme"}
  {#if colorMode === "dark"}
    <MoonIcon class={iconClass} />
  {:else}
    <SunIcon class={iconClass} />
  {/if}
{:else if icon === "reset"}
  <RotateCcwIcon class={iconClass} />
{:else}
  <SettingsIcon class={iconClass} />
{/if}

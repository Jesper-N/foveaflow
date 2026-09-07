<script lang="ts">
  import type { ControlIconId } from "$lib/trainer/options";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import SettingsIcon from "@lucide/svelte/icons/settings-2";

  let {
    icon,
    iconClass,
  }: {
    icon: ControlIconId;
    iconClass?: string;
  } = $props();
</script>

{#if icon === "target"}
  <TargetIcon class={iconClass} />
{:else if icon === "eye"}
  <EyeIcon class={iconClass} />
{:else if icon === "display"}
  <MonitorIcon class={iconClass} />
{:else}
  <SettingsIcon class={iconClass} />
{/if}

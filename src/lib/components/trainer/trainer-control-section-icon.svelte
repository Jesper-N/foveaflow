<script lang="ts">
  import type { ControlIconId } from "$lib/trainer/options";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import RouteIcon from "@lucide/svelte/icons/route";
  import SettingsIcon from "@lucide/svelte/icons/settings";

  let {
    icon,
    iconClass,
  }: {
    icon: ControlIconId;
    iconClass?: string;
  } = $props();
</script>

{#if icon === "route"}
  <RouteIcon class={iconClass} />
{:else if icon === "target"}
  <TargetIcon class={iconClass} />
{:else}
  <SettingsIcon class={iconClass} />
{/if}

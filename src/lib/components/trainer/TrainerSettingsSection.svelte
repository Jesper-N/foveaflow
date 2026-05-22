<script lang="ts">
  import type { Snippet } from "svelte";

  import TrainerControlSectionIcon from "$lib/components/trainer/TrainerControlSectionIcon.svelte";
  import type { ControlIconId } from "$lib/trainer/options";

  let {
    icon,
    label,
    colorMode,
    children,
  }: {
    icon: ControlIconId;
    label: string;
    colorMode: "light" | "dark";
    children: Snippet;
  } = $props();
</script>

<section class="settings-section space-y-6">
  <div
    class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
  >
    <TrainerControlSectionIcon
      {icon}
      {colorMode}
      iconClass="size-4 text-accent"
    />
    {label}
  </div>

  {@render children()}
</section>

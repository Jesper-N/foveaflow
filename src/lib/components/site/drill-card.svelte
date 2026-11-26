<script lang="ts">
  import type { DrillId } from "$lib/trainer/settings/drills";

  import DrillIcon from "../icons/drill-icon.svelte";
  import DrillPreview from "../icons/drill-preview.svelte";
  import { pressable } from "../ui/styles";

  interface Props {
    drillId: DrillId;
    href: string;
    title: string;
    summary?: string;
  }

  let { drillId, href, title, summary }: Props = $props();

  let exploring = $state(false);
</script>

<a
  class={[
    "bg-card grid content-start rounded-4xl p-2 motion-safe:active:scale-98",
    pressable,
  ]}
  {href}
  onblur={() => (exploring = false)}
  onfocus={() => (exploring = true)}
  onpointerenter={() => (exploring = true)}
  onpointerleave={() => (exploring = false)}
>
  <DrillPreview
    class="aspect-4/3 w-full rounded-3xl"
    backdrop="fovea"
    {drillId}
    playing={exploring}
  />
  <span class="grid gap-1 p-3 pt-4">
    <span class="flex items-center gap-2 text-base font-medium tracking-tight">
      <DrillIcon class="text-muted-foreground size-4.5 shrink-0" {drillId} />
      {title}
    </span>
    {#if summary}
      <span class="text-muted-foreground text-sm text-pretty">{summary}</span>
    {/if}
  </span>
</a>

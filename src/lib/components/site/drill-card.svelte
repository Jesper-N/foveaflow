<script lang="ts">
  import type { DrillId } from "$lib/trainer/settings/drills";
  import { ArrowUpRightIcon } from "@lucide/svelte";

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
    "group/tile bg-card grid content-start rounded-4xl p-2 motion-safe:active:scale-98",
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
  <span class="flex items-start gap-3 p-3 pt-4">
    <span class="grid min-w-0 flex-1 gap-1">
      <span
        class="flex items-center gap-2 text-base font-medium tracking-tight"
      >
        <DrillIcon class="text-muted-foreground size-4.5 shrink-0" {drillId} />
        {title}
      </span>
      {#if summary}
        <span class="text-muted-foreground text-sm text-pretty">{summary}</span>
      {/if}
    </span>
    <span
      class="bg-fill-hover text-foreground ease-spring grid size-9 shrink-0 place-items-center rounded-full transition-[opacity,scale] duration-260 pointer-fine:scale-86 pointer-fine:opacity-0 pointer-fine:group-hover/tile:scale-100 pointer-fine:group-hover/tile:opacity-100 pointer-fine:group-focus-visible/tile:scale-100 pointer-fine:group-focus-visible/tile:opacity-100"
      aria-hidden="true"
    >
      <ArrowUpRightIcon class="size-4 rtl:-scale-x-100" />
    </span>
  </span>
</a>

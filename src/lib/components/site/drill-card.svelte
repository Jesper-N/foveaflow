<script lang="ts">
  import type { DrillId } from "$lib/trainer/settings/drills";

  import DrillIllustration from "../icons/drill-illustration.svelte";
  import { pressable } from "../ui/styles";

  interface Props {
    drillId: DrillId;
    href: string;
    title: string;
    summary: string;
  }

  let { drillId, href, title, summary }: Props = $props();
</script>

<a
  class={[
    "group/drill bg-fill hover:bg-fill-hover grid content-start gap-3 rounded-2xl p-2 pb-4 motion-safe:active:scale-98",
    pressable,
  ]}
  {href}
>
  <DrillIllustration class="aspect-8/5 w-full rounded-xl" {drillId} />
  <span class="grid gap-1 px-2">
    <span class="text-base font-medium tracking-tight">{title}</span>
    <span class="text-muted-foreground text-sm text-pretty">{summary}</span>
  </span>
</a>

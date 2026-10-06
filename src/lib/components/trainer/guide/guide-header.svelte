<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import { stageGrid } from "$lib/components/site/styles";
  import type { DrillId } from "$lib/trainer/settings/drills";

  let {
    title,
    lede,
    drillId,
  }: {
    title: string;
    lede: string;
    /** Adds the drill's illustration beside the title on wider screens. */
    drillId?: DrillId;
  } = $props();
</script>

<!-- The stage echoes the trainer canvas: page background with a faint grid. -->
<header
  class={[
    "border-border/60 bg-background relative grid items-center gap-6 border-b px-6 pt-7 pb-6 sm:py-7 sm:pr-20 sm:pl-8",
    stageGrid,
    drillId && "sm:grid-cols-[minmax(0,1fr)_13rem]",
  ]}
>
  <div class={["guide-enter grid gap-3 pr-12", drillId && "sm:pr-0"]}>
    <h2
      id="trainer-guide-title"
      class="relative text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl"
    >
      {title}
    </h2>
    <p
      class="text-muted-foreground relative max-w-[46ch] text-base leading-7 text-pretty"
    >
      {lede}
    </p>
  </div>
  {#if drillId}
    <DrillIllustration {drillId} class="relative hidden sm:block" />
  {/if}
</header>

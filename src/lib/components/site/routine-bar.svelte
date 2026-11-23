<script lang="ts">
  import { formatMinutes } from "$lib/i18n/translate";
  import type { DrillId } from "$lib/trainer/settings/drills";
  import type { Attachment } from "svelte/attachments";

  import DrillIcon from "../icons/drill-icon.svelte";
  import DrillPreview from "../icons/drill-preview.svelte";

  interface Props {
    steps: readonly { drillId: DrillId; minutes: number }[];
  }

  let { steps }: Props = $props();

  let exploring = $state<number | null>(null);
  let total = $derived(steps.reduce((sum, step) => sum + step.minutes, 0));

  const share =
    (minutes: number): Attachment<HTMLElement> =>
    (node) => {
      node.style.flexGrow = String(minutes);
    };
</script>

<div class="bg-card grid gap-2 rounded-4xl p-2" aria-hidden="true">
  <ol class="flex h-12 gap-1.5 sm:h-44">
    {#each steps as step, index (step.drillId)}
      <li
        class={[
          "canvas-grid relative grid min-w-0 basis-0 place-items-center overflow-hidden rounded-2xl transition-opacity duration-300 ease-out sm:rounded-3xl",
          exploring !== null && exploring !== index && "opacity-50",
        ]}
        {@attach share(step.minutes)}
        onpointerenter={() => (exploring = index)}
        onpointerleave={() => (exploring = null)}
      >
        <DrillPreview
          class="size-full max-sm:hidden"
          drillId={step.drillId}
          playing={exploring === index}
        />
        <span
          class="sm:bg-popover/90 sm:shadow-thumb flex h-7 items-center gap-1.5 rounded-full text-xs font-medium whitespace-nowrap tabular-nums sm:absolute sm:inset-s-2 sm:top-2 sm:ps-1.5 sm:pe-2.5 sm:backdrop-blur-md"
        >
          <DrillIcon class="size-4" drillId={step.drillId} />
          <span class="max-sm:sr-only">{formatMinutes(step.minutes)}</span>
        </span>
      </li>
    {/each}
  </ol>
  <div
    class="text-muted-foreground flex justify-between px-3 pb-1 text-xs tabular-nums"
  >
    <span>{formatMinutes(0)}</span>
    <span>{formatMinutes(total)}</span>
  </div>
</div>

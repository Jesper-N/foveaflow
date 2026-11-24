<script lang="ts">
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { formatMinutes, t } from "$lib/i18n/translate";
  import { getDrill } from "$lib/trainer/settings/drills";
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

<div class="bg-card grid gap-2 rounded-4xl p-2">
  <ol class="flex h-14 gap-1.5 sm:h-60">
    {#each steps as step, index (step.drillId)}
      <li
        class={[
          "canvas-grid relative grid min-w-0 basis-0 place-items-center overflow-hidden rounded-2xl transition-opacity duration-300 ease-out sm:rounded-3xl",
          exploring !== null && exploring !== index && "opacity-50",
        ]}
        {@attach share(step.minutes)}
      >
        <a
          class="absolute inset-0 flex items-center justify-center rounded-[inherit] outline-offset-2"
          aria-label="{t(getDrill(step.drillId).name)}, {formatMinutes(
            step.minutes
          )}"
          href={mainRouteForDrill(step.drillId)?.path ?? "/"}
          onblur={() => (exploring = null)}
          onfocus={() => (exploring = index)}
          onpointerenter={() => (exploring = index)}
          onpointerleave={() => (exploring = null)}
        >
          <DrillPreview
            class="size-full max-sm:hidden"
            backdrop="fovea"
            drillId={step.drillId}
            playing={exploring === index}
          />
          <span
            class="sm:bg-popover/90 sm:shadow-thumb flex h-7 items-center gap-1.5 rounded-full text-xs font-medium whitespace-nowrap tabular-nums sm:absolute sm:inset-s-2 sm:top-2 sm:ps-1.5 sm:pe-2.5 sm:backdrop-blur-md"
            aria-hidden="true"
          >
            <DrillIcon class="size-4" drillId={step.drillId} />
            <span class="max-sm:hidden">{formatMinutes(step.minutes)}</span>
          </span>
        </a>
      </li>
    {/each}
  </ol>
  <div
    class="text-muted-foreground flex justify-between px-3 pb-1 text-xs tabular-nums"
    aria-hidden="true"
  >
    <span>{formatMinutes(0)}</span>
    <span>{formatMinutes(total)}</span>
  </div>
</div>

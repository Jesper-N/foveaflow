<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { cueChoice, isPersonChange } from "$lib/sound/sound.svelte";
  import { drills } from "$lib/trainer/settings/drills";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import type { Attachment } from "svelte/attachments";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import { setTravelDirection } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();

  let track = $state.raw<HTMLElement>();

  const trackElement: Attachment<HTMLElement> = (node) => {
    track = node;
  };

  const indexOf = (drillId: string) =>
    drills.findIndex((drill) => drill.id === drillId);
</script>

<SegmentedControl
  class="bg-fill relative flex w-max items-center rounded-full p-0.5"
  {@attach trackElement}
  aria-label={t("Drill")}
  data-island-drills
  onValueChange={(next, details) => {
    if (typeof next === "string") {
      setTravelDirection(
        track,
        indexOf(trainer.settings.drillId),
        indexOf(next)
      );

      if (isPersonChange(details)) {
        cueChoice(indexOf(trainer.settings.drillId), indexOf(next));
      }

      trainer.selectDrill(next);
    }
  }}
  value={trainer.settings.drillId}
>
  <SegmentedControlIndicator
    class="stretch-indicator bg-thumb shadow-thumb absolute top-(--segmented-control-indicator-top) right-[calc(100%-var(--segmented-control-indicator-left)-var(--segmented-control-indicator-width))] left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) rounded-full"
  />
  {#each drills as drill (drill.id)}
    <SegmentedControlItem
      class="group/drill text-muted-foreground hover:text-foreground data-checked:text-foreground relative z-1 flex h-8 cursor-pointer items-center rounded-full px-2.5 text-sm font-medium transition-colors duration-160 ease-out outline-none select-none focus-visible:outline-2 pointer-coarse:h-10"
      aria-label={t(drill.name)}
      value={drill.id}
    >
      <DrillIcon class="size-4.5 shrink-0" drillId={drill.id} />
      <span
        class="ease-drawer grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 max-sm:hidden sm:group-data-checked/drill:grid-cols-[1fr]"
      >
        <span
          class="overflow-hidden ps-0 whitespace-nowrap transition-[padding] duration-300 group-data-checked/drill:ps-2"
          aria-hidden="true"
        >
          {t(drill.name)}
        </span>
      </span>
    </SegmentedControlItem>
  {/each}
</SegmentedControl>

<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { homeCopy } from "$lib/content/home";
  import { t } from "$lib/i18n/translate";
  import { getDrill } from "$lib/trainer/settings/drills";
  import type { DrillId } from "$lib/trainer/settings/drills";
  import { DialogDescription, DialogTitle } from "@ui-sdk/svelte/dialog";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import DrillPreview from "../../icons/drill-preview.svelte";
  import { pressable } from "../../ui/styles";
  import {
    guideAside,
    guideHeading,
    guideLayout,
    guideScroll,
    guideSection,
  } from "./guide-styles";

  let shown = $state<DrillId>("pursuit");
</script>

<div class={guideLayout}>
  <div class={guideAside}>
    <div
      class="short:h-full relative grid h-52 overflow-hidden rounded-3xl sm:h-64"
    >
      {#each drillGuides as guide (guide.drillId)}
        <DrillPreview
          class={[
            "col-start-1 row-start-1 size-full transition-opacity duration-300 ease-out",
            shown === guide.drillId ? "opacity-100" : "opacity-0",
          ]}
          backdrop="fovea"
          drillId={guide.drillId}
          playing={shown === guide.drillId}
        />
      {/each}
      <span
        class="bg-popover/90 shadow-thumb absolute inset-s-3 bottom-3 flex h-8 items-center gap-2 rounded-full ps-2 pe-3 text-sm font-medium backdrop-blur-md"
      >
        <DrillIcon class="size-4" drillId={shown} />
        {t(getDrill(shown).name)}
      </span>
    </div>
  </div>

  <div class={guideScroll}>
    <header class="grid gap-2.5 pe-10">
      <DialogTitle
        id="trainer-guide-title"
        class="text-xl font-semibold text-balance"
      >
        {t(homeCopy.heading)}
      </DialogTitle>
      <DialogDescription class="text-muted-foreground text-base text-pretty">
        {t(homeCopy.hero)}
      </DialogDescription>
    </header>

    <section class={guideSection} aria-labelledby="trainer-guide-drills">
      <h3 id="trainer-guide-drills" class={guideHeading}>{t("Drills")}</h3>
      <ul class="-mx-2 grid">
        {#each drillGuides as guide (guide.drillId)}
          <li>
            <a
              class={[
                "hover:bg-fill flex items-center gap-3.5 rounded-2xl p-2",
                shown === guide.drillId && "bg-fill",
                pressable,
              ]}
              href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
              onfocus={() => (shown = guide.drillId)}
              onpointerenter={() => (shown = guide.drillId)}
            >
              <DrillIcon class="size-5 shrink-0" drillId={guide.drillId} />
              <span class="grid min-w-0 flex-1 gap-0.5">
                <span class="text-md font-medium">{t(guide.title)}</span>
                <span class="text-muted-foreground text-sm text-pretty">
                  {t(guide.summary)}
                </span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</div>

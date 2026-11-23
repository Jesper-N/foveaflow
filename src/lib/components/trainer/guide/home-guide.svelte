<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { homeCopy } from "$lib/content/home";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { getDrill } from "$lib/trainer/settings/drills";
  import type { DrillId } from "$lib/trainer/settings/drills";
  import { ArrowUpRightIcon } from "@lucide/svelte";
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
    <div class="relative grid h-52 overflow-hidden rounded-3xl sm:h-64">
      {#each drillGuides as guide (guide.drillId)}
        <DrillPreview
          class={[
            "col-start-1 row-start-1 size-full transition-opacity duration-300 ease-out",
            shown === guide.drillId ? "opacity-100" : "opacity-0",
          ]}
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
                "group/row hover:bg-fill flex items-center gap-3.5 rounded-2xl p-2",
                shown === guide.drillId && "bg-fill",
                pressable,
              ]}
              href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
              onfocus={() => (shown = guide.drillId)}
              onpointerenter={() => (shown = guide.drillId)}
            >
              <span
                class={[
                  "grid size-11 shrink-0 place-items-center rounded-xl transition-[background-color,box-shadow] duration-160 ease-out",
                  shown === guide.drillId
                    ? "bg-popover shadow-thumb"
                    : "bg-fill",
                ]}
              >
                <DrillIcon class="size-5" drillId={guide.drillId} />
              </span>
              <span class="grid min-w-0 flex-1 gap-0.5">
                <span class="text-md font-medium">{t(guide.title)}</span>
                <span class="text-muted-foreground text-sm text-pretty">
                  {t(guide.summary)}
                </span>
              </span>
              <ArrowUpRightIcon
                class="text-muted-foreground ease-spring group-hover/row:text-foreground size-4 shrink-0 transition-[translate,color] duration-260 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 rtl:-scale-x-100"
                aria-hidden="true"
              />
            </a>
          </li>
        {/each}
      </ul>
    </section>

    <section class={guideSection} aria-labelledby="trainer-guide-overview">
      <h3 id="trainer-guide-overview" class={guideHeading}>{t("Overview")}</h3>
      <div class="text-md text-muted-foreground grid gap-3 text-pretty">
        {#each homeCopy.body as paragraph (paragraph)}
          <p>{t(paragraph)}</p>
        {/each}
        <p>{t(freeUseNote)}</p>
      </div>
    </section>
  </div>
</div>

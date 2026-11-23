<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { homeCopy } from "$lib/content/home";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
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

  let exploring = $state<DrillId | null>(null);
</script>

<div class={guideLayout}>
  <div class={guideAside}>
    <div
      class="grid h-full grid-cols-2 gap-1 overflow-hidden rounded-3xl max-md:aspect-video"
    >
      {#each drillGuides as guide (guide.drillId)}
        <DrillPreview
          class={[
            "size-full transition-opacity duration-300 ease-out",
            exploring !== null && exploring !== guide.drillId && "opacity-40",
          ]}
          drillId={guide.drillId}
          playing={exploring === guide.drillId}
        />
      {/each}
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
                pressable,
              ]}
              href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
              onblur={() => (exploring = null)}
              onfocus={() => (exploring = guide.drillId)}
              onpointerenter={() => (exploring = guide.drillId)}
              onpointerleave={() => (exploring = null)}
            >
              <span
                class="bg-fill grid size-11 shrink-0 place-items-center rounded-xl"
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

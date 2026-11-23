<script lang="ts">
  import { getDrillGuide } from "$lib/content/drill-guides";
  import type { DrillRoute } from "$lib/content/drill-routes";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { getDrill } from "$lib/trainer/settings/drills";
  import { DialogDescription, DialogTitle } from "@ui-sdk/svelte/dialog";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import DrillPreview from "../../icons/drill-preview.svelte";
  import StepList from "../../site/step-list.svelte";
  import AccordionList from "../../ui/accordion-list.svelte";
  import {
    guideAside,
    guideHeading,
    guideLayout,
    guideScroll,
    guideSection,
  } from "./guide-styles";

  let { route }: { route: DrillRoute } = $props();

  let drillGuide = $derived(getDrillGuide(route.drillId));
  let copy = $derived(route.copy);

  let faq = $derived(
    copy.faq.map(({ question, answer }) => ({
      answer: t(answer),
      question: t(question),
    }))
  );
</script>

<div class={guideLayout}>
  <div class={guideAside}>
    <div
      class="relative h-full overflow-hidden rounded-3xl max-md:aspect-video"
    >
      <DrillPreview class="size-full" drillId={route.drillId} />
      <span
        class="bg-popover/90 shadow-thumb absolute inset-s-3 bottom-3 flex h-8 items-center gap-2 rounded-full ps-2 pe-3 text-sm font-medium backdrop-blur-md"
      >
        <DrillIcon class="size-4" drillId={route.drillId} />
        {t(getDrill(route.drillId).name)}
      </span>
    </div>
  </div>

  <div class={guideScroll}>
    <header class="grid gap-2.5 pe-10">
      <DialogTitle
        id="trainer-guide-title"
        class="text-xl font-semibold text-balance"
      >
        {t(copy.heading)}
      </DialogTitle>
      <DialogDescription class="text-muted-foreground text-base text-pretty">
        {t(copy.hero)}
      </DialogDescription>
    </header>

    <section class={guideSection} aria-labelledby="trainer-guide-steps">
      <h3 id="trainer-guide-steps" class={guideHeading}>
        {t("How to practice")}
      </h3>
      <StepList steps={drillGuide.steps} />
      <p class="bg-fill text-md mt-2 rounded-2xl p-4 text-pretty">
        <span class="font-medium">{t("What it trains:")}</span>
        <span class="text-muted-foreground">{t(drillGuide.benefits)}</span>
      </p>
    </section>

    <section class={guideSection} aria-labelledby="trainer-guide-faq">
      <h3 id="trainer-guide-faq" class={guideHeading}>{t("Quick answers")}</h3>
      <AccordionList headingLevel={4} items={faq} />
    </section>

    <section class={guideSection} aria-labelledby="trainer-guide-overview">
      <h3 id="trainer-guide-overview" class={guideHeading}>{t("Overview")}</h3>
      <div class="text-md text-muted-foreground grid gap-3 text-pretty">
        {#each copy.body as paragraph (paragraph)}
          <p>{t(paragraph)}</p>
        {/each}
        <p>{t(freeUseNote)}</p>
      </div>
    </section>
  </div>
</div>

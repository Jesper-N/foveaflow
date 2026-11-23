<script lang="ts">
  import { getDrillGuide } from "$lib/content/drill-guides";
  import type { DrillRoute } from "$lib/content/drill-routes";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { DialogDescription, DialogTitle } from "@ui-sdk/svelte/dialog";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import StepList from "../../site/step-list.svelte";
  import { guideHeading, guideSection } from "./guide-styles";

  let { route }: { route: DrillRoute } = $props();

  let drillGuide = $derived(getDrillGuide(route.drillId));
  let copy = $derived(route.copy);
</script>

<header class="grid max-w-md gap-3 pe-10">
  <span class="bg-fill grid size-10 place-items-center rounded-xl">
    <DrillIcon class="size-5" drillId={route.drillId} />
  </span>
  <div class="grid gap-2">
    <DialogTitle
      id="trainer-guide-title"
      class="text-xl font-semibold text-balance"
    >
      {t(copy.heading)}
    </DialogTitle>
    <DialogDescription class="text-muted-foreground text-base">
      {t(copy.hero)}
    </DialogDescription>
  </div>
</header>

<section class={guideSection} aria-labelledby="trainer-guide-steps">
  <h3 id="trainer-guide-steps" class={guideHeading}>{t("How to practice")}</h3>
  <StepList steps={drillGuide.steps} />
  <p class="bg-fill text-md rounded-2xl p-4">
    <span class="font-medium">{t("What it trains:")}</span>
    <span class="text-muted-foreground">{t(drillGuide.benefits)}</span>
  </p>
</section>

<section class={guideSection} aria-labelledby="trainer-guide-faq">
  <h3 id="trainer-guide-faq" class={guideHeading}>{t("Quick answers")}</h3>
  <div class="grid gap-4">
    {#each copy.faq as item (item.question)}
      <div class="grid gap-1">
        <h4 class="text-md font-medium">{t(item.question)}</h4>
        <p class="text-md text-muted-foreground">{t(item.answer)}</p>
      </div>
    {/each}
  </div>
</section>

<section class={guideSection} aria-labelledby="trainer-guide-overview">
  <h3 id="trainer-guide-overview" class={guideHeading}>{t("Overview")}</h3>
  <div class="text-md text-muted-foreground grid gap-3">
    {#each copy.body as paragraph (paragraph)}
      <p>{t(paragraph)}</p>
    {/each}
    <p>{t(freeUseNote)}</p>
  </div>
</section>

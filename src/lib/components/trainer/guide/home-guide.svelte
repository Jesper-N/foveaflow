<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { homeCopy } from "$lib/content/home";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { DialogDescription, DialogTitle } from "@ui-sdk/svelte/dialog";

  import DrillCard from "../../site/drill-card.svelte";
  import { guideHeading, guideSection } from "./guide-styles";
</script>

<header class="grid max-w-md gap-2 pe-10">
  <DialogTitle
    id="trainer-guide-title"
    class="text-xl font-semibold text-balance"
  >
    {t(homeCopy.heading)}
  </DialogTitle>
  <DialogDescription class="text-muted-foreground text-base">
    {t(homeCopy.hero)}
  </DialogDescription>
</header>

<section class={guideSection} aria-labelledby="trainer-guide-drills">
  <h3 id="trainer-guide-drills" class={guideHeading}>{t("Drills")}</h3>
  <ul class="grid gap-2 sm:grid-cols-2">
    {#each drillGuides as guide (guide.drillId)}
      <li class="grid">
        <DrillCard
          drillId={guide.drillId}
          href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
          summary={t(guide.summary)}
          title={t(guide.title)}
        />
      </li>
    {/each}
  </ul>
</section>

<section class={guideSection} aria-labelledby="trainer-guide-overview">
  <h3 id="trainer-guide-overview" class={guideHeading}>{t("Overview")}</h3>
  <div class="text-md text-muted-foreground grid gap-3">
    {#each homeCopy.body as paragraph (paragraph)}
      <p>{t(paragraph)}</p>
    {/each}
    <p>{t(freeUseNote)}</p>
  </div>
</section>

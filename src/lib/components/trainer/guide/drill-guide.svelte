<script lang="ts">
  import { getDrillGuide } from "$lib/content/drill-guides";
  import type { DrillRoute } from "$lib/content/drill-routes";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";

  let { route }: { route: DrillRoute } = $props();

  let drillGuide = $derived(getDrillGuide(route.drillId));
  let copy = $derived(route.copy);
</script>

<h2 id="trainer-guide-title">{t(copy.heading)}</h2>
<p>{t(copy.hero)}</p>

<section aria-labelledby="trainer-guide-steps">
  <h3 id="trainer-guide-steps">{t("How to practice")}</h3>
  <ol>
    {#each drillGuide.steps as step (step)}
      <li>{t(step)}</li>
    {/each}
  </ol>
  <p>{t("What it trains:")} {t(drillGuide.benefits)}</p>
</section>

<section aria-labelledby="trainer-guide-faq">
  <h3 id="trainer-guide-faq">{t("Quick answers")}</h3>
  {#each copy.faq as item (item.question)}
    <h4>{t(item.question)}</h4>
    <p>{t(item.answer)}</p>
  {/each}
</section>

<section aria-labelledby="trainer-guide-overview">
  <h3 id="trainer-guide-overview">{t("Overview")}</h3>
  {#each copy.body as paragraph (paragraph)}
    <p>{t(paragraph)}</p>
  {/each}
  <p>{t(freeUseNote)}</p>
</section>

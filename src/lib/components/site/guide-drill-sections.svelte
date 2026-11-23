<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import {
    mainRouteForDrill,
    patternDrillRoutes,
  } from "$lib/content/drill-routes";
  import { audiences } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";

  import PageSection from "./page-section.svelte";
  import StepList from "./step-list.svelte";
</script>

<PageSection
  id="practice"
  heading={t("How each drill works")}
  intro={t(
    "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
  )}
>
  {#each drillGuides as guide (guide.drillId)}
    <article id={guide.drillId}>
      <h3>{t(guide.title)}</h3>
      <p>{t(guide.summary)}</p>
      <a href={mainRouteForDrill(guide.drillId)?.path}>{t("Try this drill")}</a>
      <StepList steps={guide.steps} />
      <p>{t("What it trains:")} {t(guide.benefits)}</p>
    </article>
  {/each}
</PageSection>

<PageSection
  id="patterns"
  heading={t("Motion paths")}
  intro={t(
    "Start with a predictable path for steady tracking. Try random movement or hard turns when you want to spend more time finding the target. Each link opens Smooth Pursuit with that path selected."
  )}
>
  <nav aria-label={t("Pattern routes")}>
    <ul>
      {#each patternDrillRoutes as route (route.slug)}
        <li><a href={route.path}>{t(route.label)}</a></li>
      {/each}
    </ul>
  </nav>
</PageSection>

<PageSection
  heading={t("A short break from the usual screen")}
  intro={t("Use it as a quick visual warmup or active screen break.")}
>
  {#each audiences as audience (audience.title)}
    <h3>{t(audience.title)}</h3>
    <p>{t(audience.body)}</p>
  {/each}
</PageSection>

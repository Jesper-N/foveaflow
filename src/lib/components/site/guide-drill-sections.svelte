<script lang="ts">
  import { patternDrillRoutes } from "$lib/content/drill-routes";
  import { audiences } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import {
    predictablePatterns,
    unpredictablePatterns,
  } from "$lib/trainer/settings/patterns";

  import DrillShowcase from "./drill-showcase.svelte";
  import { bodyText, sectionHeading, subHeading } from "./layout";
  import MotionPathTile from "./motion-path-tile.svelte";
  import PageSection from "./page-section.svelte";

  const pathRoutes = [
    ...unpredictablePatterns.map(({ id }) => ({ id, unpredictable: true })),
    ...predictablePatterns.map(({ id }) => ({ id, unpredictable: false })),
  ].flatMap(({ id, unpredictable }) =>
    patternDrillRoutes
      .filter((route) => route.patternId === id)
      .map((route) => ({ ...route, unpredictable }))
  );
</script>

<DrillShowcase />

<section id="patterns" class="short:scroll-mt-16 grid scroll-mt-36 gap-10">
  <div class="grid max-w-2xl gap-3">
    <h2 class={sectionHeading}>{t("Motion paths")}</h2>
    <p class={bodyText}>
      {t(
        "Start with a predictable path for steady tracking. Try random movement or hard turns when you want to spend more time finding the target."
      )}
    </p>
  </div>
  <nav aria-label={t("Pattern routes")}>
    <ul class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
      {#each pathRoutes as route (route.slug)}
        <li class="grid">
          <MotionPathTile
            badge={route.unpredictable ? t("Unpredictable") : undefined}
            href={route.path}
            label={t(route.label)}
            patternId={route.patternId}
          />
        </li>
      {/each}
    </ul>
  </nav>
</section>

<PageSection
  id="audiences"
  heading={t("Who FoveaFlow is for")}
  intro={t(
    "FoveaFlow runs in the browser you already have open, with no account and nothing to install. You decide how long a session lasts."
  )}
>
  <ul class="divide-border border-border grid divide-y border-y">
    {#each audiences as audience (audience.title)}
      <li class="grid gap-1.5 py-5">
        <h3 class={subHeading}>{t(audience.title)}</h3>
        <p class={[bodyText, "max-w-prose"]}>{t(audience.body)}</p>
      </li>
    {/each}
  </ul>
</PageSection>

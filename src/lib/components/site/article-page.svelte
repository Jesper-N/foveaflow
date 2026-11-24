<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { formatDate, t } from "$lib/i18n/translate";
  import { ArrowRightIcon } from "@lucide/svelte";

  import { buttonClass } from "../ui/button-variants";
  import DrillCard from "./drill-card.svelte";
  import FeatureComparison from "./feature-comparison.svelte";
  import { bodyText, pageWidth, sectionGap } from "./layout";
  import PageCta from "./page-cta.svelte";
  import PageHero from "./page-hero.svelte";
  import PageSection from "./page-section.svelte";
  import RoutineBar from "./routine-bar.svelte";
  import SectionNav from "./section-nav.svelte";
  import SiteShell from "./site-shell.svelte";
  import StepList from "./step-list.svelte";

  let { page }: { page: Article } = $props();

  let routine = $derived(
    page.sections.flatMap((section) => section.routine ?? [])
  );

  let contents = $derived(
    page.sections.map((section, index) => ({
      id: `section-${index}`,
      label: section.heading,
    }))
  );
</script>

<SiteShell path={page.path}>
  <PageHero
    breadcrumb={[{ href: "/guide/", label: "Guide" }, { label: page.kicker }]}
    lede={t(page.summary)}
    title={t(page.heading)}
  >
    {#snippet actions()}
      <a
        class={[buttonClass("accent", "lg"), "group/cta"]}
        href={page.primaryCta.href}
      >
        {t(page.primaryCta.label)}
        <ArrowRightIcon
          class="ease-spring transition-transform duration-260 group-hover/cta:translate-x-0.5 rtl:-scale-x-100"
          aria-hidden="true"
        />
      </a>
      {#if page.secondaryCta}
        <a class={buttonClass("secondary", "lg")} href={page.secondaryCta.href}>
          {t(page.secondaryCta.label)}
        </a>
      {/if}
    {/snippet}
    {#snippet meta()}
      {t("Updated")}
      <time datetime={page.lastModified}>{formatDate(page.lastModified)}</time>
    {/snippet}
    {#if page.comparison === undefined && routine.length > 0}
      <nav aria-label={t("Choose a drill")}>
        <RoutineBar steps={routine} />
      </nav>
    {:else if page.comparison === undefined}
      <nav aria-label={t("Choose a drill")}>
        <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
      </nav>
    {:else}
      <FeatureComparison
        checkedOn={page.lastModified}
        comparison={page.comparison}
      />
    {/if}
  </PageHero>

  <SectionNav links={contents} />
  <div class={[pageWidth, sectionGap, "pt-12 lg:pt-16"]}>
    {#each page.sections as section, index (section.heading)}
      <PageSection id="section-{index}" heading={t(section.heading)}>
        {#each section.body ?? [] as paragraph (paragraph)}
          <p class={[bodyText, "max-w-prose"]}>{t(paragraph)}</p>
        {/each}
        {#if section.orderedList}
          <StepList steps={section.orderedList} />
        {/if}
        {#if section.list}
          <ul class="grid max-w-prose gap-3">
            {#each section.list as item (item)}
              <li class="flex gap-3 text-base text-pretty">
                <span
                  class="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                ></span>
                {t(item)}
              </li>
            {/each}
          </ul>
        {/if}
      </PageSection>
    {/each}
    <PageCta
      href={page.primaryCta.href}
      label={t(page.primaryCta.label)}
      title={t("Try it with your own settings")}
    />
  </div>
</SiteShell>

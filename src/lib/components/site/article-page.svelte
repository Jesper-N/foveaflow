<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { formatDate, t } from "$lib/i18n/translate";

  import FeatureComparison from "./feature-comparison.svelte";
  import PageCta from "./page-cta.svelte";
  import PageHero from "./page-hero.svelte";
  import PageSection from "./page-section.svelte";
  import PageToc from "./page-toc.svelte";
  import SiteShell from "./site-shell.svelte";
  import StepList from "./step-list.svelte";

  let { page }: { page: Article } = $props();

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
      <a href={page.primaryCta.href}>{t(page.primaryCta.label)}</a>
      {#if page.secondaryCta}
        <a href={page.secondaryCta.href}>{t(page.secondaryCta.label)}</a>
      {/if}
    {/snippet}
    {#snippet meta()}
      {t("Updated")}
      <time datetime={page.lastModified}>{formatDate(page.lastModified)}</time>
    {/snippet}
    <!-- Comparison pages lead with the table instead of the drill links. -->
    {#if page.comparison === undefined}
      <nav aria-label={t("Choose a drill")}>
        <ul>
          {#each drillGuides as guide (guide.drillId)}
            <li>
              <a href={mainRouteForDrill(guide.drillId)?.path ?? "/"}>
                {t(guide.title)}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </PageHero>

  {#if page.comparison !== undefined}
    <FeatureComparison
      checkedOn={page.lastModified}
      comparison={page.comparison}
    />
  {/if}

  <PageToc links={contents} />
  {#each page.sections as section, index (section.heading)}
    <PageSection id="section-{index}" heading={t(section.heading)}>
      {#each section.body ?? [] as paragraph (paragraph)}
        <p>{t(paragraph)}</p>
      {/each}
      {#if section.orderedList}
        <StepList steps={section.orderedList} />
      {/if}
      {#if section.list}
        <ul>
          {#each section.list as item (item)}
            <li>{t(item)}</li>
          {/each}
        </ul>
      {/if}
    </PageSection>
  {/each}
  <PageCta
    body={t("Start slow. Adjust as you go.")}
    href={page.primaryCta.href}
    label={t(page.primaryCta.label)}
    title={t("Try it with your own settings")}
  />
</SiteShell>

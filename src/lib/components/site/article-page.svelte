<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { formatDate, t } from "$lib/i18n/translate";
  import { ArrowRightIcon } from "@lucide/svelte";

  import { buttonClass } from "../ui/button-variants";
  import DrillCard from "./drill-card.svelte";
  import FeatureComparison from "./feature-comparison.svelte";
  import { bodyText, pageWidth } from "./layout";
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
      <a class={buttonClass("primary", "lg")} href={page.primaryCta.href}>
        {t(page.primaryCta.label)}
        <ArrowRightIcon class="rtl:rotate-180" aria-hidden="true" />
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
    {#if page.comparison === undefined}
      <nav aria-label={t("Choose a drill")}>
        <ul class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
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
    {/if}
  </PageHero>

  {#if page.comparison !== undefined}
    <FeatureComparison
      checkedOn={page.lastModified}
      comparison={page.comparison}
    />
  {/if}

  <div
    class={[
      pageWidth,
      "grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16",
    ]}
  >
    <PageToc links={contents} />
    <div class="grid max-w-2xl gap-20">
      {#each page.sections as section, index (section.heading)}
        <PageSection id="section-{index}" heading={t(section.heading)}>
          {#each section.body ?? [] as paragraph (paragraph)}
            <p class={bodyText}>{t(paragraph)}</p>
          {/each}
          {#if section.orderedList}
            <StepList steps={section.orderedList} />
          {/if}
          {#if section.list}
            <ul class="grid gap-2.5">
              {#each section.list as item (item)}
                <li class="text-md flex gap-3">
                  <span
                    class="bg-target mt-2 size-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  ></span>
                  <span class="text-pretty">{t(item)}</span>
                </li>
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
    </div>
  </div>
</SiteShell>

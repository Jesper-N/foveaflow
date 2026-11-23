<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import type { Article } from "$lib/content/articles";
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { formatDate, t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import CheckIcon from "@lucide/svelte/icons/check";

  import FeatureComparison from "./feature-comparison.svelte";
  import PageCta from "./page-cta.svelte";
  import PageHero from "./page-hero.svelte";
  import PageSection from "./page-section.svelte";
  import ReadingLayout from "./reading-layout.svelte";
  import SiteShell from "./site-shell.svelte";
  import StepList from "./step-list.svelte";
  import { actionLink, drillCard, editorialCopy } from "./styles";

  let { page }: { page: Article } = $props();

  let contents = $derived(
    page.sections.map((section, index) => ({
      id: `section-${index}`,
      label: section.heading,
    }))
  );
</script>

{#snippet drillLinks()}
  <nav
    class="grid grid-cols-2 gap-3 lg:grid-cols-4"
    aria-label={t("Choose a drill")}
  >
    {#each drillGuides as guide (guide.drillId)}
      <a
        class={[drillCard, "flex flex-col items-center gap-3 px-4 py-5"]}
        href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
      >
        <DrillIllustration class="max-w-40" drillId={guide.drillId} />
        <span class="text-sm font-semibold">{t(guide.title)}</span>
      </a>
    {/each}
  </nav>
{/snippet}

<SiteShell path={page.path}>
  <!-- Comparison pages lead with the table instead of the drill links. -->
  <PageHero
    breadcrumb={[{ href: "/guide/", label: "Guide" }, { label: page.kicker }]}
    footer={"comparison" in page ? undefined : drillLinks}
    lede={t(page.summary)}
    title={t(page.heading)}
  >
    {#snippet actions()}
      <a class={actionLink} href={page.primaryCta.href}>
        {t(page.primaryCta.label)}
        <ArrowUpRightIcon aria-hidden="true" />
      </a>
      {#if page.secondaryCta}
        <a class={actionLink} href={page.secondaryCta.href}>
          {t(page.secondaryCta.label)}
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      {/if}
    {/snippet}
    {#snippet meta()}
      {t("Updated")}
      <time datetime={page.lastModified}>{formatDate(page.lastModified)}</time>
    {/snippet}
  </PageHero>

  {#if page.comparison !== undefined}
    <FeatureComparison
      checkedOn={page.lastModified}
      comparison={page.comparison}
    />
  {/if}

  <ReadingLayout links={contents}>
    {#each page.sections as section, index (section.heading)}
      <PageSection
        id="section-{index}"
        first={index === 0}
        heading={t(section.heading)}
      >
        {#if section.body}
          <div class={[editorialCopy, "mt-4 flex flex-col gap-4"]}>
            {#each section.body as paragraph (paragraph)}
              <p>{t(paragraph)}</p>
            {/each}
          </div>
        {/if}
        {#if section.orderedList}
          <StepList class="mt-6" steps={section.orderedList} />
        {/if}
        {#if section.list}
          <ul class="mt-6 grid gap-4">
            {#each section.list as item (item)}
              <li class="flex gap-3">
                <CheckIcon class="mt-1.5 size-4 shrink-0" />
                <p class={editorialCopy}>{t(item)}</p>
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
  </ReadingLayout>
</SiteShell>

<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import { Button } from "$lib/components/ui/button";
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
  import { drillCard, editorialCopy, heroButton } from "./styles";

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
    aria-label={t("Choose a drill")}
    class="grid grid-cols-2 gap-3 lg:grid-cols-4"
  >
    {#each drillGuides as guide (guide.drillId)}
      <a
        href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
        class={[drillCard, "flex flex-col items-center gap-3 px-4 py-5"]}
      >
        <DrillIllustration drillId={guide.drillId} class="max-w-40" />
        <span class="text-sm font-semibold">{t(guide.title)}</span>
      </a>
    {/each}
  </nav>
{/snippet}

<SiteShell path={page.path}>
  <!-- Comparison pages lead with the table instead of the drill links. -->
  <PageHero
    breadcrumb={[{ href: "/guide/", label: "Guide" }, { label: page.kicker }]}
    title={t(page.heading)}
    lede={t(page.summary)}
    footer={"comparison" in page ? undefined : drillLinks}
  >
    {#snippet actions()}
      <Button href={page.primaryCta.href} size="lg" class={heroButton}>
        {t(page.primaryCta.label)}
        <ArrowUpRightIcon data-icon="inline-end" />
      </Button>
      {#if page.secondaryCta}
        <Button
          href={page.secondaryCta.href}
          variant="ghost"
          size="lg"
          class="h-11 gap-2"
        >
          {t(page.secondaryCta.label)}
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      {/if}
    {/snippet}
    {#snippet meta()}
      {t("Updated")}
      <time datetime={page.lastModified}>{formatDate(page.lastModified)}</time>
    {/snippet}
  </PageHero>

  {#if "comparison" in page}
    <FeatureComparison
      comparison={page.comparison}
      checkedOn={page.lastModified}
    />
  {/if}

  <ReadingLayout links={contents}>
    {#each page.sections as section, index (section.heading)}
      <PageSection
        id={`section-${index}`}
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
          <StepList steps={section.orderedList} class="mt-6" />
        {/if}
        {#if section.list}
          <ul class="mt-6 grid gap-4">
            {#each section.list as item (item)}
              <li class="flex gap-3">
                <CheckIcon class="text-foreground mt-1.5 size-4 shrink-0" />
                <p class={editorialCopy}>{t(item)}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </PageSection>
    {/each}
    <PageCta
      title={t("Try it with your own settings")}
      body={t("Start slow. Adjust as you go.")}
      href={page.primaryCta.href}
      label={t(page.primaryCta.label)}
    />
  </ReadingLayout>
</SiteShell>

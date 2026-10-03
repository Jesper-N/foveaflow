<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SupportPage } from "$lib/content/support-pages";
  import { trainerRoutes } from "$lib/content/trainer-routes";
  import { trainingModeGuides } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { formatDate, t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils.js";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Check from "@lucide/svelte/icons/check";

  import ContentCta from "./content-cta.svelte";
  import ContentHero from "./content-hero.svelte";
  import ContentShell from "./content-shell.svelte";
  import ContentToc from "./content-toc.svelte";
  import DrillIllustration from "./drill-illustration.svelte";
  import {
    drillCard,
    editorialHeading,
    heroButton,
    editorialCopy,
    editorialSection,
    editorialLink,
    contentReadingLayout,
    editorialSections,
    panelSurface,
    stepItem,
    stepList,
    stepNumber,
  } from "./page-styles";

  let { page }: { page: SupportPage } = $props();
  let locale = $derived(languageState.locale);
  const drillPath = (mode: string) =>
    trainerRoutes.find((route) => route.mode === mode && route.indexable)
      ?.path ?? "/";
  let contents = $derived(
    page.sections.map((section, index) => ({
      id: `section-${index}`,
      label: section.heading,
    }))
  );
</script>

{#snippet drillStrip()}
  <nav
    aria-label={t(locale, "Choose a drill")}
    class="grid grid-cols-2 gap-3 lg:grid-cols-4"
  >
    {#each trainingModeGuides as drill (drill.mode)}
      <a
        href={drillPath(drill.mode)}
        class={[drillCard, "flex flex-col items-center gap-3 px-4 py-5"]}
      >
        <DrillIllustration mode={drill.mode} class="max-w-40" />
        <span class="text-sm font-semibold">{t(locale, drill.title)}</span>
      </a>
    {/each}
  </nav>
{/snippet}

<ContentShell {locale} path={page.path}>
  <ContentHero
    {locale}
    breadcrumb={[{ href: "/guide/", label: "Guide" }, { label: page.kicker }]}
    title={t(locale, page.heading)}
    lede={t(locale, page.summary)}
    footer={page.comparisonRows ? undefined : drillStrip}
  >
    {#snippet actions()}
      <Button href={page.primaryCta.href} size="lg" class={heroButton}
        >{t(locale, page.primaryCta.label)}<ArrowUpRight
          data-icon="inline-end"
        /></Button
      >
      {#if page.secondaryCta}<Button
          href={page.secondaryCta.href}
          variant="ghost"
          size="lg"
          class="h-11 gap-2"
          >{t(locale, page.secondaryCta.label)}<ArrowUpRight
            data-icon="inline-end"
          /></Button
        >{/if}
    {/snippet}
    {#snippet meta()}
      {t(locale, "Updated")}
      <time datetime={page.lastModified}
        >{formatDate(locale, page.lastModified)}</time
      >
    {/snippet}
  </ContentHero>

  {#if page.comparisonRows && page.comparisonLabel}
    <section class="pt-12 sm:pt-16" aria-labelledby="feature-comparison">
      <h2 id="feature-comparison" class={[editorialHeading, "mb-6"]}>
        {t(locale, "Feature comparison")}
      </h2>
      <div class="ring-border/70 overflow-hidden rounded-2xl ring-1">
        <table class="block w-full border-collapse text-left text-sm sm:table">
          <caption class="sr-only"
            >FoveaFlow / {page.comparisonLabel}: {t(
              locale,
              "Feature comparison"
            )}</caption
          >
          <thead class="sr-only sm:not-sr-only sm:table-header-group"
            ><tr class="border-border border-b"
              ><th scope="col" class="w-1/4 px-5 py-5 font-medium"
                >{t(locale, "Feature")}</th
              ><th
                scope="col"
                class={[
                  panelSurface,
                  "w-[37.5%] px-5 py-5 text-base font-semibold",
                ]}
                ><span class="flex items-center gap-2"
                  ><img
                    src="/logo-render/logo.svg"
                    alt=""
                    width="22"
                    height="22"
                    class="size-5.5 rounded-sm"
                  />FoveaFlow</span
                ></th
              ><th scope="col" class="w-[37.5%] px-5 py-5 text-base font-medium"
                >{page.comparisonLabel}</th
              ></tr
            ></thead
          >
          <tbody class="divide-border block divide-y sm:table-row-group">
            {#each page.comparisonRows as row (row.feature)}
              <tr class="grid grid-cols-2 sm:table-row">
                <th
                  scope="row"
                  class="bg-muted/30 col-span-2 px-4 pt-4 pb-2 font-medium sm:bg-transparent sm:px-5 sm:py-5 sm:align-top"
                  >{t(locale, row.feature)}</th
                >
                <td
                  class={[
                    panelSurface,
                    "px-4 py-4 align-top leading-6 sm:px-5 sm:py-5",
                  ]}
                  ><span
                    class="text-brand-foreground mb-2 block text-xs font-semibold sm:hidden"
                    >FoveaFlow</span
                  >{t(locale, row.foveaflow)}</td
                >
                <td
                  class="text-muted-foreground px-4 py-4 align-top leading-6 sm:px-5 sm:py-5"
                  ><span
                    class="text-foreground mb-2 block text-xs font-medium sm:hidden"
                    >{page.comparisonLabel}</span
                  >{t(locale, row.alternative)}</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if page.sourceLink}
        <div
          class="text-muted-foreground mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-xs leading-5"
        >
          <p>
            {t(locale, "Checked against the public browser interface on")}
            <time datetime={page.lastModified}
              >{formatDate(locale, page.lastModified)}</time
            >. {t(
              locale,
              "Features may change. This comparison does not cover unreleased apps."
            )}
          </p>
          <a
            class={cn(editorialLink, "text-xs")}
            href={page.sourceLink.href}
            target="_blank"
            rel="noopener noreferrer"
            >{t(locale, page.sourceLink.label)}<ArrowUpRight
              class="size-3.5"
            /></a
          >
        </div>
      {/if}
    </section>
  {/if}

  <div class={contentReadingLayout}>
    <ContentToc {locale} links={contents} />
    <div class={editorialSections}>
      {#each page.sections as section, index (section.heading)}
        <section
          id={`section-${index}`}
          class={index === 0 ? "scroll-mt-8" : editorialSection}
        >
          <h2 class={editorialHeading}>{t(locale, section.heading)}</h2>
          {#if section.body}<div
              class={`${editorialCopy} mt-4 flex flex-col gap-4`}
            >
              {#each section.body as paragraph (paragraph)}<p>
                  {t(locale, paragraph)}
                </p>{/each}
            </div>{/if}
          {#if section.orderedList}
            <ol class={[stepList, "mt-6"]}>
              {#each section.orderedList as item, itemIndex (item)}<li
                  class={stepItem}
                >
                  <span class={stepNumber} aria-hidden="true"
                    >{itemIndex + 1}</span
                  >
                  <p class={editorialCopy}>{t(locale, item)}</p>
                </li>{/each}
            </ol>
          {/if}
          {#if section.list}
            <ul class="mt-6 grid gap-4">
              {#each section.list as item (item)}<li class="flex gap-3">
                  <Check class="text-foreground mt-1.5 size-4 shrink-0" />
                  <p class={editorialCopy}>{t(locale, item)}</p>
                </li>{/each}
            </ul>
          {/if}
        </section>
      {/each}
      <ContentCta
        title={t(locale, "Try it with your own settings")}
        body={t(locale, "Start slow. Adjust as you go.")}
        href={page.primaryCta.href}
        label={t(locale, page.primaryCta.label)}
      />
    </div>
  </div>
</ContentShell>

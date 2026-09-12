<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SupportPage } from "$lib/content/support-pages";
  import { trainingModeGuides } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { formatDate, t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Check from "@lucide/svelte/icons/check";

  import ContentShell from "./content-shell.svelte";
  import ContentToc from "./content-toc.svelte";
  import DrillIllustration from "./drill-illustration.svelte";
  import {
    editorialEyebrow,
    editorialTitle,
    editorialHeading,
    editorialCopy,
    editorialSection,
    editorialLink,
    contentHeader,
    contentReadingLayout,
    editorialSections,
  } from "./page-styles";

  let { page }: { page: SupportPage } = $props();
  let locale = $derived(languageState.locale);
  let contents = $derived(
    page.sections.map((section, index) => ({
      id: `section-${index}`,
      label: section.heading,
    }))
  );
</script>

<ContentShell {locale} path={page.path}>
  <section class={`${contentHeader} border-border border-b`}>
    <a
      href="/guide/"
      class={`${editorialEyebrow} underline-offset-4 hover:underline`}
      >{t(locale, "Guide")} / {t(locale, page.kicker)}</a
    >
    <h1 class={`${editorialTitle} max-w-4xl`}>{t(locale, page.heading)}</h1>
    <p
      class="text-muted-foreground max-w-3xl text-base leading-7 sm:text-lg sm:leading-8"
    >
      {t(locale, page.summary)}
    </p>
    <div class="flex w-full flex-wrap items-center justify-between gap-5">
      <div class="flex flex-wrap gap-3">
        <Button href={page.primaryCta.href} size="lg" class="h-11 gap-2 px-5"
          >{t(locale, page.primaryCta.label)}<ArrowUpRight
            class="size-4"
          /></Button
        >
        {#if page.secondaryCta}<Button
            href={page.secondaryCta.href}
            variant="outline"
            size="lg"
            class="h-11">{t(locale, page.secondaryCta.label)}</Button
          >{/if}
      </div>
      <p class="text-muted-foreground text-xs">
        {t(locale, "Updated")}
        <time datetime={page.lastModified}
          >{formatDate(locale, page.lastModified)}</time
        >
      </p>
    </div>
  </section>

  {#if page.comparisonRows && page.comparisonLabel}
    <section class="pt-16 sm:pt-24" aria-labelledby="feature-comparison">
      <div class="mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="feature-comparison" class={editorialHeading}>
          {t(locale, "Feature comparison")}
        </h2>
        <span class="text-muted-foreground text-sm"
          >{t(locale, "Public browser versions")}</span
        >
      </div>
      <div
        class="border-border overflow-hidden rounded-2xl border shadow-[inset_0_1px_0_rgb(255_255_255/4%)]"
      >
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
                class="bg-muted/60 w-[37.5%] px-5 py-5 text-base font-semibold"
                ><span class="flex items-center gap-2"
                  ><img
                    src="/logo-small.jpg"
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
                  class="bg-muted/40 px-4 py-4 align-top leading-6 sm:px-5 sm:py-5"
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
            class={editorialLink}
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
  {:else}
    <div
      class="border-border grid grid-cols-2 gap-6 border-b py-12 sm:grid-cols-4 sm:py-16"
    >
      {#each trainingModeGuides as drill (drill.mode)}
        <div class="min-w-0 px-2 py-3">
          <DrillIllustration mode={drill.mode} class="mx-auto max-w-48" />
          <p class="mt-4 text-center text-sm font-medium">
            {t(locale, drill.title)}
          </p>
        </div>
      {/each}
    </div>
  {/if}

  <div class={`${contentReadingLayout} lg:grid-cols-[12rem_minmax(0,1fr)]`}>
    <ContentToc {locale} links={contents} />
    <div class={editorialSections}>
      {#each page.sections as section, index (section.heading)}
        <section
          id={`section-${index}`}
          class={index === 0 ? "scroll-mt-8" : editorialSection}
        >
          <h2 class={editorialHeading}>{t(locale, section.heading)}</h2>
          {#if section.body}<div
              class={`${editorialCopy} mt-5 flex flex-col gap-4`}
            >
              {#each section.body as paragraph (paragraph)}<p>
                  {t(locale, paragraph)}
                </p>{/each}
            </div>{/if}
          {#if section.orderedList}
            <ol class="divide-border mt-6 divide-y">
              {#each section.orderedList as item, itemIndex (item)}<li
                  class="flex items-baseline gap-5 py-5 first:pt-0"
                >
                  <span
                    class="text-brand-foreground text-sm font-medium tabular-nums"
                    >0{itemIndex + 1}</span
                  >
                  <p class={editorialCopy}>{t(locale, item)}</p>
                </li>{/each}
            </ol>
          {/if}
          {#if section.list}
            <ul class="mt-6 grid gap-4">
              {#each section.list as item (item)}<li class="flex gap-3">
                  <Check class="text-brand-foreground mt-1.5 size-4 shrink-0" />
                  <p class={editorialCopy}>{t(locale, item)}</p>
                </li>{/each}
            </ul>
          {/if}
        </section>
      {/each}
      <div class={`${editorialSection} flex flex-col items-start gap-3`}>
        <h2 class="text-xl font-semibold">
          {t(locale, "Try it with your own settings.")}
        </h2>
        <p class="text-muted-foreground mt-3 text-sm leading-6">
          {t(locale, "FoveaFlow is free. No account, no install.")}
        </p>
        <Button
          href={page.primaryCta.href}
          size="lg"
          class="mt-5 h-11 gap-2 px-5"
          >{t(locale, page.primaryCta.label)}<ArrowUpRight
            class="size-4"
          /></Button
        >
      </div>
    </div>
  </div>
</ContentShell>

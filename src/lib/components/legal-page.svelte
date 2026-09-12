<script lang="ts">
  import type { LegalPageContent } from "$lib/content/legal";
  import { languageState } from "$lib/i18n/state.svelte";
  import { formatDate, t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import ContentShell from "./content-shell.svelte";
  import ContentToc from "./content-toc.svelte";
  import {
    editorialEyebrow,
    editorialTitle,
    editorialHeading,
    editorialCopy,
    editorialLink,
    contentHeader,
    contentReadingLayout,
    editorialSection,
    editorialSections,
  } from "./page-styles";

  let { page }: { page: LegalPageContent } = $props();
  let locale = $derived(languageState.locale);
  let contents = $derived(
    page.sections.map((section) => ({ id: section.id, label: section.heading }))
  );
</script>

<ContentShell {locale} path={page.path}>
  <section class={`${contentHeader} border-border border-b`}>
    <p class={editorialEyebrow}>
      {t(locale, "FoveaFlow")} / {t(locale, page.label)}
    </p>
    <h1 class={editorialTitle}>{t(locale, page.title)}</h1>
    <p
      class="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
    >
      {t(locale, page.summary)}
    </p>
    <p class="text-muted-foreground text-xs">
      {t(locale, "Updated")}
      <time datetime={page.lastModified}
        >{formatDate(locale, page.lastModified)}</time
      >
    </p>
  </section>
  <div class={`${contentReadingLayout} lg:grid-cols-[15rem_minmax(0,1fr)]`}>
    <ContentToc {locale} links={contents} />
    <div class={`${editorialSections} max-w-3xl lg:pr-8`}>
      {#each page.sections as section, index (section.id)}
        <section
          id={section.id}
          class={index === 0 ? "scroll-mt-8" : editorialSection}
        >
          <div class="flex items-baseline gap-4">
            <span class="text-muted-foreground text-xs tabular-nums"
              >{String(index + 1).padStart(2, "0")}</span
            >
            <h2 class={editorialHeading}>{t(locale, section.heading)}</h2>
          </div>
          <div class={`${editorialCopy} mt-5 flex flex-col gap-4`}>
            {#each section.body as paragraph (paragraph)}<p>
                {t(locale, paragraph)}
              </p>{/each}
          </div>
          {#if "links" in section && section.links?.length}<div
              class="mt-5 flex flex-wrap gap-x-6 gap-y-3"
            >
              {#each section.links as link (link.url)}<a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={editorialLink}
                  >{t(locale, link.label)}<ArrowUpRight class="size-3.5" /></a
                >{/each}
            </div>{/if}
        </section>
      {/each}
    </div>
  </div>
</ContentShell>

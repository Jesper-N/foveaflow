<script lang="ts">
  import type { LegalPageContent } from "$lib/content/legal";
  import { languageState } from "$lib/i18n/state.svelte";
  import { formatDate, t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import ContentHero from "./content-hero.svelte";
  import ContentShell from "./content-shell.svelte";
  import ContentToc from "./content-toc.svelte";
  import {
    editorialHeading,
    editorialCopy,
    editorialLink,
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
  <ContentHero
    {locale}
    breadcrumb={[{ href: "/", label: "FoveaFlow" }, { label: page.label }]}
    title={t(locale, page.title)}
    lede={t(locale, page.summary)}
  >
    {#snippet meta()}
      {t(locale, "Updated")}
      <time datetime={page.lastModified}
        >{formatDate(locale, page.lastModified)}</time
      >
    {/snippet}
  </ContentHero>
  <div class={contentReadingLayout}>
    <ContentToc {locale} links={contents} />
    <div class={editorialSections}>
      {#each page.sections as section, index (section.id)}
        <section
          id={section.id}
          class={index === 0 ? "scroll-mt-8" : editorialSection}
        >
          <h2 class={editorialHeading}>{t(locale, section.heading)}</h2>
          <div class={`${editorialCopy} mt-4 flex flex-col gap-4`}>
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

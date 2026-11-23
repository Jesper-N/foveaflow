<script lang="ts">
  import type { LegalPage } from "$lib/content/legal";
  import { formatDate, t } from "$lib/i18n/translate";

  import PageHero from "./page-hero.svelte";
  import PageSection from "./page-section.svelte";
  import PageToc from "./page-toc.svelte";
  import SiteShell from "./site-shell.svelte";

  let { page }: { page: LegalPage } = $props();

  let contents = $derived(
    page.sections.map(({ id, heading }) => ({ id, label: heading }))
  );
</script>

<SiteShell path={page.path}>
  <PageHero
    breadcrumb={[{ href: "/", label: "FoveaFlow" }, { label: page.label }]}
    lede={t(page.summary)}
    title={t(page.title)}
  >
    {#snippet meta()}
      {t("Updated")}
      <time datetime={page.lastModified}>{formatDate(page.lastModified)}</time>
    {/snippet}
  </PageHero>
  <PageToc links={contents} />
  {#each page.sections as section (section.id)}
    <PageSection id={section.id} heading={t(section.heading)}>
      {#each section.body as paragraph (paragraph)}
        <p>{t(paragraph)}</p>
      {/each}
      {#each section.links ?? [] as link (link.url)}
        <a href={link.url} rel="noopener noreferrer" target="_blank">
          {t(link.label)}
        </a>
      {/each}
    </PageSection>
  {/each}
</SiteShell>

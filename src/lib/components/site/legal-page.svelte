<script lang="ts">
  import type { LegalPage } from "$lib/content/legal";
  import { formatDate, t } from "$lib/i18n/translate";

  import { bodyText, pageWidth, textLink } from "./layout";
  import PageHero from "./page-hero.svelte";
  import PageSection from "./page-section.svelte";
  import SectionNav from "./section-nav.svelte";
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
  <SectionNav links={contents} />
  <div class={[pageWidth, "grid gap-20 pt-20 lg:gap-28"]}>
    {#each page.sections as section (section.id)}
      <PageSection id={section.id} heading={t(section.heading)}>
        {#each section.body as paragraph (paragraph)}
          <p class={[bodyText, "max-w-prose"]}>{t(paragraph)}</p>
        {/each}
        {#if section.links}
          <ul class="grid gap-2">
            {#each section.links as link (link.url)}
              <li>
                <a
                  class={textLink}
                  href={link.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(link.label)}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </PageSection>
    {/each}
  </div>
</SiteShell>

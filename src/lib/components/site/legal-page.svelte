<script lang="ts">
  import type { LegalPage } from "$lib/content/legal";
  import { formatDate, t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import PageHero from "./page-hero.svelte";
  import PageSection from "./page-section.svelte";
  import ReadingLayout from "./reading-layout.svelte";
  import SiteShell from "./site-shell.svelte";
  import { editorialCopy, editorialLink } from "./styles";

  let { page }: { page: LegalPage } = $props();

  let contents = $derived(
    page.sections.map(({ id, heading }) => ({ id, label: heading }))
  );
</script>

<SiteShell path={page.path}>
  <PageHero
    breadcrumb={[{ href: "/", label: "FoveaFlow" }, { label: page.label }]}
    title={t(page.title)}
    lede={t(page.summary)}
  >
    {#snippet meta()}
      {t("Updated")}
      <time datetime={page.lastModified}>{formatDate(page.lastModified)}</time>
    {/snippet}
  </PageHero>
  <ReadingLayout links={contents}>
    {#each page.sections as section, index (section.id)}
      <PageSection
        id={section.id}
        first={index === 0}
        heading={t(section.heading)}
      >
        <div class={[editorialCopy, "mt-2 flex flex-col gap-3"]}>
          {#each section.body as paragraph (paragraph)}
            <p>{t(paragraph)}</p>
          {/each}
        </div>
        {#if section.links}
          <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {#each section.links as link (link.url)}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class={editorialLink}
              >
                {t(link.label)}
                <ArrowUpRightIcon class="size-3.5" />
              </a>
            {/each}
          </div>
        {/if}
      </PageSection>
    {/each}
  </ReadingLayout>
</SiteShell>

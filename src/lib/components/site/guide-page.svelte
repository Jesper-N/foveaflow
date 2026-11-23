<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { t } from "$lib/i18n/translate";

  import GuideDrillSections from "./guide-drill-sections.svelte";
  import GuideResourceSections from "./guide-resource-sections.svelte";
  import PageHero from "./page-hero.svelte";
  import PageToc from "./page-toc.svelte";
  import SiteShell from "./site-shell.svelte";

  // Each id matches a section in this page or in the two section components.
  const contents = [
    { id: "drills", label: "Choose a drill" },
    { id: "practice", label: "How to practice" },
    { id: "patterns", label: "Motion paths" },
    { id: "controls", label: "Controls" },
    { id: "more-guides", label: "More guides" },
    { id: "faq", label: "Guide FAQ" },
    { id: "references", label: "References" },
  ];
</script>

<SiteShell path="/guide/">
  <PageHero
    lede={t(
      "Your guide to FoveaFlow’s free online eye trainer. Choose a drill for visual tracking, quick refocus, or peripheral awareness, then make it your own."
    )}
    title={t("FoveaFlow Guide")}
  >
    {#snippet actions()}
      <a href="/smooth-pursuit/">{t("Try Smooth Pursuit")}</a>
      <a href="#practice">{t("How to practice")}</a>
    {/snippet}
    <nav id="drills" aria-label={t("Choose a drill")}>
      <ul>
        {#each drillGuides as guide (guide.drillId)}
          <li>
            <a href="#{guide.drillId}">{t(guide.title)}</a>
            <p>{t(guide.summary)}</p>
          </li>
        {/each}
      </ul>
    </nav>
  </PageHero>
  <PageToc links={contents} />
  <GuideDrillSections />
  <GuideResourceSections />
</SiteShell>

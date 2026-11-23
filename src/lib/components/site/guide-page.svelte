<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { t } from "$lib/i18n/translate";
  import { ArrowRightIcon } from "@lucide/svelte";

  import { buttonClass } from "../ui/button-variants";
  import DrillCard from "./drill-card.svelte";
  import GuideDrillSections from "./guide-drill-sections.svelte";
  import GuideResourceSections from "./guide-resource-sections.svelte";
  import { pageWidth } from "./layout";
  import PageHero from "./page-hero.svelte";
  import PageToc from "./page-toc.svelte";
  import SiteShell from "./site-shell.svelte";

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
      <a class={buttonClass("primary", "lg")} href="/smooth-pursuit/">
        {t("Try Smooth Pursuit")}
        <ArrowRightIcon class="rtl:rotate-180" aria-hidden="true" />
      </a>
      <a class={buttonClass("secondary", "lg")} href="#practice">
        {t("How to practice")}
      </a>
    {/snippet}
    <nav id="drills" class="scroll-mt-24" aria-label={t("Choose a drill")}>
      <ul class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {#each drillGuides as guide (guide.drillId)}
          <li class="grid">
            <DrillCard
              drillId={guide.drillId}
              href="#{guide.drillId}"
              summary={t(guide.summary)}
              title={t(guide.title)}
            />
          </li>
        {/each}
      </ul>
    </nav>
  </PageHero>

  <div
    class={[
      pageWidth,
      "grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16",
    ]}
  >
    <PageToc links={contents} />
    <div class="grid max-w-2xl gap-20">
      <GuideDrillSections />
      <GuideResourceSections />
    </div>
  </div>
</SiteShell>

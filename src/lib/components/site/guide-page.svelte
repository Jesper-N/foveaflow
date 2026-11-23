<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { t } from "$lib/i18n/translate";
  import { ArrowRightIcon } from "@lucide/svelte";

  import { buttonClass } from "../ui/button-variants";
  import DrillCard from "./drill-card.svelte";
  import GuideDrillSections from "./guide-drill-sections.svelte";
  import GuideResourceSections from "./guide-resource-sections.svelte";
  import { pageWidth, sectionGap } from "./layout";
  import PageCta from "./page-cta.svelte";
  import PageHero from "./page-hero.svelte";
  import SectionNav from "./section-nav.svelte";
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
      <a
        class={[buttonClass("primary", "lg"), "group/cta"]}
        href="/smooth-pursuit/"
      >
        {t("Try Smooth Pursuit")}
        <ArrowRightIcon
          class="ease-spring transition-transform duration-260 group-hover/cta:translate-x-0.5 rtl:-scale-x-100"
          aria-hidden="true"
        />
      </a>
      <a class={buttonClass("secondary", "lg")} href="#practice">
        {t("How to practice")}
      </a>
    {/snippet}
    <nav id="drills" class="scroll-mt-36" aria-label={t("Choose a drill")}>
      <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
  <SectionNav links={contents} />
  <div class={[pageWidth, sectionGap, "pt-20"]}>
    <GuideDrillSections />
    <GuideResourceSections />
    <PageCta
      body={t("Start slow. Adjust as you go.")}
      href="/"
      label={t("Open FoveaFlow")}
      title={t("Ready to try a drill?")}
    />
  </div>
</SiteShell>

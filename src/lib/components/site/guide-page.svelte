<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import { drillGuides } from "$lib/content/drill-guides";
  import { t } from "$lib/i18n/translate";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import GuideDrillSections from "./guide-drill-sections.svelte";
  import GuideResourceSections from "./guide-resource-sections.svelte";
  import PageHero from "./page-hero.svelte";
  import ReadingLayout from "./reading-layout.svelte";
  import SiteShell from "./site-shell.svelte";
  import { drillCard, actionLink } from "./styles";

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
      <a class={actionLink} href="/smooth-pursuit/">
        {t("Try Smooth Pursuit")}
        <ArrowUpRightIcon aria-hidden="true" />
      </a>
      <a class={actionLink} href="#practice">
        {t("How to practice")}
        <ArrowDownIcon aria-hidden="true" />
      </a>
    {/snippet}
    {#snippet footer()}
      <nav
        id="drills"
        class="grid scroll-mt-8 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label={t("Choose a drill")}
      >
        {#each drillGuides as guide (guide.drillId)}
          <a
            class={[
              drillCard,
              "group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-5 p-4 sm:flex sm:flex-col sm:items-stretch sm:p-5",
            ]}
            href="#{guide.drillId}"
          >
            <DrillIllustration
              class="sm:mx-auto sm:mb-4 sm:max-w-44"
              drillId={guide.drillId}
            />
            <span class="grid gap-1.5">
              <span
                class="flex items-center justify-between gap-2 font-semibold wrap-anywhere"
              >
                {t(guide.title)}
                <ArrowDownIcon
                  class="size-3.5 shrink-0 transition-colors motion-reduce:transition-none"
                />
              </span>
              <span class="text-sm leading-6 text-pretty">
                {t(guide.summary)}
              </span>
            </span>
          </a>
        {/each}
      </nav>
    {/snippet}
  </PageHero>
  <ReadingLayout links={contents}>
    <GuideDrillSections />
    <GuideResourceSections />
  </ReadingLayout>
</SiteShell>

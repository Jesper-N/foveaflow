<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import { Button } from "$lib/components/ui/button";
  import { drillGuides } from "$lib/content/drill-guides";
  import { t } from "$lib/i18n/translate";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import GuideDrillSections from "./guide-drill-sections.svelte";
  import GuideResourceSections from "./guide-resource-sections.svelte";
  import PageHero from "./page-hero.svelte";
  import ReadingLayout from "./reading-layout.svelte";
  import SiteShell from "./site-shell.svelte";
  import { drillCard, heroButton } from "./styles";

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
    title={t("FoveaFlow Guide")}
    lede={t(
      "Your guide to FoveaFlow’s free online eye trainer. Choose a drill for visual tracking, quick refocus, or peripheral awareness, then make it your own."
    )}
  >
    {#snippet actions()}
      <Button href="/smooth-pursuit/" size="lg" class={heroButton}>
        {t("Try Smooth Pursuit")}
        <ArrowUpRightIcon data-icon="inline-end" />
      </Button>
      <Button href="#practice" variant="ghost" size="lg" class="h-11 gap-2">
        {t("How to practice")}
        <ArrowDownIcon data-icon="inline-end" />
      </Button>
    {/snippet}
    {#snippet footer()}
      <nav
        id="drills"
        aria-label={t("Choose a drill")}
        class="grid scroll-mt-8 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {#each drillGuides as guide (guide.drillId)}
          <a
            href={`#${guide.drillId}`}
            class={[
              drillCard,
              "group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-5 p-4 sm:flex sm:flex-col sm:items-stretch sm:p-5",
            ]}
          >
            <DrillIllustration
              drillId={guide.drillId}
              class="sm:mx-auto sm:mb-4 sm:max-w-44"
            />
            <span class="grid gap-1.5">
              <span
                class="flex items-center justify-between gap-2 font-semibold wrap-anywhere"
              >
                {t(guide.title)}
                <ArrowDownIcon
                  class="text-muted-foreground group-hover:text-brand-foreground size-3.5 shrink-0 transition-colors motion-reduce:transition-none"
                />
              </span>
              <span class="text-muted-foreground text-sm leading-6 text-pretty">
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

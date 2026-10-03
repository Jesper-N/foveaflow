<script lang="ts">
  import ContentHero from "$lib/components/content-hero.svelte";
  import ContentShell from "$lib/components/content-shell.svelte";
  import ContentToc from "$lib/components/content-toc.svelte";
  import DrillIllustration from "$lib/components/drill-illustration.svelte";
  import GuideResourceSections from "$lib/components/guide-resource-sections.svelte";
  import GuideTrainingSections from "$lib/components/guide-training-sections.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { trainingModeGuides } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import {
    contentReadingLayout,
    drillCard,
    editorialSections,
    heroButton,
  } from "./page-styles";

  let locale = $derived(languageState.locale);
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

<ContentShell {locale} path="/guide/">
  <ContentHero
    {locale}
    title={t(locale, "FoveaFlow Guide")}
    lede={t(
      locale,
      "Your guide to FoveaFlow’s free online eye trainer. Choose a drill for visual tracking, quick refocus, or peripheral awareness, then make it your own."
    )}
  >
    {#snippet actions()}
      <Button href="/smooth-pursuit/" size="lg" class={heroButton}
        >{t(locale, "Try Smooth Pursuit")}<ArrowUpRight
          data-icon="inline-end"
        /></Button
      >
      <Button href="#practice" variant="ghost" size="lg" class="h-11 gap-2"
        >{t(locale, "How to practice")}<ArrowDown
          data-icon="inline-end"
        /></Button
      >
    {/snippet}
    {#snippet footer()}
      <nav
        id="drills"
        aria-label={t(locale, "Choose a drill")}
        class="grid scroll-mt-8 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {#each trainingModeGuides as mode (mode.mode)}
          <a
            href={`#${mode.mode}`}
            class={[
              drillCard,
              "group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-5 p-4 sm:flex sm:flex-col sm:items-stretch sm:p-5",
            ]}
          >
            <DrillIllustration
              mode={mode.mode}
              class="sm:mx-auto sm:mb-4 sm:max-w-44"
            />
            <span class="grid gap-1.5">
              <span
                class="flex items-center justify-between gap-2 font-semibold wrap-anywhere"
              >
                {t(locale, mode.title)}<ArrowDown
                  class="text-muted-foreground group-hover:text-brand-foreground size-3.5 shrink-0 transition-colors motion-reduce:transition-none"
                />
              </span>
              <span class="text-muted-foreground text-sm leading-6 text-pretty">
                {t(locale, mode.summary)}
              </span>
            </span>
          </a>
        {/each}
      </nav>
    {/snippet}
  </ContentHero>
  <div class={contentReadingLayout}>
    <ContentToc {locale} links={contents} />
    <div class={editorialSections}>
      <GuideTrainingSections {locale} />
      <GuideResourceSections {locale} />
    </div>
  </div>
</ContentShell>

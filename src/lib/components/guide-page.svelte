<script lang="ts">
  import ContentShell from "$lib/components/content-shell.svelte";
  import ContentToc from "$lib/components/content-toc.svelte";
  import DrillIllustration from "$lib/components/drill-illustration.svelte";
  import GuideResourceSections from "$lib/components/guide-resource-sections.svelte";
  import GuideTrainingSections from "$lib/components/guide-training-sections.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { safetyNote, trainingModeGuides } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import {
    contentReadingLayout,
    editorialEyebrow,
    editorialSections,
    editorialTitle,
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
  <div class="py-16 sm:py-24">
    <section
      class="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center"
    >
      <p class={editorialEyebrow}>{t(locale, "Free browser tool")}</p>
      <h1 class={editorialTitle}>{t(locale, "FoveaFlow Guide")}</h1>
      <p
        class="text-muted-foreground max-w-xl text-base leading-7 text-pretty sm:text-lg sm:leading-8"
      >
        {t(
          locale,
          "Your guide to FoveaFlow’s free online eye trainer. Choose a drill for visual tracking, quick refocus, or peripheral awareness, then make it your own."
        )}
      </p>
      <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Button href="/smooth-pursuit/" size="lg" class="h-11 gap-2 px-5"
          >{t(locale, "Try Smooth Pursuit")}<ArrowUpRight
            class="size-4"
          /></Button
        >
        <Button href="#practice" variant="ghost" size="lg" class="h-11 gap-2"
          >{t(locale, "How to practice")}<ArrowDown class="size-4" /></Button
        >
      </div>
    </section>
  </div>
  <section
    id="drills"
    aria-label={t(locale, "Choose a drill")}
    class="scroll-mt-8"
  >
    <div
      class="border-border/70 divide-border/70 grid border-y sm:grid-cols-2 lg:grid-cols-4"
    >
      {#each trainingModeGuides as mode (mode.mode)}
        <a
          href={`#${mode.mode}`}
          class="group hover:bg-muted/20 focus-visible:outline-ring grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-5 border-b border-inherit px-1 py-6 transition-colors last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none sm:flex sm:flex-col sm:items-stretch sm:px-5 sm:py-7 sm:nth-[2n+1]:border-r sm:nth-last-[-n+2]:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
        >
          <DrillIllustration
            mode={mode.mode}
            class="row-span-2 mx-auto sm:mb-5 sm:max-w-48"
          />
          <h2
            class="flex items-center justify-between gap-2 text-base font-semibold wrap-anywhere"
          >
            {t(locale, mode.title)}<ArrowDown
              class="text-muted-foreground group-hover:text-brand-foreground size-3.5 shrink-0"
            />
          </h2>
          <p class="text-muted-foreground mt-2 text-sm leading-6 text-pretty">
            {t(locale, mode.summary)}
          </p>
        </a>
      {/each}
    </div>
    <p class="text-muted-foreground mt-5 max-w-4xl text-xs leading-5">
      <span class="text-foreground font-medium"
        >{t(locale, "Before you start")}.</span
      >&nbsp;{t(locale, safetyNote)}
    </p>
  </section>
  <div class={`${contentReadingLayout} lg:grid-cols-[12rem_minmax(0,1fr)]`}>
    <ContentToc {locale} links={contents} />
    <div class={editorialSections}>
      <GuideTrainingSections {locale} />
      <GuideResourceSections {locale} />
    </div>
  </div>
</ContentShell>

<script lang="ts">
  import DrillIllustration from "$lib/components/drill-illustration.svelte";
  import { freeUseNote, homepageSeoContent } from "$lib/content/page-copy";
  import { trainerRoutes } from "$lib/content/trainer-routes";
  import { trainingModeGuides } from "$lib/content/training";
  import type { TrainingMode } from "$lib/engine/presets";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils.js";

  import { drillCard } from "../page-styles";
  import {
    guideCopy,
    guideLede,
    guideSectionHeading,
    guideStage,
    guideTitle,
  } from "./guide-styles";

  let { locale }: { locale: AppLocale } = $props();

  const drillPath = (mode: TrainingMode) =>
    trainerRoutes.find((route) => route.mode === mode && route.indexable)
      ?.path ?? "/";
</script>

<header class={guideStage}>
  <div class="guide-enter grid gap-3 pr-12">
    <h2 id="trainer-guide-title" class={guideTitle}>
      {t(locale, homepageSeoContent.heading)}
    </h2>
    <p class={guideLede}>{t(locale, homepageSeoContent.hero)}</p>
  </div>
</header>

<div class="grid gap-10 px-6 py-7 sm:px-8">
  <section
    class="guide-enter grid gap-4 [animation-delay:40ms]"
    aria-labelledby="trainer-guide-drills"
  >
    <h3 id="trainer-guide-drills" class={guideSectionHeading}>
      {t(locale, "Drills")}
    </h3>
    <ul class="grid gap-3 sm:grid-cols-2">
      {#each trainingModeGuides as guide (guide.mode)}
        <li>
          <a
            href={drillPath(guide.mode)}
            class={cn(
              drillCard,
              "grid h-full grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 rounded-2xl p-3"
            )}
          >
            <span class="px-2 py-1.5">
              <DrillIllustration mode={guide.mode} />
            </span>
            <span class="grid gap-1">
              <span class="text-foreground leading-5 font-semibold">
                {t(locale, guide.title)}
              </span>
              <span class="text-muted-foreground leading-5 text-pretty">
                {t(locale, guide.summary)}
              </span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section
    class="guide-enter grid gap-3 [animation-delay:80ms]"
    aria-labelledby="trainer-guide-overview"
  >
    <h3 id="trainer-guide-overview" class={guideSectionHeading}>
      {t(locale, "Overview")}
    </h3>
    <!-- Balanced columns keep the closing note from sitting alone. -->
    <div class="*:break-inside-avoid *:not-last:pb-3 sm:columns-2 sm:gap-10">
      {#each homepageSeoContent.body as paragraph (paragraph)}
        <p class={guideCopy}>{t(locale, paragraph)}</p>
      {/each}
      <p class={guideCopy}>{t(locale, freeUseNote)}</p>
    </div>
  </section>
</div>

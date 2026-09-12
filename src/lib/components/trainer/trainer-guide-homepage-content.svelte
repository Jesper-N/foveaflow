<script lang="ts">
  import ModePathPreview from "$lib/components/mode-path-preview.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import { trainingModeGuides } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";

  let {
    guideUseCases,
    locale,
  }: {
    guideUseCases: readonly string[];
    locale: AppLocale;
  } = $props();
</script>

<div
  class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.18fr)_minmax(16rem,0.82fr)]"
>
  <section
    class="guide-enter border-border/40 grid gap-5 border-t pt-6 [animation-delay:40ms]"
    aria-label={t(locale, "FoveaFlow overview")}
  >
    <h3 class="text-foreground text-base font-semibold">
      {t(locale, "Overview")}
    </h3>

    <div
      class="text-muted-foreground grid gap-4 text-sm leading-6 text-pretty sm:text-[0.95rem] sm:leading-7"
    >
      {#each homepageSeoContent.body as paragraph (paragraph)}
        <p class="max-w-[58ch]">{t(locale, paragraph)}</p>
      {/each}
    </div>
  </section>

  <section
    class="guide-enter border-border/40 border-t pt-6 [animation-delay:70ms]"
    aria-labelledby="homepage-guide-drills"
  >
    <h3
      id="homepage-guide-drills"
      class="text-foreground text-base font-semibold"
    >
      {t(locale, "Drills")}
    </h3>
    <ul class="mt-6 grid gap-5">
      {#each trainingModeGuides as guide (guide.mode)}
        <li class="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3">
          <span
            class="bg-primary/12 text-brand-foreground inset-ring-primary/15 flex size-8 items-center justify-center rounded-full inset-ring"
            aria-hidden="true"
          >
            <ModePathPreview mode={guide.mode} />
          </span>
          <div class="min-w-0 pt-0.5">
            <p class="text-foreground leading-6 font-semibold">
              {t(locale, guide.title)}
            </p>
            <p class="text-muted-foreground mt-0.5 leading-6 text-pretty">
              {t(locale, guide.summary)}
            </p>
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <aside
    class="guide-enter border-border/40 border-t pt-6 [animation-delay:100ms]"
  >
    <h3 class="text-foreground text-base font-semibold">
      {t(locale, "Safety")}
    </h3>
    <p class="text-muted-foreground mt-6 text-sm leading-6 text-pretty">
      {t(locale, homepageSeoContent.trustNote)}
    </p>

    <div
      class="mt-6 flex flex-wrap gap-2"
      aria-label={`${t(locale, "Best uses for")} ${siteMetadata.name}`}
    >
      {#each guideUseCases as useCase (useCase)}
        <span
          class="border-border/40 bg-muted/35 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium"
        >
          {t(locale, useCase)}
        </span>
      {/each}
    </div>

    <Button
      href="/guide/"
      size="lg"
      class="guide-enter mt-6 h-auto min-h-11 w-full gap-2 py-2 whitespace-normal [animation-delay:130ms]"
    >
      <BookOpenIcon data-icon="inline-start" />
      <span>{t(locale, "Read the full guide")}</span>
    </Button>
  </aside>
</div>

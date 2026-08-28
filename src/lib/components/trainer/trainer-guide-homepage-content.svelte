<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import { trainingModeNotes } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import TargetIcon from "@lucide/svelte/icons/crosshair";

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
    class="guide-enter guide-enter-delay-1 border-border/40 grid gap-5 border-t pt-6"
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
    class="guide-enter guide-enter-delay-2 border-border/40 border-t pt-6"
    aria-labelledby="homepage-guide-drills"
  >
    <h3
      id="homepage-guide-drills"
      class="text-foreground text-base font-semibold"
    >
      {t(locale, "Drills")}
    </h3>
    <ul class="mt-6 grid gap-5">
      {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
        <li class="grid grid-cols-[2.25rem_1fr] gap-4">
          <span
            class="bg-accent/12 text-brand-foreground flex size-8 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
            aria-hidden="true"
          >
            <TargetIcon class="size-4" />
          </span>
          <span class="text-muted-foreground pt-1 leading-6 text-pretty">
            <span class="text-foreground font-semibold">
              {t(locale, trainingModeNote.title)}:
            </span>
            {t(locale, trainingModeNote.body)}
          </span>
        </li>
      {/each}
    </ul>
  </section>

  <aside class="guide-enter guide-enter-delay-3 border-border/40 border-t pt-6">
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
      class="guide-enter guide-enter-delay-4 mt-6 w-full"
    >
      <BookOpenIcon data-icon="inline-start" />
      <span>{t(locale, "Read the full guide")}</span>
    </Button>
  </aside>
</div>

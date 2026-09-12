<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { trainerRoutes } from "$lib/content/trainer-routes";
  import { audienceNotes, trainingModeGuides } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import ModePathPreview from "./mode-path-preview.svelte";
  import {
    editorialEyebrow,
    editorialHeading,
    editorialCopy,
    editorialSection,
  } from "./page-styles";
  import PatternPathPreview from "./pattern-path-preview.svelte";

  const patternRoutes = trainerRoutes.filter(
    (route) => route.mode === "pursuit" && !route.indexable
  );
  const modeRoutes = new Map(
    trainerRoutes
      .filter((route) => route.indexable)
      .map((route) => [route.mode, route.path])
  );
  let { locale }: { locale: AppLocale } = $props();
</script>

<section id="practice" class="scroll-mt-8">
  <h2 class={editorialHeading}>{t(locale, "How each drill works")}</h2>
  <p class={`${editorialCopy} mt-4 max-w-2xl`}>
    {t(
      locale,
      "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
    )}
  </p>
  <div class="divide-border mt-10 divide-y sm:mt-12">
    {#each trainingModeGuides as guide (guide.mode)}
      <article
        id={guide.mode}
        class="scroll-mt-8 py-12 first:pt-0 last:pb-0 sm:py-16"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 class="flex items-center gap-3 text-xl font-semibold">
            <span
              class="bg-primary flex size-10 shrink-0 items-center justify-center rounded-xl"
              ><ModePathPreview mode={guide.mode} variant="badge" /></span
            >
            {t(locale, guide.title)}
          </h3>
          <Button
            href={modeRoutes.get(guide.mode)}
            variant="outline"
            size="sm"
            class="h-9 gap-2"
            >{t(locale, "Try this drill")}<ArrowUpRight
              class="size-3.5"
            /></Button
          >
        </div>
        <ol class="grid gap-5">
          {#each guide.steps as step, stepIndex (step)}
            <li class="flex items-baseline gap-4">
              <span
                class="text-muted-foreground w-4 shrink-0 text-xs tabular-nums"
                >{stepIndex + 1}.</span
              >
              <p class={editorialCopy}>{t(locale, step)}</p>
            </li>
          {/each}
        </ol>
        <div class="bg-muted/40 mt-8 rounded-xl p-5 sm:p-6">
          <h4 class="mb-1 text-sm font-medium">
            {t(locale, "What it trains")}
          </h4>
          <p class="text-muted-foreground text-sm leading-6">
            {t(locale, guide.benefits)}
          </p>
        </div>
      </article>
    {/each}
  </div>
</section>

<section id="patterns" class={editorialSection}>
  <h2 class={editorialHeading}>{t(locale, "Motion paths")}</h2>
  <p class={`${editorialCopy} mt-4`}>
    {t(
      locale,
      "Start with a predictable path for steady tracking. Try random movement or hard turns when you want to spend more time finding the target. Each link opens Smooth Pursuit with that path selected."
    )}
  </p>
  <nav
    aria-label={t(locale, "Pattern routes")}
    class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3"
  >
    {#each patternRoutes as route (route.slug)}
      <a
        href={route.path}
        class="bg-muted/30 hover:bg-muted/70 focus-visible:outline-ring flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors focus-visible:outline-2 motion-reduce:transition-none"
      >
        {#if route.patternId}<PatternPathPreview
            patternId={route.patternId}
          />{/if}<span>{t(locale, route.label)}</span>
      </a>
    {/each}
  </nav>
</section>

<section class={editorialSection}>
  <p class={`${editorialEyebrow} mb-3`}>{t(locale, "Best fit")}</p>
  <h2 class={editorialHeading}>
    {t(locale, "A short break from the usual screen.")}
  </h2>
  <p class={`${editorialCopy} mt-4`}>
    {t(
      locale,
      "Use it as a quick visual warmup or active screen break, not as medical care."
    )}
  </p>
  <div class="mt-6 grid gap-6 sm:grid-cols-3">
    {#each audienceNotes as note (note.title)}<div>
        <h3 class="mb-2 text-sm font-semibold">{t(locale, note.title)}</h3>
        <p class="text-muted-foreground text-sm leading-6">
          {t(locale, note.body)}
        </p>
      </div>{/each}
  </div>
</section>

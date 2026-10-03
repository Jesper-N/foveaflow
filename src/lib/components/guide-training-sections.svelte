<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { trainerRoutes } from "$lib/content/trainer-routes";
  import { audienceNotes, trainingModeGuides } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Gamepad2 from "@lucide/svelte/icons/gamepad-2";
  import Monitor from "@lucide/svelte/icons/monitor";
  import SquareTerminal from "@lucide/svelte/icons/square-terminal";

  import ModePathPreview from "./mode-path-preview.svelte";
  import {
    editorialHeading,
    editorialCopy,
    editorialSection,
    iconBadge,
    panelSurface,
    stepItem,
    stepList,
    stepNumber,
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
  const audienceIcons = {
    Gamers: Gamepad2,
    "IT professionals": SquareTerminal,
    "People on screens all day": Monitor,
  } satisfies Record<(typeof audienceNotes)[number]["title"], typeof Monitor>;
  let { locale }: { locale: AppLocale } = $props();
</script>

<section id="practice" class="scroll-mt-8">
  <h2 class={editorialHeading}>{t(locale, "How each drill works")}</h2>
  <p class={`${editorialCopy} mt-4`}>
    {t(
      locale,
      "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
    )}
  </p>
  <div class="divide-border mt-10 divide-y">
    {#each trainingModeGuides as guide (guide.mode)}
      <article
        id={guide.mode}
        class="grid scroll-mt-8 gap-6 py-10 first:pt-0 last:pb-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
      >
        <header class="flex flex-col items-start gap-3">
          <span class={[iconBadge, "size-11"]} aria-hidden="true">
            <ModePathPreview mode={guide.mode} class="text-brand-foreground" />
          </span>
          <h3 class="text-xl font-semibold tracking-tight">
            {t(locale, guide.title)}
          </h3>
          <p class="text-muted-foreground text-sm leading-6 text-pretty">
            {t(locale, guide.summary)}
          </p>
          <Button
            href={modeRoutes.get(guide.mode)}
            variant="outline"
            class="mt-1 gap-2"
            >{t(locale, "Try this drill")}<ArrowUpRight
              data-icon="inline-end"
            /></Button
          >
        </header>
        <div class="grid content-start gap-6">
          <ol class={stepList}>
            {#each guide.steps as step, stepIndex (step)}
              <li class={stepItem}>
                <span class={stepNumber} aria-hidden="true"
                  >{stepIndex + 1}</span
                >
                <p class={editorialCopy}>{t(locale, step)}</p>
              </li>
            {/each}
          </ol>
          <p
            class={[
              panelSurface,
              "text-muted-foreground rounded-2xl p-5 text-sm leading-6",
            ]}
          >
            <span class="text-foreground font-medium">
              {t(locale, "What it trains:")}
            </span>
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
    class="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4"
  >
    {#each patternRoutes as route (route.slug)}
      <a
        href={route.path}
        class={[
          panelSurface,
          "group hover:ring-primary/60 focus-visible:outline-ring flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 ring-transparent transition-shadow focus-visible:outline-2 motion-reduce:transition-none",
        ]}
      >
        {#if route.patternId}<PatternPathPreview
            patternId={route.patternId}
            class="group-hover:text-brand-foreground transition-colors motion-reduce:transition-none"
          />{/if}<span>{t(locale, route.label)}</span>
      </a>
    {/each}
  </nav>
</section>

<section class={editorialSection}>
  <h2 class={editorialHeading}>
    {t(locale, "A short break from the usual screen")}
  </h2>
  <p class={`${editorialCopy} mt-4`}>
    {t(locale, "Use it as a quick visual warmup or active screen break.")}
  </p>
  <div class="mt-6 grid gap-3 sm:grid-cols-3">
    {#each audienceNotes as note (note.title)}
      {@const Icon = audienceIcons[note.title]}
      <div class={[panelSurface, "grid content-start gap-2 rounded-2xl p-5"]}>
        <span class={[iconBadge, "mb-2 size-10"]} aria-hidden="true">
          <Icon class="size-4" />
        </span>
        <h3 class="font-semibold">{t(locale, note.title)}</h3>
        <p class="text-muted-foreground text-sm leading-6">
          {t(locale, note.body)}
        </p>
      </div>
    {/each}
  </div>
</section>

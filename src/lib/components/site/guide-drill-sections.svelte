<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import {
    mainRouteForDrill,
    patternDrillRoutes,
  } from "$lib/content/drill-routes";
  import { audiences } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import { ArrowRightIcon } from "@lucide/svelte";

  import DrillIllustration from "../icons/drill-illustration.svelte";
  import PatternGlyph from "../icons/pattern-glyph.svelte";
  import { buttonClass } from "../ui/button-variants";
  import { pressable } from "../ui/styles";
  import { subHeading } from "./layout";
  import PageSection from "./page-section.svelte";
  import StepList from "./step-list.svelte";
</script>

<PageSection
  id="practice"
  heading={t("How each drill works")}
  intro={t(
    "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
  )}
>
  <div class="grid gap-4">
    {#each drillGuides as guide (guide.drillId)}
      <article
        id={guide.drillId}
        class="group/drill bg-card grid scroll-mt-24 gap-6 rounded-4xl p-2 pb-6"
      >
        <DrillIllustration
          class="aspect-16/7 w-full rounded-3xl"
          drillId={guide.drillId}
        />
        <div class="grid gap-5 px-4 sm:px-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="grid max-w-md gap-1">
              <h3 class="text-lg font-semibold">{t(guide.title)}</h3>
              <p class="text-md text-muted-foreground text-pretty">
                {t(guide.summary)}
              </p>
            </div>
            <a
              class={buttonClass("primary", "md")}
              href={mainRouteForDrill(guide.drillId)?.path}
            >
              {t("Try this drill")}
              <ArrowRightIcon class="rtl:rotate-180" aria-hidden="true" />
            </a>
          </div>
          <StepList steps={guide.steps} />
          <p class="bg-fill text-md rounded-2xl p-4">
            <span class="font-medium">{t("What it trains:")}</span>
            <span class="text-muted-foreground">{t(guide.benefits)}</span>
          </p>
        </div>
      </article>
    {/each}
  </div>
</PageSection>

<PageSection
  id="patterns"
  heading={t("Motion paths")}
  intro={t(
    "Start with a predictable path for steady tracking. Try random movement or hard turns when you want to spend more time finding the target. Each link opens Smooth Pursuit with that path selected."
  )}
>
  <nav aria-label={t("Pattern routes")}>
    <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {#each patternDrillRoutes as route (route.slug)}
        <li class="grid">
          <a
            class={[
              "bg-fill text-md hover:bg-fill-hover flex items-center gap-3 rounded-2xl p-2 pe-3 font-medium",
              pressable,
            ]}
            href={route.path}
          >
            {#if route.patternId}
              <span
                class="bg-canvas grid h-9 w-12 shrink-0 place-items-center rounded-xl"
              >
                <PatternGlyph
                  class="text-muted-foreground h-6 w-8"
                  patternId={route.patternId}
                />
              </span>
            {/if}
            <span class="min-w-0 text-pretty">{t(route.label)}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</PageSection>

<PageSection
  heading={t("A short break from the usual screen")}
  intro={t("Use it as a quick visual warmup or active screen break.")}
>
  <div class="grid gap-2 sm:grid-cols-3">
    {#each audiences as audience (audience.title)}
      <div class="bg-fill grid content-start gap-1.5 rounded-2xl p-4">
        <h3 class={subHeading}>{t(audience.title)}</h3>
        <p class="text-muted-foreground text-sm text-pretty">
          {t(audience.body)}
        </p>
      </div>
    {/each}
  </div>
</PageSection>

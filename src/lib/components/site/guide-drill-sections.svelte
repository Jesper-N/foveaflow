<script lang="ts">
  import DrillIcon from "$lib/components/drills/drill-icon.svelte";
  import PatternIcon from "$lib/components/drills/pattern-icon.svelte";
  import { Button } from "$lib/components/ui/button";
  import { drillGuides } from "$lib/content/drill-guides";
  import {
    mainRouteForDrill,
    patternDrillRoutes,
  } from "$lib/content/drill-routes";
  import { audiences } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import Gamepad2Icon from "@lucide/svelte/icons/gamepad-2";
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";

  import PageSection from "./page-section.svelte";
  import StepList from "./step-list.svelte";
  import { editorialSubheading, iconBadge, panelSurface } from "./styles";

  const audienceIcons = {
    Gamers: Gamepad2Icon,
    "IT professionals": SquareTerminalIcon,
    "People on screens all day": MonitorIcon,
  } satisfies Record<(typeof audiences)[number]["title"], typeof MonitorIcon>;
</script>

<PageSection
  id="practice"
  first
  heading={t("How each drill works")}
  intro={t(
    "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
  )}
>
  <div class="divide-border mt-5 divide-y">
    {#each drillGuides as guide (guide.drillId)}
      <article
        id={guide.drillId}
        class="grid scroll-mt-8 gap-6 py-6 first:pt-0 last:pb-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
      >
        <header class="flex flex-col items-start gap-2">
          <span class={[iconBadge, "mb-1 size-11"]} aria-hidden="true">
            <DrillIcon drillId={guide.drillId} class="text-brand-foreground" />
          </span>
          <h3 class={editorialSubheading}>
            {t(guide.title)}
          </h3>
          <p class="text-muted-foreground">
            {t(guide.summary)}
          </p>
          <Button
            href={mainRouteForDrill(guide.drillId)?.path}
            variant="outline"
            class="mt-1 gap-2"
          >
            {t("Try this drill")}
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </header>
        <div class="grid content-start gap-3">
          <StepList steps={guide.steps} />
          <p class={[panelSurface, "text-muted-foreground rounded-2xl p-5"]}>
            <span class="text-foreground font-semibold">
              {t("What it trains:")}
            </span>
            {t(guide.benefits)}
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
  <nav
    aria-label={t("Pattern routes")}
    class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4"
  >
    {#each patternDrillRoutes as route (route.slug)}
      <a
        href={route.path}
        class={[
          panelSurface,
          "group hover:ring-primary/60 focus-visible:outline-ring flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-transparent transition-shadow focus-visible:outline-2 motion-reduce:transition-none",
        ]}
      >
        <PatternIcon
          patternId={route.patternId}
          class="group-hover:text-brand-foreground transition-colors motion-reduce:transition-none"
        />
        <span>{t(route.label)}</span>
      </a>
    {/each}
  </nav>
</PageSection>

<PageSection
  heading={t("A short break from the usual screen")}
  intro={t("Use it as a quick visual warmup or active screen break.")}
>
  <div class="mt-3 grid gap-3 sm:grid-cols-3">
    {#each audiences as audience (audience.title)}
      {@const Icon = audienceIcons[audience.title]}
      <div class={[panelSurface, "grid content-start gap-2 rounded-2xl p-5"]}>
        <span class={[iconBadge, "mb-2 size-10"]} aria-hidden="true">
          <Icon class="size-4" />
        </span>
        <h3 class={editorialSubheading}>{t(audience.title)}</h3>
        <p class="text-muted-foreground">
          {t(audience.body)}
        </p>
      </div>
    {/each}
  </div>
</PageSection>

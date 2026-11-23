<script lang="ts">
  import DrillIcon from "$lib/components/drills/drill-icon.svelte";
  import PatternIcon from "$lib/components/drills/pattern-icon.svelte";
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
  import { actionLink, iconBadge } from "./styles";

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
  <div class="mt-10 divide-y">
    {#each drillGuides as guide (guide.drillId)}
      <article
        id={guide.drillId}
        class="grid scroll-mt-8 gap-6 py-10 first:pt-0 last:pb-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
      >
        <header class="flex flex-col items-start gap-3">
          <span class={[iconBadge, "size-11"]} aria-hidden="true">
            <DrillIcon drillId={guide.drillId} />
          </span>
          <h3 class="text-xl font-semibold">
            {t(guide.title)}
          </h3>
          <p class="text-sm leading-6 text-pretty">
            {t(guide.summary)}
          </p>
          <a class={actionLink} href={mainRouteForDrill(guide.drillId)?.path}>
            {t("Try this drill")}
            <ArrowUpRightIcon aria-hidden="true" />
          </a>
        </header>
        <div class="grid content-start gap-6">
          <StepList steps={guide.steps} />
          <p class={["rounded-2xl p-5 text-sm leading-6"]}>
            <span class="font-medium">
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
    class="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4"
    aria-label={t("Pattern routes")}
  >
    {#each patternDrillRoutes as route (route.slug)}
      <a
        class={[
          "group flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 ring-transparent transition-shadow focus-visible:outline-2 motion-reduce:transition-none",
        ]}
        href={route.path}
      >
        <PatternIcon
          class="transition-colors motion-reduce:transition-none"
          patternId={route.patternId}
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
  <div class="mt-6 grid gap-3 sm:grid-cols-3">
    {#each audiences as audience (audience.title)}
      {@const Icon = audienceIcons[audience.title]}
      <div class={["grid content-start gap-2 rounded-2xl p-5"]}>
        <span class={[iconBadge, "mb-2 size-10"]} aria-hidden="true">
          <Icon class="size-4" />
        </span>
        <h3 class="font-semibold">{t(audience.title)}</h3>
        <p class="text-sm leading-6">
          {t(audience.body)}
        </p>
      </div>
    {/each}
  </div>
</PageSection>

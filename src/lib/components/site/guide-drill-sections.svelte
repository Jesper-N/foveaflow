<script lang="ts">
  import { patternDrillRoutes } from "$lib/content/drill-routes";
  import { audiences } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import {
    predictablePatterns,
    unpredictablePatterns,
  } from "$lib/trainer/settings/patterns";
  import { Gamepad2Icon, MonitorIcon, TerminalIcon } from "@lucide/svelte";

  import DrillShowcase from "./drill-showcase.svelte";
  import { bodyText, eyebrow, sectionHeading, subHeading } from "./layout";
  import MotionPathTile from "./motion-path-tile.svelte";

  const audienceIcons = [Gamepad2Icon, TerminalIcon, MonitorIcon];

  const audienceCards = audiences.map((audience, index) => ({
    ...audience,
    Icon: audienceIcons[index] ?? MonitorIcon,
  }));

  const pathGroups = [
    { label: "Unpredictable", patterns: unpredictablePatterns },
    { label: "Predictable", patterns: predictablePatterns },
  ].map(({ label, patterns }) => ({
    label,
    routes: patterns.flatMap(({ id }) =>
      patternDrillRoutes.filter((route) => route.patternId === id)
    ),
  }));
</script>

<DrillShowcase />

<section id="patterns" class="grid scroll-mt-36 gap-10">
  <div class="grid max-w-2xl gap-3">
    <h2 class={sectionHeading}>{t("Motion paths")}</h2>
    <p class={bodyText}>
      {t(
        "Start with a predictable path for steady tracking. Try random movement or hard turns when you want to spend more time finding the target. Each link opens Smooth Pursuit with that path selected."
      )}
    </p>
  </div>
  <nav class="grid gap-8" aria-label={t("Pattern routes")}>
    {#each pathGroups as group (group.label)}
      <div class="grid gap-3">
        <h3 class={eyebrow}>{t(group.label)}</h3>
        <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {#each group.routes as route (route.slug)}
            <li class="grid">
              <MotionPathTile
                href={route.path}
                label={t(route.label)}
                patternId={route.patternId}
              />
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>
</section>

<section class="grid gap-10" aria-labelledby="audiences">
  <div class="grid max-w-2xl gap-3">
    <h2 id="audiences" class={sectionHeading}>
      {t("A short break from the usual screen")}
    </h2>
    <p class={bodyText}>
      {t("Use it as a quick visual warmup or active screen break.")}
    </p>
  </div>
  <div class="grid gap-2 md:grid-cols-3">
    {#each audienceCards as audience (audience.title)}
      <div class="bg-card grid content-start gap-10 rounded-4xl p-6">
        <span
          class="bg-popover shadow-thumb grid size-11 place-items-center rounded-2xl"
        >
          <audience.Icon class="size-5" aria-hidden="true" />
        </span>
        <div class="grid gap-1.5">
          <h3 class={subHeading}>{t(audience.title)}</h3>
          <p class="text-md text-muted-foreground text-pretty">
            {t(audience.body)}
          </p>
        </div>
      </div>
    {/each}
  </div>
</section>

<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { trainerRoutes } from "$lib/content/trainer-routes";
  import {
    audienceNotes,
    trainingModeGuides,
    trainingModeNotes,
  } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import MousePointerIcon from "@lucide/svelte/icons/mouse-pointer-2";

  const featuredRoutes = trainerRoutes.filter((route) =>
    [
      "smooth-pursuit",
      "reaction-jumps",
      "multiple-distractions",
      "lilac-chaser",
    ].includes(route.slug)
  );

  const patternRoutes = trainerRoutes.filter(
    (route) => route.mode === "pursuit" && !route.indexable
  );

  const guideEnterUp = "guide-enter guide-enter-up";
  const guideItemSurface =
    "bg-background/70 shadow-[0_16px_36px_-30px_rgba(20,24,22,0.4)]";
  const sectionGrid =
    "grid gap-6 border-t border-border/60 pt-10 md:grid-cols-[0.72fr_1.28fr] md:gap-10";
  const sectionIntro = "md:sticky md:top-8 md:self-start";
  const sectionTitle =
    "max-w-[18rem] text-2xl leading-tight font-semibold tracking-tight";

  let { locale }: { locale: AppLocale } = $props();
</script>

<section class={`page-enter-delay-2 ${sectionGrid} ${guideEnterUp}`}>
  <div class={sectionIntro}>
    <Badge variant="outline" class="mb-4">{t(locale, "Drills")}</Badge>
    <h2 class={sectionTitle}>
      {t(locale, "Choose a drill by the result you want")}
    </h2>
  </div>

  <div class="grid gap-3">
    {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
      <Item.Root variant="outline" class={guideItemSurface}>
        <Item.Media
          variant="icon"
          class="bg-muted text-brand-foreground size-9 rounded-lg border"
        >
          <CrosshairIcon class="size-4" />
        </Item.Media>
        <Item.Content>
          <Item.Title class="line-clamp-none">
            {t(locale, trainingModeNote.title)}
          </Item.Title>
          <Item.Description class="line-clamp-none leading-6">
            {t(locale, trainingModeNote.body)}
          </Item.Description>
        </Item.Content>
      </Item.Root>
    {/each}
  </div>
</section>

<section class={`page-enter-delay-3 ${sectionGrid} ${guideEnterUp}`}>
  <div class={sectionIntro}>
    <Badge variant="outline" class="mb-4">
      {t(locale, "Mode guide")}
    </Badge>
    <h2 class={sectionTitle}>{t(locale, "How each drill works")}</h2>
    <p class="text-muted-foreground mt-4 max-w-136 text-base leading-7">
      {t(
        locale,
        "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
      )}
    </p>
  </div>

  <div class="grid gap-3">
    {#each trainingModeGuides as modeGuide (modeGuide.mode)}
      <Item.Root variant="outline" class={guideItemSurface}>
        <Item.Media
          variant="icon"
          class="bg-muted text-brand-foreground size-9 rounded-lg border"
        >
          <CrosshairIcon class="size-4" />
        </Item.Media>
        <Item.Content>
          <Item.Title class="line-clamp-none">
            {t(locale, modeGuide.title)}
          </Item.Title>
          <Item.Description class="line-clamp-none leading-6">
            {t(locale, modeGuide.summary)}
            {modeGuide.steps.map((step) => t(locale, step)).join(" ")}
            {t(locale, modeGuide.benefits)}
          </Item.Description>
        </Item.Content>
      </Item.Root>
    {/each}
  </div>
</section>

<section class={`page-enter-delay-3 ${sectionGrid} ${guideEnterUp}`}>
  <div class={sectionIntro}>
    <Badge variant="outline" class="mb-4">{t(locale, "Best fit")}</Badge>
    <h2 class={sectionTitle}>
      {t(
        locale,
        "Best use cases for gamers, desk workers, and screen-heavy days"
      )}
    </h2>
    <p class="text-muted-foreground mt-4 max-w-136 text-base leading-7">
      {t(
        locale,
        "Use it as a quick visual warmup or active screen break, not as medical care."
      )}
    </p>
  </div>

  <div class="grid gap-3">
    {#each audienceNotes as audienceNote (audienceNote.title)}
      <Item.Root variant="outline" class={guideItemSurface}>
        <Item.Media
          variant="icon"
          class="bg-muted text-brand-foreground size-9 rounded-lg border"
        >
          <ActivityIcon class="size-4" />
        </Item.Media>
        <Item.Content>
          <Item.Title class="line-clamp-none">
            {t(locale, audienceNote.title)}
          </Item.Title>
          <Item.Description class="line-clamp-none leading-6">
            {t(locale, audienceNote.body)}
          </Item.Description>
        </Item.Content>
      </Item.Root>
    {/each}
  </div>
</section>

<section
  class={`page-enter-delay-3 border-border/60 grid gap-6 border-t pt-10 md:grid-cols-[1.18fr_0.82fr] md:gap-10 ${guideEnterUp}`}
>
  <div class="grid gap-3">
    {#each featuredRoutes as route (route.slug)}
      <Item.Root variant="outline" class={guideItemSurface}>
        <Item.Media
          variant="icon"
          class="bg-background text-brand-foreground size-9 rounded-lg border"
        >
          <MousePointerIcon class="size-4" />
        </Item.Media>
        <Item.Content>
          <Item.Title class="line-clamp-none">
            {t(locale, route.label)}
          </Item.Title>
          <Item.Description class="line-clamp-none leading-6">
            {t(locale, route.description)}
          </Item.Description>
        </Item.Content>
        <Item.Actions>
          <Button
            href={route.path}
            size="icon"
            variant="ghost"
            aria-label={`${t(locale, "Open")} ${t(locale, route.label)}`}
          >
            <ExternalLinkIcon class="size-4" />
          </Button>
        </Item.Actions>
      </Item.Root>
    {/each}
  </div>

  <nav
    class="md:sticky md:top-8 md:self-start md:pt-2"
    aria-label="Pattern routes"
  >
    <Badge variant="outline" class="mb-4">
      {t(locale, "Direct routes")}
    </Badge>
    <h2 class={sectionTitle}>
      {t(locale, "Smooth Pursuit pattern routes")}
    </h2>
    <p class="text-muted-foreground mt-4 max-w-152 text-base leading-7">
      {t(
        locale,
        "Pattern pages start Smooth Pursuit with that path selected. Reaction jumps, Multiple Distractions, and Lilac Chaser have their own direct URLs."
      )}
    </p>
    <div class="mt-5 flex flex-wrap gap-2">
      {#each patternRoutes as route (route.slug)}
        <Button href={route.path} variant="outline" size="sm">
          {t(locale, route.label)}
        </Button>
      {/each}
    </div>
  </nav>
</section>

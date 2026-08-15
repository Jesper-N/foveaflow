<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import { guideFaqItems, guideMetadata } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import { supportPages } from "$lib/content/support-pages";
  import { trainerRoutes } from "$lib/content/trainer-routes";
  import {
    audienceNotes,
    referenceLinks,
    safetyNote,
    trainingModeGuides,
    trainingModeNotes,
  } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import MousePointerIcon from "@lucide/svelte/icons/mouse-pointer-2";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";

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

  const guideEnterTop = "guide-enter guide-enter-up";
  const guideEnterHero = "guide-enter page-enter-delay-1 guide-enter-up";
  const guideEnterUp = "guide-enter guide-enter-up";
  const guideItemSurface =
    "bg-background/70 shadow-[0_16px_36px_-30px_rgba(20,24,22,0.4)]";
  const sectionGrid =
    "grid gap-6 border-t border-border/60 pt-10 md:grid-cols-[0.72fr_1.28fr] md:gap-10";
  const sectionIntro = "md:sticky md:top-8 md:self-start";
  const sectionTitle =
    "max-w-[18rem] text-2xl leading-tight font-semibold tracking-tight";
  let locale = $derived(languageState.locale);
</script>

<main class="bg-background text-foreground selection:bg-accent/30 min-h-dvh">
  <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-5 sm:px-6 lg:px-8">
    <nav
      class={`flex items-center justify-between gap-4 ${guideEnterTop}`}
      aria-label={t(locale, "Guide navigation")}
    >
      <Button
        href="/"
        variant="outline"
        aria-label={`${t(locale, "Open")} ${siteMetadata.name}`}
      >
        <ArrowLeftIcon class="size-4" />
        <span class="pl-1">{t(locale, "Open")} {siteMetadata.name}</span>
      </Button>

      <div class="flex items-center gap-2">
        <Badge
          variant="outline"
          class="border-border/80 bg-background/80 text-muted-foreground hidden h-8 px-3 py-0 text-sm sm:inline-flex"
        >
          {t(locale, "Updated July 10, 2026")}
        </Badge>
        <LanguageSelect
          showSelectedName
          collapseNameOnSmall
          size="sm"
          variant="outline"
          triggerClass="max-w-56"
        />
      </div>
    </nav>

    <section
      class={`grid items-center gap-10 pt-10 pb-10 md:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] md:pt-20 md:pb-16 ${guideEnterHero}`}
    >
      <div class="max-w-3xl">
        <Badge variant="secondary" class="mb-5 px-3 py-1">
          {t(locale, "Guide")}
        </Badge>
        <h1
          class="text-foreground max-w-[13ch] text-4xl leading-none font-semibold tracking-tight md:text-6xl"
        >
          {t(locale, guideMetadata.heading)}
        </h1>
        <p
          class="text-muted-foreground mt-6 max-w-160 text-base leading-7 md:text-lg md:leading-8"
        >
          {t(locale, guideMetadata.summary)}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button href="/">
            <CrosshairIcon class="size-4" />
            <span class="pl-1">{t(locale, "Open")} {siteMetadata.name}</span>
          </Button>
          <Button href="/smooth-pursuit/" variant="outline">
            <CrosshairIcon class="size-4" />
            <span class="pl-1">{t(locale, "Try Smooth Pursuit")}</span>
          </Button>
          <Button href="#faq" variant="outline">
            <BookOpenIcon class="size-4" />
            <span class="pl-1">{t(locale, "Read guide FAQ")}</span>
          </Button>
        </div>
      </div>

      <div class="grid gap-4 md:translate-y-6">
        <Item.Root
          variant="outline"
          class={`border-border/80 p-5 ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="bg-muted text-brand-foreground size-10 rounded-lg border"
          >
            <ActivityIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              {t(locale, "Pick a drill and tune the target")}
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {t(
                locale,
                "Choose a path, set the speed and target style, then use it for a short visual tracking session."
              )}
            </Item.Description>
          </Item.Content>
        </Item.Root>

        <Item.Root
          variant="muted"
          class={`border-border/70 ml-0 border p-5 md:ml-8 ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="bg-background text-brand-foreground size-10 rounded-lg border"
          >
            <ShieldCheckIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              {t(locale, "Keep the safety line clear")}
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {t(locale, safetyNote)}
            </Item.Description>
          </Item.Content>
        </Item.Root>
      </div>
    </section>

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

    <section class={`page-enter-delay-4 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">
          {t(locale, "More pages")}
        </Badge>
        <h2 class={sectionTitle}>
          {t(locale, "Focused guides for FPS and alternatives")}
        </h2>
        <p class="text-muted-foreground mt-4 max-w-136 text-base leading-7">
          {t(
            locale,
            "These pages cover the common search paths around eye trainer warmups and browser-based alternatives."
          )}
        </p>
      </div>

      <div class="grid gap-3">
        {#each supportPages as page (page.slug)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Media
              variant="icon"
              class="bg-background text-brand-foreground size-9 rounded-lg border"
            >
              <BookOpenIcon class="size-4" />
            </Item.Media>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {t(locale, page.heading)}
              </Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {t(locale, page.description)}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button
                href={page.path}
                size="icon"
                variant="ghost"
                aria-label={`${t(locale, "Open")} ${t(locale, page.heading)}`}
              >
                <ExternalLinkIcon class="size-4" />
              </Button>
            </Item.Actions>
          </Item.Root>
        {/each}
      </div>
    </section>

    <section class={`page-enter-delay-4 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">{t(locale, "Controls")}</Badge>
        <h2 class={sectionTitle}>
          {t(locale, "Adjust the settings without guesswork")}
        </h2>
      </div>

      <div class="grid gap-3">
        <Item.Root
          variant="muted"
          class={`border-border/70 border ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="bg-background text-brand-foreground size-9 rounded-lg border"
          >
            <SlidersHorizontalIcon class="size-4" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none">
              {t(locale, "Motion and target")}
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {t(
                locale,
                "Speed, size, shape, color, opacity, and trail change the feel of the moving drills. Lilac Chaser has its own ball color and scale controls."
              )}
            </Item.Description>
          </Item.Content>
        </Item.Root>
        <Item.Root
          variant="muted"
          class={`border-border/70 border ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="bg-background text-brand-foreground size-9 rounded-lg border"
          >
            <ActivityIcon class="size-4" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none">
              {t(locale, "Screen scale")}
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {t(
                locale,
                "Viewing distance and CSS pixels/cm help speed settings match your display setup more closely."
              )}
            </Item.Description>
          </Item.Content>
        </Item.Root>
      </div>
    </section>

    <section
      id="faq"
      data-nosnippet
      class={`page-enter-delay-3 ${sectionGrid} ${guideEnterUp}`}
    >
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">FAQ</Badge>
        <h2 class={sectionTitle}>{t(locale, "Guide FAQ")}</h2>
      </div>

      <div class="grid gap-3">
        {#each guideFaqItems as faqItem (faqItem.question)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {t(locale, faqItem.question)}
              </Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {t(locale, faqItem.answer)}
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <section class={`page-enter-delay-4 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">{t(locale, "References")}</Badge>
        <h2 class={sectionTitle}>
          {t(locale, "Research and background reading")}
        </h2>
      </div>

      <div class="grid gap-3">
        {#each referenceLinks as referenceLink (referenceLink.url)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {t(locale, referenceLink.label)}
              </Item.Title>
              <Item.Description class="line-clamp-none">
                <a
                  href={referenceLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 underline underline-offset-4"
                >
                  {t(locale, "Read source")}
                  <ExternalLinkIcon class="size-3" />
                </a>
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <footer
      class={`page-enter-delay-4 border-border/60 text-muted-foreground flex flex-col gap-3 border-t pt-6 pb-10 text-sm sm:flex-row sm:items-center sm:justify-between ${guideEnterUp}`}
    >
      <span>
        {t(locale, "FoveaFlow is free. No account, no paid plan.")}
      </span>
      <div class="flex flex-wrap gap-2">
        <Button href={legalPageLinks.privacy.path} variant="ghost" size="sm">
          <ShieldCheckIcon class="size-4" />
          <span class="pl-1">{t(locale, legalPageLinks.privacy.label)}</span>
        </Button>
        <Button href={legalPageLinks.terms.path} variant="ghost" size="sm">
          <FileTextIcon class="size-4" />
          <span class="pl-1">{t(locale, legalPageLinks.terms.label)}</span>
        </Button>
      </div>
    </footer>
  </div>
</main>

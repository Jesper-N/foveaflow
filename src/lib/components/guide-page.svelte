<script lang="ts">
  import GuideResourceSections from "$lib/components/guide-resource-sections.svelte";
  import GuideTrainingSections from "$lib/components/guide-training-sections.svelte";
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import { guideMetadata } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import { safetyNote } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";

  const guideEnterTop = "guide-enter guide-enter-up";
  const guideEnterHero = "guide-enter page-enter-delay-1 guide-enter-up";
  const guideEnterUp = "guide-enter guide-enter-up";
  const guideItemSurface =
    "bg-background/70 shadow-[0_16px_36px_-30px_rgba(20,24,22,0.4)]";
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

    <GuideTrainingSections {locale} />
    <GuideResourceSections {locale} />
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

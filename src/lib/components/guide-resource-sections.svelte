<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { guideFaqItems } from "$lib/content/page-copy";
  import { supportPages } from "$lib/content/support-pages";
  import { referenceLinks } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";

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

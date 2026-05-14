<script lang="ts">
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import MousePointerIcon from "@lucide/svelte/icons/mouse-pointer-2";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";

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

  const featuredRoutes = trainerRoutes.filter((route) =>
    [
      "smooth-pursuit",
      "reaction-jumps",
      "multiple-distractions",
      "lilac-chaser",
    ].includes(route.slug),
  );

  const patternRoutes = trainerRoutes.filter(
    (route) => route.mode === "pursuit" && !route.indexable,
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
</script>

<main
  class="fixed inset-0 min-h-dvh overflow-auto bg-background text-foreground selection:bg-accent/30"
>
  <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-5 sm:px-6 lg:px-8">
    <nav
      class={`flex items-center justify-between gap-4 ${guideEnterTop}`}
      aria-label="Guide navigation"
    >
      <Button
        href="/"
        variant="outline"
        class="pressable-ui"
        aria-label={`Open ${siteMetadata.name}`}
      >
        <ArrowLeftIcon class="size-4" />
        <span class="pl-1">Open {siteMetadata.name}</span>
      </Button>

      <Badge
        variant="outline"
        class="hidden border-border/80 bg-background/80 px-3 py-1 text-muted-foreground sm:inline-flex"
      >
        Updated May 14, 2026
      </Badge>
    </nav>

    <section
      class={`grid items-center gap-10 pt-10 pb-10 md:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] md:pt-20 md:pb-16 ${guideEnterHero}`}
    >
      <div class="max-w-3xl">
        <Badge variant="secondary" class="mb-5 px-3 py-1">Guide</Badge>
        <h1
          class="max-w-[13ch] text-4xl leading-none font-semibold tracking-tight text-foreground md:text-6xl"
        >
          {guideMetadata.heading}
        </h1>
        <p
          class="mt-6 max-w-160 text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
        >
          {guideMetadata.summary}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button href="/" class="pressable-ui">
            <CrosshairIcon class="size-4" />
            <span class="pl-1">Open {siteMetadata.name}</span>
          </Button>
          <Button
            href="/smooth-pursuit/"
            variant="outline"
            class="pressable-ui"
          >
            <CrosshairIcon class="size-4" />
            <span class="pl-1">Try Smooth Pursuit</span>
          </Button>
          <Button href="#faq" variant="outline" class="pressable-ui">
            <BookOpenIcon class="size-4" />
            <span class="pl-1">Read guide FAQ</span>
          </Button>
        </div>
      </div>

      <div class="grid gap-4 md:translate-y-6">
        <Item.Root
          variant="outline"
          class={`border-border/80 p-5 backdrop-blur ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="size-10 rounded-lg border bg-muted text-accent"
          >
            <ActivityIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              Pick a drill and tune the target
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              Choose a path, set the speed and target style, then use it for a
              short visual tracking session.
            </Item.Description>
          </Item.Content>
        </Item.Root>

        <Item.Root
          variant="muted"
          class={`ml-0 border border-border/70 p-5 md:ml-8 ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="size-10 rounded-lg border bg-background text-accent"
          >
            <ShieldCheckIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              Keep the safety line clear
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {safetyNote}
            </Item.Description>
          </Item.Content>
        </Item.Root>
      </div>
    </section>

    <section class={`page-enter-delay-2 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">Drills</Badge>
        <h2 class={sectionTitle}>Choose a drill by the result you want</h2>
      </div>

      <div class="grid gap-3">
        {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-muted text-accent"
            >
              <CrosshairIcon class="size-4" />
            </Item.Media>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {trainingModeNote.title}
              </Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {trainingModeNote.body}
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <section class={`page-enter-delay-3 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">Mode guide</Badge>
        <h2 class={sectionTitle}>How each drill works</h2>
        <p class="mt-4 max-w-136 text-base leading-7 text-muted-foreground">
          Keep your head still unless a drill says otherwise. These modes are
          about eye movement, attention, and focus, not neck movement.
        </p>
      </div>

      <div class="grid gap-3">
        {#each trainingModeGuides as modeGuide (modeGuide.mode)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-muted text-accent"
            >
              <CrosshairIcon class="size-4" />
            </Item.Media>
            <Item.Content>
              <Item.Title class="line-clamp-none">{modeGuide.title}</Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {modeGuide.summary}
                {modeGuide.steps.join(" ")}
                {modeGuide.benefits}
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <section class={`page-enter-delay-3 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">Best fit</Badge>
        <h2 class={sectionTitle}>
          Best use cases for gamers, desk workers, and screen-heavy days
        </h2>
        <p class="mt-4 max-w-136 text-base leading-7 text-muted-foreground">
          Use it as a quick visual warmup or active screen break, not as medical
          care.
        </p>
      </div>

      <div class="grid gap-3">
        {#each audienceNotes as audienceNote (audienceNote.title)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-muted text-accent"
            >
              <ActivityIcon class="size-4" />
            </Item.Media>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {audienceNote.title}
              </Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {audienceNote.body}
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <section
      class={`page-enter-delay-3 grid gap-6 border-t border-border/60 pt-10 md:grid-cols-[1.18fr_0.82fr] md:gap-10 ${guideEnterUp}`}
    >
      <div class="grid gap-3">
        {#each featuredRoutes as route (route.slug)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-background text-accent"
            >
              <MousePointerIcon class="size-4" />
            </Item.Media>
            <Item.Content>
              <Item.Title class="line-clamp-none">{route.label}</Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {route.description}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button
                href={route.path}
                size="icon"
                variant="ghost"
                aria-label={`Open ${route.label}`}
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
        <Badge variant="outline" class="mb-4">Direct routes</Badge>
        <h2 class={sectionTitle}>Smooth Pursuit pattern routes</h2>
        <p class="mt-4 max-w-152 text-base leading-7 text-muted-foreground">
          Pattern pages start Smooth Pursuit with that path selected. Reaction
          jumps, Multiple Distractions, and Lilac Chaser have their own direct
          URLs.
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          {#each patternRoutes as route (route.slug)}
            <Button
              href={route.path}
              variant="outline"
              size="sm"
              class="pressable-ui"
            >
              {route.label}
            </Button>
          {/each}
        </div>
      </nav>
    </section>

    <section class={`page-enter-delay-4 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">More pages</Badge>
        <h2 class={sectionTitle}>Focused guides for FPS and alternatives</h2>
        <p class="mt-4 max-w-136 text-base leading-7 text-muted-foreground">
          These pages cover the common search paths around eye trainer warmups
          and browser-based alternatives.
        </p>
      </div>

      <div class="grid gap-3">
        {#each supportPages as page (page.slug)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Media
              variant="icon"
              class="size-9 rounded-lg border bg-background text-accent"
            >
              <BookOpenIcon class="size-4" />
            </Item.Media>
            <Item.Content>
              <Item.Title class="line-clamp-none">{page.heading}</Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {page.description}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button
                href={page.path}
                size="icon"
                variant="ghost"
                aria-label={`Open ${page.heading}`}
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
        <Badge variant="outline" class="mb-4">Controls</Badge>
        <h2 class={sectionTitle}>Adjust the settings without guesswork</h2>
      </div>

      <div class="grid gap-3">
        <Item.Root
          variant="muted"
          class={`border border-border/70 ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="size-9 rounded-lg border bg-background text-accent"
          >
            <SlidersHorizontalIcon class="size-4" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none">Motion and target</Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              Speed, size, shape, color, opacity, and trail change the feel of
              the moving drills. Lilac Chaser has its own ball color and scale
              controls.
            </Item.Description>
          </Item.Content>
        </Item.Root>
        <Item.Root
          variant="muted"
          class={`border border-border/70 ${guideItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="size-9 rounded-lg border bg-background text-accent"
          >
            <ActivityIcon class="size-4" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none">Screen scale</Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              Viewing distance and CSS pixels/cm help speed settings match your
              display setup more closely.
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
        <h2 class={sectionTitle}>Guide FAQ</h2>
      </div>

      <div class="grid gap-3">
        {#each guideFaqItems as faqItem (faqItem.question)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {faqItem.question}
              </Item.Title>
              <Item.Description class="line-clamp-none leading-6">
                {faqItem.answer}
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <section class={`page-enter-delay-4 ${sectionGrid} ${guideEnterUp}`}>
      <div class={sectionIntro}>
        <Badge variant="outline" class="mb-4">References</Badge>
        <h2 class={sectionTitle}>Research and background reading</h2>
      </div>

      <div class="grid gap-3">
        {#each referenceLinks as referenceLink (referenceLink.url)}
          <Item.Root variant="outline" class={guideItemSurface}>
            <Item.Content>
              <Item.Title class="line-clamp-none">
                {referenceLink.label}
              </Item.Title>
              <Item.Description class="line-clamp-none">
                <a
                  href={referenceLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 underline underline-offset-4"
                >
                  Read source
                  <ExternalLinkIcon class="size-3" />
                </a>
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
      </div>
    </section>

    <footer
      class={`page-enter-delay-4 flex flex-col gap-3 border-t border-border/60 pt-6 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between ${guideEnterUp}`}
    >
      <span>{siteMetadata.name} is free. No account, no paid plan.</span>
      <div class="flex flex-wrap gap-2">
        <Button href={legalPageLinks.privacy.path} variant="ghost" size="sm">
          <ShieldCheckIcon class="size-4" />
          <span class="pl-1">{legalPageLinks.privacy.label}</span>
        </Button>
        <Button href={legalPageLinks.terms.path} variant="ghost" size="sm">
          <FileTextIcon class="size-4" />
          <span class="pl-1">{legalPageLinks.terms.label}</span>
        </Button>
      </div>
    </footer>
  </div>
</main>

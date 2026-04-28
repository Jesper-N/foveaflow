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
  import { Separator } from "$lib/components/ui/separator/index.js";
  import {
    audienceNotes,
    faqItems,
    guideMetadata,
    legalPages,
    referenceLinks,
    safetyNote,
    siteMetadata,
    trainerRoutes,
    trainingModeNotes,
  } from "$lib/seo";

  const featuredRoutes = trainerRoutes.filter((route) =>
    ["random", "circle", "reaction-jumps", "multiple-distractions"].includes(
      route.slug,
    ),
  );

  const patternRoutes = trainerRoutes.filter(
    (route) => route.mode === "pursuit",
  );

  const guideEnterTop = "guide-enter guide-enter-top";
  const guideEnterUp = "guide-enter guide-enter-up";
  const interactiveItem =
    "pressable-ui will-change-transform motion-reduce:will-change-auto";
</script>

<main
  class="fixed inset-0 min-h-[100dvh] overflow-auto bg-background text-foreground selection:bg-accent/30"
>
  <div class="mx-auto grid w-full max-w-7xl gap-12 px-4 py-5 sm:px-6 lg:px-8">
    <nav class={`flex items-center justify-between gap-4 ${guideEnterTop}`}>
      <Button
        href="/"
        variant="outline"
        class="active:translate-y-px"
        aria-label="Open Eye Trainer"
      >
        <ArrowLeftIcon class="size-4" />
        <span class="pl-1">Open Eye Trainer</span>
      </Button>

      <Badge
        variant="outline"
        class="hidden border-border/80 bg-background/80 px-3 py-1 text-muted-foreground sm:inline-flex"
      >
        Updated April 28, 2026
      </Badge>
    </nav>

    <section
      class={`grid min-h-[calc(100dvh-7rem)] items-center gap-10 py-8 md:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] md:py-12 ${guideEnterUp}`}
    >
      <div class="max-w-3xl">
        <Badge variant="secondary" class="mb-5 px-3 py-1">Guide</Badge>
        <h1
          class="max-w-[14ch] text-4xl leading-none font-semibold tracking-tight text-foreground md:text-6xl"
        >
          {guideMetadata.title}
        </h1>
        <p class="mt-6 max-w-[42rem] text-base leading-7 text-muted-foreground">
          {guideMetadata.summary}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button href="/random/" class="active:translate-y-px">
            <CrosshairIcon class="size-4" />
            <span class="pl-1">Open Random pattern</span>
          </Button>
          <Button href="#faq" variant="outline" class="active:translate-y-px">
            <BookOpenIcon class="size-4" />
            <span class="pl-1">Read FAQ</span>
          </Button>
        </div>
      </div>

      <div class="grid gap-4 md:translate-y-10">
        <Item.Root
          variant="outline"
          class={`border-border/80 bg-card/70 p-5 shadow-[0_20px_40px_-28px_rgba(20,24,22,0.35)] backdrop-blur ${interactiveItem}`}
        >
          <Item.Media
            variant="icon"
            class="size-10 rounded-lg border bg-muted text-accent"
          >
            <ActivityIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              Motion patterns, no big claims
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              The patterns are simple screen paths. Pick one, adjust the target,
              and use the app for a short practice session.
            </Item.Description>
          </Item.Content>
        </Item.Root>

        <Item.Root
          variant="muted"
          class={`ml-0 border border-border/70 p-5 md:ml-10 ${interactiveItem}`}
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

    <Separator />

    <section class={`grid gap-6 md:grid-cols-[0.8fr_1.2fr] ${guideEnterUp}`}>
      <div>
        <Badge variant="outline" class="mb-4">Drills</Badge>
        <h2 class="text-2xl leading-tight font-semibold tracking-tight">
          Pick the drill that matches the session
        </h2>
      </div>

      <div class="grid gap-3">
        {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
          <Item.Root
            variant="outline"
            class={`bg-background/70 ${interactiveItem}`}
          >
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

    <Separator />

    <section
      class={`guide-enter-delay-1 grid gap-6 md:grid-cols-[0.8fr_1.2fr] ${guideEnterUp}`}
    >
      <div>
        <Badge variant="outline" class="mb-4">Best fit</Badge>
        <h2 class="text-2xl leading-tight font-semibold tracking-tight">
          Best for gamers, IT workers, and heavy screen users
        </h2>
        <p class="mt-4 max-w-[34rem] text-base leading-7 text-muted-foreground">
          Use it as a short visual tracking warmup or practice break, not as
          medical care.
        </p>
      </div>

      <div class="grid gap-3">
        {#each audienceNotes as audienceNote (audienceNote.title)}
          <Item.Root
            variant="outline"
            class={`bg-background/70 ${interactiveItem}`}
          >
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

    <Separator />

    <section
      class={`guide-enter-delay-1 grid gap-6 md:grid-cols-[1.15fr_0.85fr] ${guideEnterUp}`}
    >
      <div class="grid gap-3">
        {#each featuredRoutes as route (route.slug)}
          <Item.Root variant="outline" class={`bg-card/60 ${interactiveItem}`}>
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
                size="icon-sm"
                variant="ghost"
                aria-label={`Open ${route.label}`}
              >
                <ExternalLinkIcon class="size-4" />
              </Button>
            </Item.Actions>
          </Item.Root>
        {/each}
      </div>

      <div class="md:pt-10">
        <Badge variant="outline" class="mb-4">Direct routes</Badge>
        <h2 class="text-2xl leading-tight font-semibold tracking-tight">
          Pattern URLs load the matching state
        </h2>
        <p class="mt-4 max-w-[38rem] text-base leading-7 text-muted-foreground">
          Pattern pages open Smooth Pursuit with that path selected. Reaction
          jumps and Multiple Distractions use their own direct URLs.
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          {#each patternRoutes as route (route.slug)}
            <Button
              href={route.path}
              variant="outline"
              size="sm"
              class="motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-safe:active:scale-[0.97] motion-reduce:transition-none"
            >
              {route.label}
            </Button>
          {/each}
        </div>
      </div>
    </section>

    <Separator />

    <section
      class={`guide-enter-delay-2 grid gap-6 md:grid-cols-[0.8fr_1.2fr] ${guideEnterUp}`}
    >
      <div>
        <Badge variant="outline" class="mb-4">Controls</Badge>
        <h2 class="text-2xl leading-tight font-semibold tracking-tight">
          Useful settings
        </h2>
      </div>

      <div class="grid gap-3">
        <Item.Root
          variant="muted"
          class={`border border-border/70 ${interactiveItem}`}
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
              the same moving marker.
            </Item.Description>
          </Item.Content>
        </Item.Root>
        <Item.Root
          variant="muted"
          class={`border border-border/70 ${interactiveItem}`}
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

    <Separator />

    <section
      id="faq"
      class={`guide-enter-delay-3 grid gap-6 md:grid-cols-[0.8fr_1.2fr] ${guideEnterUp}`}
    >
      <div>
        <Badge variant="outline" class="mb-4">FAQ</Badge>
        <h2 class="text-2xl leading-tight font-semibold tracking-tight">
          Straight answers
        </h2>
      </div>

      <div class="grid gap-3">
        {#each faqItems as faqItem (faqItem.question)}
          <Item.Root
            variant="outline"
            class={`bg-background/70 ${interactiveItem}`}
          >
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

    <Separator />

    <section
      class={`guide-enter-delay-4 grid gap-6 md:grid-cols-[0.8fr_1.2fr] ${guideEnterUp}`}
    >
      <div>
        <Badge variant="outline" class="mb-4">References</Badge>
        <h2 class="text-2xl leading-tight font-semibold tracking-tight">
          Background reading
        </h2>
      </div>

      <div class="grid gap-3">
        {#each referenceLinks as referenceLink (referenceLink.url)}
          <Item.Root
            variant="outline"
            class={`bg-background/70 ${interactiveItem}`}
          >
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
      class={`guide-enter-delay-4 flex flex-col gap-3 border-t border-border/60 pt-6 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between ${guideEnterUp}`}
    >
      <span>{siteMetadata.name} is free. No account, no paid plan.</span>
      <div class="flex flex-wrap gap-2">
        <Button href={legalPages.privacy.path} variant="ghost" size="sm">
          <ShieldCheckIcon class="size-4" />
          <span class="pl-1">{legalPages.privacy.label}</span>
        </Button>
        <Button href={legalPages.terms.path} variant="ghost" size="sm">
          <FileTextIcon class="size-4" />
          <span class="pl-1">{legalPages.terms.label}</span>
        </Button>
      </div>
    </footer>
  </div>
</main>

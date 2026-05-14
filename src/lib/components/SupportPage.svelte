<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import CheckIcon from "@lucide/svelte/icons/check";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import type { SupportPage } from "$lib/content/support-pages";

  let { page }: { page: SupportPage } = $props();

  const guideEnterTop = "guide-enter guide-enter-top";
  const guideEnterUp = "guide-enter guide-enter-up";
  const supportItemSurface =
    "bg-background/70 shadow-[0_16px_36px_-30px_rgba(20,24,22,0.4)]";
  const sectionGrid =
    "grid gap-6 border-t border-border/60 pt-10 md:grid-cols-[0.72fr_1.28fr] md:gap-10";
  const sectionIntro = "md:sticky md:top-8 md:self-start";
  const sectionTitle =
    "max-w-[18rem] text-2xl leading-tight font-semibold tracking-tight";

  const delayClass = (index: number) =>
    index === 0 ? "guide-enter-delay-1" : "guide-enter-delay-2";
</script>

<main
  class="fixed inset-0 min-h-dvh overflow-auto bg-background text-foreground selection:bg-accent/30"
>
  <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-5 sm:px-6 lg:px-8">
    <nav
      class={`flex items-center justify-between gap-4 ${guideEnterTop}`}
      aria-label="Page navigation"
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
      class={`grid items-center gap-10 pt-10 pb-10 md:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] md:pt-20 md:pb-16 ${guideEnterUp}`}
    >
      <div class="max-w-3xl">
        <Badge variant="secondary" class="mb-5 px-3 py-1">
          {page.kicker}
        </Badge>
        <h1
          class="max-w-[14ch] text-4xl leading-none font-semibold tracking-tight text-foreground md:text-6xl"
        >
          {page.heading}
        </h1>
        <p
          class="mt-6 max-w-160 text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
        >
          {page.summary}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button href={page.primaryCta.href} class="pressable-ui">
            <CrosshairIcon class="size-4" />
            <span class="pl-1">{page.primaryCta.label}</span>
          </Button>
          {#if page.secondaryCta}
            <Button
              href={page.secondaryCta.href}
              variant="outline"
              class="pressable-ui"
            >
              <BookOpenIcon class="size-4" />
              <span class="pl-1">{page.secondaryCta.label}</span>
            </Button>
          {/if}
        </div>
      </div>

      <div class="grid gap-4 md:translate-y-6">
        <Item.Root
          variant="outline"
          class={`border-border/80 p-5 backdrop-blur ${supportItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="size-10 rounded-lg border bg-muted text-accent"
          >
            <SlidersHorizontalIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              Tune the session before you start
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              FoveaFlow saves local controls for speed, size, shape, color,
              opacity, trails, paths, distractors, letters, and display scale.
            </Item.Description>
          </Item.Content>
        </Item.Root>

        <Item.Root
          variant="muted"
          class={`ml-0 border border-border/70 p-5 md:ml-8 ${supportItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="size-10 rounded-lg border bg-background text-accent"
          >
            <ShieldCheckIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              Browser only, no account
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              Use it for short practice sessions. Stop if you feel eye strain,
              dizziness, headache, nausea, or discomfort.
            </Item.Description>
          </Item.Content>
        </Item.Root>
      </div>
    </section>

    <div class="grid gap-10 pb-10">
      {#each page.sections as section, index (section.heading)}
        <section class={`${sectionGrid} ${guideEnterUp} ${delayClass(index)}`}>
          <div class={sectionIntro}>
            <Badge variant="outline" class="mb-4">Details</Badge>
            <h2 class={sectionTitle}>{section.heading}</h2>
          </div>

          <div class="grid gap-4 text-base leading-7 text-muted-foreground">
            {#if section.body}
              {#each section.body as paragraph (paragraph)}
                <p>{paragraph}</p>
              {/each}
            {/if}

            {#if section.orderedList}
              <div class="grid gap-3">
                {#each section.orderedList as item, itemIndex (item)}
                  <Item.Root
                    variant="outline"
                    class={`items-center ${supportItemSurface}`}
                  >
                    <Item.Media
                      variant="icon"
                      class="size-9 rounded-lg border bg-muted text-accent"
                      aria-hidden="true"
                    >
                      <span class="text-xs font-semibold">{itemIndex + 1}</span>
                    </Item.Media>
                    <Item.Content>
                      <Item.Description class="line-clamp-none leading-6">
                        {item}
                      </Item.Description>
                    </Item.Content>
                  </Item.Root>
                {/each}
              </div>
            {/if}

            {#if section.list}
              <div class="grid gap-3">
                {#each section.list as item (item)}
                  <Item.Root
                    variant="outline"
                    class={`items-center ${supportItemSurface}`}
                  >
                    <Item.Media
                      variant="icon"
                      class="size-9 rounded-lg border bg-muted text-accent"
                    >
                      <CheckIcon class="size-4" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Description class="line-clamp-none leading-6">
                        {item}
                      </Item.Description>
                    </Item.Content>
                  </Item.Root>
                {/each}
              </div>
            {/if}
          </div>
        </section>
      {/each}

      {#if page.comparisonRows && page.comparisonLabel}
        <section
          class={`guide-enter-delay-3 ${sectionGrid} ${guideEnterUp}`}
          aria-labelledby="feature-comparison"
        >
          <div class={sectionIntro}>
            <Badge variant="outline" class="mb-4">Comparison</Badge>
            <h2 id="feature-comparison" class={sectionTitle}>
              Feature comparison
            </h2>
          </div>

          <Table.Root class="min-w-[46rem]">
            <Table.Header>
              <Table.Row class="hover:bg-transparent">
                <Table.Head class="w-[28%]">Question</Table.Head>
                <Table.Head>FoveaFlow</Table.Head>
                <Table.Head>{page.comparisonLabel}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each page.comparisonRows as row (row.feature)}
                <Table.Row>
                  <Table.Cell class="font-medium text-foreground">
                    {row.feature}
                  </Table.Cell>
                  <Table.Cell class="leading-6 text-muted-foreground">
                    {row.foveaflow}
                  </Table.Cell>
                  <Table.Cell class="leading-6 text-muted-foreground">
                    {row.alternative}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </section>
      {/if}

      <footer
        class={`guide-enter-delay-4 flex flex-col gap-3 border-t border-border/60 pt-8 pb-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between ${guideEnterUp}`}
      >
        <span>{siteMetadata.name} is free. No account, no install.</span>
        <div class="flex flex-wrap gap-2">
          <Button href="/guide/" variant="ghost" size="sm">
            <BookOpenIcon class="size-4" />
            <span class="pl-1">Guide</span>
          </Button>
          <Button href={legalPageLinks.privacy.path} variant="ghost" size="sm">
            <ShieldCheckIcon class="size-4" />
            <span class="pl-1">{legalPageLinks.privacy.label}</span>
          </Button>
          <Button href={legalPageLinks.terms.path} variant="ghost" size="sm">
            <FileTextIcon class="size-4" />
            <span class="pl-1">{legalPageLinks.terms.label}</span>
          </Button>
          {#if page.sourceLink}
            <Button
              href={page.sourceLink.href}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="sm"
            >
              <ExternalLinkIcon class="size-4" />
              <span class="pl-1">{page.sourceLink.label}</span>
            </Button>
          {/if}
        </div>
      </footer>
    </div>
  </div>
</main>

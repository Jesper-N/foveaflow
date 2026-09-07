<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import type { SupportPage } from "$lib/content/support-pages";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import CheckIcon from "@lucide/svelte/icons/check";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";

  import {
    pageItemSurface,
    pageSectionGrid,
    pageSectionIntro,
    pageSectionTitle,
  } from "./page-styles";

  let { page }: { page: SupportPage } = $props();

  const delayClass = (index: number) =>
    index === 0 ? "[animation-delay:85ms]" : "[animation-delay:125ms]";
  let locale = $derived(languageState.locale);
</script>

<main class="bg-background text-foreground selection:bg-accent/30 min-h-dvh">
  <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-5 sm:px-6 lg:px-8">
    <nav
      class="guide-enter flex items-center justify-between gap-4"
      aria-label={t(locale, "Page navigation")}
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
      class="guide-enter grid items-center gap-10 pt-10 pb-10 [animation-delay:45ms] md:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] md:pt-20 md:pb-16"
    >
      <div class="max-w-3xl">
        <Badge variant="secondary" class="mb-5 px-3 py-1">
          {t(locale, page.kicker)}
        </Badge>
        <h1
          class="text-foreground max-w-[14ch] text-4xl leading-none font-semibold tracking-tight md:text-6xl"
        >
          {t(locale, page.heading)}
        </h1>
        <p
          class="text-muted-foreground mt-6 max-w-160 text-base leading-7 md:text-lg md:leading-8"
        >
          {t(locale, page.summary)}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button href={page.primaryCta.href}>
            <CrosshairIcon class="size-4" />
            <span class="pl-1">{t(locale, page.primaryCta.label)}</span>
          </Button>
          {#if page.secondaryCta}
            <Button href={page.secondaryCta.href} variant="outline">
              <BookOpenIcon class="size-4" />
              <span class="pl-1">{t(locale, page.secondaryCta.label)}</span>
            </Button>
          {/if}
        </div>
      </div>

      <div class="grid gap-4 md:translate-y-6">
        <Item.Root
          variant="outline"
          class={`border-border/80 p-5 ${pageItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="bg-muted text-brand-foreground size-10 rounded-lg border"
          >
            <SlidersHorizontalIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              {t(locale, "Tune the session before you start")}
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {t(
                locale,
                "FoveaFlow saves local controls for speed, size, shape, color, opacity, trails, paths, distractors, letters, and display scale."
              )}
            </Item.Description>
          </Item.Content>
        </Item.Root>

        <Item.Root
          variant="muted"
          class={`border-border/70 ml-0 border p-5 md:ml-8 ${pageItemSurface}`}
        >
          <Item.Media
            variant="icon"
            class="bg-background text-brand-foreground size-10 rounded-lg border"
          >
            <ShieldCheckIcon class="size-5" />
          </Item.Media>
          <Item.Content>
            <Item.Title class="line-clamp-none text-base">
              {t(locale, "Browser only, no account")}
            </Item.Title>
            <Item.Description class="line-clamp-none leading-6">
              {t(
                locale,
                "Use it for short practice sessions. Stop if you feel eye strain, dizziness, headache, nausea, or discomfort."
              )}
            </Item.Description>
          </Item.Content>
        </Item.Root>
      </div>
    </section>

    <div class="grid gap-10 pb-10">
      {#each page.sections as section, index (section.heading)}
        <section class={`${pageSectionGrid} guide-enter ${delayClass(index)}`}>
          <div class={pageSectionIntro}>
            <Badge variant="outline" class="mb-4">
              {t(locale, "Details")}
            </Badge>
            <h2 class={pageSectionTitle}>{t(locale, section.heading)}</h2>
          </div>

          <div class="text-muted-foreground grid gap-4 text-base leading-7">
            {#if section.body}
              {#each section.body as paragraph (paragraph)}
                <p>{t(locale, paragraph)}</p>
              {/each}
            {/if}

            {#if section.orderedList}
              <ol class="grid gap-3">
                {#each section.orderedList as item, itemIndex (item)}
                  <li>
                    <Item.Root
                      variant="outline"
                      class={`items-center ${pageItemSurface}`}
                    >
                      <Item.Media
                        variant="icon"
                        class="bg-muted text-brand-foreground size-9 rounded-lg border"
                        aria-hidden="true"
                      >
                        <span class="text-xs font-semibold"
                          >{itemIndex + 1}</span
                        >
                      </Item.Media>
                      <Item.Content>
                        <Item.Description class="line-clamp-none leading-6">
                          {t(locale, item)}
                        </Item.Description>
                      </Item.Content>
                    </Item.Root>
                  </li>
                {/each}
              </ol>
            {/if}

            {#if section.list}
              <ul class="grid gap-3">
                {#each section.list as item (item)}
                  <li>
                    <Item.Root
                      variant="outline"
                      class={`items-center ${pageItemSurface}`}
                    >
                      <Item.Media
                        variant="icon"
                        class="bg-muted text-brand-foreground size-9 rounded-lg border"
                        aria-hidden="true"
                      >
                        <CheckIcon class="size-4" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Description class="line-clamp-none leading-6">
                          {t(locale, item)}
                        </Item.Description>
                      </Item.Content>
                    </Item.Root>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </section>
      {/each}

      {#if page.comparisonRows && page.comparisonLabel}
        <section
          class={`[animation-delay:165ms] ${pageSectionGrid} guide-enter`}
          aria-labelledby="feature-comparison"
        >
          <div class={pageSectionIntro}>
            <Badge variant="outline" class="mb-4">
              {t(locale, "Comparison")}
            </Badge>
            <h2 id="feature-comparison" class={pageSectionTitle}>
              {t(locale, "Feature comparison")}
            </h2>
          </div>

          <Table.Root class="min-w-184">
            <Table.Header>
              <Table.Row class="hover:bg-transparent">
                <Table.Head class="w-[28%]">{t(locale, "Question")}</Table.Head>
                <Table.Head>FoveaFlow</Table.Head>
                <Table.Head>{page.comparisonLabel}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each page.comparisonRows as row (row.feature)}
                <Table.Row>
                  <Table.Cell class="text-foreground font-medium">
                    {t(locale, row.feature)}
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground leading-6">
                    {t(locale, row.foveaflow)}
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground leading-6">
                    {t(locale, row.alternative)}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </section>
      {/if}

      <footer
        class="border-border/60 text-muted-foreground guide-enter flex flex-col gap-3 border-t pt-8 pb-8 text-sm [animation-delay:165ms] sm:flex-row sm:items-center sm:justify-between"
      >
        <span>{t(locale, "FoveaFlow is free. No account, no install.")}</span>
        <div class="flex flex-wrap gap-2">
          <Button href="/guide/" variant="ghost" size="sm">
            <BookOpenIcon class="size-4" />
            <span class="pl-1">{t(locale, "Guide")}</span>
          </Button>
          <Button href={legalPageLinks.privacy.path} variant="ghost" size="sm">
            <ShieldCheckIcon class="size-4" />
            <span class="pl-1">{t(locale, legalPageLinks.privacy.label)}</span>
          </Button>
          <Button href={legalPageLinks.terms.path} variant="ghost" size="sm">
            <FileTextIcon class="size-4" />
            <span class="pl-1">{t(locale, legalPageLinks.terms.label)}</span>
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
              <span class="pl-1">{t(locale, page.sourceLink.label)}</span>
            </Button>
          {/if}
        </div>
      </footer>
    </div>
  </div>
</main>

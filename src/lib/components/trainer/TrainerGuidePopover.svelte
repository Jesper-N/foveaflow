<script lang="ts">
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import XIcon from "@lucide/svelte/icons/x";

  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import type { PageSeoContent } from "$lib/content/page-copy";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import {
    trainingModeNotes,
    type TrainingModeGuide,
  } from "$lib/content/training";

  let {
    activeTrainingModeGuide,
    guideSeoContent,
    guideUseCases,
    hasActiveRoute,
    openGuideFaqQuestion,
    onGuidePopoverToggle,
    toggleGuideFaq,
  }: {
    activeTrainingModeGuide: TrainingModeGuide;
    guideSeoContent: PageSeoContent;
    guideUseCases: readonly string[];
    hasActiveRoute: boolean;
    openGuideFaqQuestion: string | null;
    onGuidePopoverToggle: (event: ToggleEvent) => void;
    toggleGuideFaq: (question: string) => void;
  } = $props();

  let quickFaqItems = $derived(guideSeoContent.faq.slice(0, 3));
</script>

{#snippet closeButton()}
  <Button
    variant="ghost"
    class="absolute top-4 right-4 bg-secondary"
    size="icon-sm"
    aria-label="Close"
    popovertarget="trainer-guide-popover"
    popovertargetaction="hide"
  >
    <XIcon />
    <span class="sr-only">Close</span>
  </Button>
{/snippet}

{#snippet footer()}
  <footer
    class="guide-enter guide-enter-delay-4 mt-8 flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="min-w-0 text-xs leading-5 text-muted-foreground">
      {siteMetadata.name} is free to use, requires no account or install, and stores
      settings locally in your browser.
    </p>

    <div class="flex shrink-0 flex-wrap gap-2 sm:justify-end">
      <Button
        href={siteMetadata.repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        size="xs"
      >
        <ExternalLinkIcon class="size-3" />
        <span class="pl-1">Source</span>
      </Button>
      <Button href={legalPageLinks.privacy.path} variant="ghost" size="xs">
        <ShieldCheckIcon class="size-3" />
        <span class="pl-1">{legalPageLinks.privacy.label}</span>
      </Button>
      <Button href={legalPageLinks.terms.path} variant="ghost" size="xs">
        <FileTextIcon class="size-3" />
        <span class="pl-1">{legalPageLinks.terms.label}</span>
      </Button>
    </div>
  </footer>
{/snippet}

{#snippet homepageContent()}
  <div class="guide-enter guide-enter-top flex items-start gap-4">
    <div class="min-w-0 space-y-2 pr-12">
      <p
        class="text-[0.7rem] leading-4 font-semibold tracking-wide text-accent uppercase"
      >
        {homepageSeoContent.kicker}
      </p>
      <h2
        id="trainer-guide-popover-title"
        class="text-2xl leading-tight font-semibold text-balance"
      >
        {homepageSeoContent.heading}
      </h2>
    </div>
  </div>

  {@render closeButton()}

  <div
    class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.18fr)_minmax(16rem,0.82fr)]"
  >
    <section
      class="guide-enter guide-enter-delay-1 space-y-5 border-t border-border/40 pt-6"
      aria-label="FoveaFlow overview"
    >
      <h3 class="text-base font-semibold text-foreground">Overview</h3>

      <div
        class="mt-6 space-y-4 text-sm leading-6 text-muted-foreground text-pretty sm:text-[0.95rem] sm:leading-7"
      >
        {#each homepageSeoContent.body as paragraph (paragraph)}
          <p class="max-w-[58ch]">{paragraph}</p>
        {/each}
      </div>
    </section>

    <section
      class="guide-enter guide-enter-delay-2 border-t border-border/40 pt-6"
      aria-labelledby="homepage-guide-drills"
    >
      <h3
        id="homepage-guide-drills"
        class="text-base font-semibold text-foreground"
      >
        Drills
      </h3>
      <ul class="mt-6 grid gap-5">
        {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
          <li class="grid grid-cols-[2.25rem_1fr] gap-4">
            <span
              class="flex size-8 items-center justify-center rounded-full bg-accent/12 text-accent shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
              aria-hidden="true"
            >
              <TargetIcon class="size-4" />
            </span>
            <span class="pt-1 leading-6 text-muted-foreground text-pretty">
              <span class="font-semibold text-foreground">
                {trainingModeNote.title}:
              </span>
              {trainingModeNote.body}
            </span>
          </li>
        {/each}
      </ul>
    </section>

    <aside
      class="guide-enter guide-enter-delay-3 border-t border-border/40 pt-6"
    >
      <h3 class="text-base font-semibold text-foreground">Safety</h3>
      <p class="mt-6 text-sm leading-6 text-muted-foreground text-pretty">
        {homepageSeoContent.trustNote}
      </p>

      <div
        class="mt-6 flex flex-wrap gap-2"
        aria-label={`Best uses for ${siteMetadata.name}`}
      >
        {#each guideUseCases as useCase (useCase)}
          <span
            class="rounded-full border border-border/40 bg-muted/35 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {useCase}
          </span>
        {/each}
      </div>

      <a
        href="/guide/"
        class={`${buttonVariants({ variant: "default", size: "lg" })} pressable-ui guide-enter guide-enter-delay-4 mt-6 w-full`}
      >
        <BookOpenIcon class="size-4" />
        <span>Read the full guide</span>
      </a>
    </aside>
  </div>
{/snippet}

{#snippet routeContent()}
  <div class="guide-enter guide-enter-top min-w-0 space-y-2 pr-12">
    <p
      class="text-[0.7rem] leading-4 font-semibold tracking-wide text-accent uppercase"
    >
      {guideSeoContent.kicker}
    </p>
    <h2
      id="trainer-guide-popover-title"
      class="max-w-[28ch] text-2xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-3xl lg:text-[2.125rem]"
    >
      {guideSeoContent.heading}
    </h2>
    <p
      class="max-w-[62ch] text-sm leading-6 text-muted-foreground text-pretty sm:text-base"
    >
      {guideSeoContent.hero}
    </p>
  </div>

  {@render closeButton()}

  <div
    class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.06fr)_minmax(16rem,0.82fr)]"
  >
    <section
      class="guide-enter guide-enter-delay-1 space-y-6 border-t border-border/40 pt-6"
      aria-label={`${guideSeoContent.heading} overview`}
    >
      <h3 class="text-base font-semibold text-foreground">Overview</h3>

      <div
        class="mt-6 space-y-4 text-sm leading-6 text-muted-foreground text-pretty sm:text-[0.95rem] sm:leading-7"
      >
        {#each guideSeoContent.body as paragraph (paragraph)}
          <p class="max-w-[58ch]">
            {paragraph}
          </p>
        {/each}
      </div>

      <Button href="/guide/" size="xl" class="pressable-ui w-full">
        <BookOpenIcon class="size-5" />
        <span class="pl-1">Read full guide</span>
      </Button>
    </section>

    <section
      class="guide-enter guide-enter-delay-2 border-t border-border/40 pt-6"
      aria-labelledby="trainer-guide-steps"
    >
      <h3
        id="trainer-guide-steps"
        class="text-base font-semibold text-foreground text-balance"
      >
        How to use {activeTrainingModeGuide.title}
      </h3>

      <ol class="mt-6 grid gap-5">
        {#each activeTrainingModeGuide.steps as step, index (step)}
          <li class="grid grid-cols-[2.25rem_1fr] gap-4">
            <span
              class="flex size-8 items-center justify-center rounded-full bg-accent/12 text-xs font-semibold tabular-nums text-accent shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span class="pt-1 leading-6 text-muted-foreground text-pretty">
              {step}
            </span>
          </li>
        {/each}
      </ol>

      <p
        class="mt-6 border-t border-border/40 pt-6 text-sm leading-6 text-muted-foreground text-pretty"
      >
        <span class="font-semibold text-foreground">What it trains:</span>
        {activeTrainingModeGuide.benefits}
      </p>
    </section>

    <aside
      class="guide-enter guide-enter-delay-3 border-t border-border/40 pt-6 lg:col-span-2 xl:col-span-1"
      aria-labelledby="trainer-guide-faq"
    >
      <h3
        id="trainer-guide-faq"
        class="text-base font-semibold text-foreground text-balance"
      >
        Quick answers
      </h3>

      <div class="mt-6 divide-y divide-border/40">
        {#each quickFaqItems as faqItem, index (faqItem.question)}
          {@const faqOpen = openGuideFaqQuestion === faqItem.question}
          <div class="py-4 first:pt-0 last:pb-0">
            <button
              type="button"
              class="flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-semibold text-foreground outline-hidden transition-colors duration-150 ease-out hover:text-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/30"
              aria-expanded={faqOpen}
              aria-controls={`trainer-guide-faq-answer-${index}`}
              onclick={() => toggleGuideFaq(faqItem.question)}
            >
              <span>{faqItem.question}</span>
              <span
                class={[
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-base leading-none text-muted-foreground transition-transform duration-200 ease-out",
                  faqOpen && "rotate-45",
                ]}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              id={`trainer-guide-faq-answer-${index}`}
              class={[
                "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                faqOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ]}
            >
              <div class="min-h-0 overflow-hidden">
                <p
                  class={[
                    "pb-1 text-sm leading-6 text-muted-foreground text-pretty transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    faqOpen ? "opacity-100" : "opacity-0",
                  ]}
                >
                  {faqItem.answer}
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div
        class="mt-6 flex flex-wrap gap-2"
        aria-label={`Best uses for ${activeTrainingModeGuide.title}`}
      >
        {#each guideUseCases as useCase (useCase)}
          <span
            class="rounded-full border border-border/40 bg-muted/35 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {useCase}
          </span>
        {/each}
      </div>

      <p class="mt-6 text-xs leading-5 text-muted-foreground/85">
        {guideSeoContent.trustNote}
      </p>
    </aside>
  </div>
{/snippet}

<section
  id="trainer-guide-popover"
  popover="auto"
  class="native-dialog-popover t-resize native-guide-popover relative rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-hidden animation-duration-[100ms] dark:ring-foreground/10 sm:p-8"
  aria-labelledby="trainer-guide-popover-title"
  ontoggle={onGuidePopoverToggle}
>
  {#if hasActiveRoute}
    {@render routeContent()}
  {:else}
    {@render homepageContent()}
  {/if}

  {@render footer()}
</section>

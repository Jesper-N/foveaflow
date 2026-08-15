<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import type { PageSeoContent } from "$lib/content/page-copy";
  import { homepageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import { trainingModeNotes } from "$lib/content/training";
  import type { TrainingModeGuide } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import TargetIcon from "@lucide/svelte/icons/crosshair";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import XIcon from "@lucide/svelte/icons/x";

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
  let locale = $derived(languageState.locale);
  let closeButtonElement = $state<HTMLButtonElement | null>(null);

  const handlePopoverToggle = (event: ToggleEvent) => {
    onGuidePopoverToggle(event);
    if (event.newState !== "open") {
      return;
    }

    requestAnimationFrame(() => closeButtonElement?.focus());
  };
</script>

{#snippet closeButton()}
  <Button
    bind:ref={closeButtonElement}
    variant="ghost"
    class="bg-secondary absolute top-4 right-4"
    size="icon-sm"
    aria-label={t(locale, "Close")}
    popovertarget="trainer-guide-popover"
    popovertargetaction="hide"
  >
    <XIcon />
    <span class="sr-only">{t(locale, "Close")}</span>
  </Button>
{/snippet}

{#snippet footer()}
  <footer
    class="guide-enter guide-enter-delay-4 border-border/40 mt-8 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-muted-foreground min-w-0 text-xs leading-5">
      {t(
        locale,
        "FoveaFlow is free to use, requires no account or install, and stores settings locally in your browser."
      )}
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
        <span class="pl-1">{t(locale, "Source")}</span>
      </Button>
      <Button href={legalPageLinks.privacy.path} variant="ghost" size="xs">
        <ShieldCheckIcon class="size-3" />
        <span class="pl-1">{t(locale, legalPageLinks.privacy.label)}</span>
      </Button>
      <Button href={legalPageLinks.terms.path} variant="ghost" size="xs">
        <FileTextIcon class="size-3" />
        <span class="pl-1">{t(locale, legalPageLinks.terms.label)}</span>
      </Button>
    </div>
  </footer>
{/snippet}

{#snippet homepageContent()}
  <div class="guide-enter guide-enter-top flex items-start gap-4">
    <div class="grid min-w-0 gap-2 pr-12">
      <p
        class="text-brand-foreground text-[0.7rem] leading-4 font-semibold tracking-wide uppercase"
      >
        {t(locale, homepageSeoContent.kicker)}
      </p>
      <h2
        id="trainer-guide-popover-title"
        class="text-2xl leading-tight font-semibold text-balance"
      >
        {t(locale, homepageSeoContent.heading)}
      </h2>
    </div>
  </div>

  {@render closeButton()}

  <div
    class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.18fr)_minmax(16rem,0.82fr)]"
  >
    <section
      class="guide-enter guide-enter-delay-1 border-border/40 grid gap-5 border-t pt-6"
      aria-label={t(locale, "FoveaFlow overview")}
    >
      <h3 class="text-foreground text-base font-semibold">
        {t(locale, "Overview")}
      </h3>

      <div
        class="text-muted-foreground grid gap-4 text-sm leading-6 text-pretty sm:text-[0.95rem] sm:leading-7"
      >
        {#each homepageSeoContent.body as paragraph (paragraph)}
          <p class="max-w-[58ch]">{t(locale, paragraph)}</p>
        {/each}
      </div>
    </section>

    <section
      class="guide-enter guide-enter-delay-2 border-border/40 border-t pt-6"
      aria-labelledby="homepage-guide-drills"
    >
      <h3
        id="homepage-guide-drills"
        class="text-foreground text-base font-semibold"
      >
        {t(locale, "Drills")}
      </h3>
      <ul class="mt-6 grid gap-5">
        {#each trainingModeNotes as trainingModeNote (trainingModeNote.title)}
          <li class="grid grid-cols-[2.25rem_1fr] gap-4">
            <span
              class="bg-accent/12 text-brand-foreground flex size-8 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
              aria-hidden="true"
            >
              <TargetIcon class="size-4" />
            </span>
            <span class="text-muted-foreground pt-1 leading-6 text-pretty">
              <span class="text-foreground font-semibold">
                {t(locale, trainingModeNote.title)}:
              </span>
              {t(locale, trainingModeNote.body)}
            </span>
          </li>
        {/each}
      </ul>
    </section>

    <aside
      class="guide-enter guide-enter-delay-3 border-border/40 border-t pt-6"
    >
      <h3 class="text-foreground text-base font-semibold">
        {t(locale, "Safety")}
      </h3>
      <p class="text-muted-foreground mt-6 text-sm leading-6 text-pretty">
        {t(locale, homepageSeoContent.trustNote)}
      </p>

      <div
        class="mt-6 flex flex-wrap gap-2"
        aria-label={`${t(locale, "Best uses for")} ${siteMetadata.name}`}
      >
        {#each guideUseCases as useCase (useCase)}
          <span
            class="border-border/40 bg-muted/35 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium"
          >
            {t(locale, useCase)}
          </span>
        {/each}
      </div>

      <Button
        href="/guide/"
        size="lg"
        class="guide-enter guide-enter-delay-4 mt-6 w-full"
      >
        <BookOpenIcon data-icon="inline-start" />
        <span>{t(locale, "Read the full guide")}</span>
      </Button>
    </aside>
  </div>
{/snippet}

{#snippet routeContent()}
  <div class="guide-enter guide-enter-top grid min-w-0 gap-2 pr-12">
    <p
      class="text-brand-foreground text-[0.7rem] leading-4 font-semibold tracking-wide uppercase"
    >
      {t(locale, guideSeoContent.kicker)}
    </p>
    <h2
      id="trainer-guide-popover-title"
      class="max-w-[28ch] text-2xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-3xl lg:text-[2.125rem]"
    >
      {t(locale, guideSeoContent.heading)}
    </h2>
    <p
      class="text-muted-foreground max-w-[62ch] text-sm leading-6 text-pretty sm:text-base"
    >
      {t(locale, guideSeoContent.hero)}
    </p>
  </div>

  {@render closeButton()}

  <div
    class="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.06fr)_minmax(16rem,0.82fr)]"
  >
    <section
      class="guide-enter guide-enter-delay-1 border-border/40 grid gap-6 border-t pt-6"
      aria-label={`${t(locale, guideSeoContent.heading)} ${t(locale, "overview")}`}
    >
      <h3 class="text-foreground text-base font-semibold">
        {t(locale, "Overview")}
      </h3>

      <div
        class="text-muted-foreground grid gap-4 text-sm leading-6 text-pretty sm:text-[0.95rem] sm:leading-7"
      >
        {#each guideSeoContent.body as paragraph (paragraph)}
          <p class="max-w-[58ch]">
            {t(locale, paragraph)}
          </p>
        {/each}
      </div>

      <Button href="/guide/" size="xl" class="w-full">
        <BookOpenIcon class="size-5" />
        <span class="pl-1">{t(locale, "Read full guide")}</span>
      </Button>
    </section>

    <section
      class="guide-enter guide-enter-delay-2 border-border/40 border-t pt-6"
      aria-labelledby="trainer-guide-steps"
    >
      <h3
        id="trainer-guide-steps"
        class="text-foreground text-base font-semibold text-balance"
      >
        {t(locale, "How to use")}
        {t(locale, activeTrainingModeGuide.title)}
      </h3>

      <ol class="mt-6 grid gap-5">
        {#each activeTrainingModeGuide.steps as step, index (step)}
          <li class="grid grid-cols-[2.25rem_1fr] gap-4">
            <span
              class="bg-accent/12 text-brand-foreground flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums shadow-[inset_0_0_0_1px_rgba(118,217,0,0.14)]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span class="text-muted-foreground pt-1 leading-6 text-pretty">
              {t(locale, step)}
            </span>
          </li>
        {/each}
      </ol>

      <p
        class="border-border/40 text-muted-foreground mt-6 border-t pt-6 text-sm leading-6 text-pretty"
      >
        <span class="text-foreground font-semibold">
          {t(locale, "What it trains:")}
        </span>
        {t(locale, activeTrainingModeGuide.benefits)}
      </p>
    </section>

    <aside
      class="guide-enter guide-enter-delay-3 border-border/40 border-t pt-6 lg:col-span-2 xl:col-span-1"
      aria-labelledby="trainer-guide-faq"
    >
      <h3
        id="trainer-guide-faq"
        class="text-foreground text-base font-semibold text-balance"
      >
        {t(locale, "Quick answers")}
      </h3>

      <div class="divide-border/40 mt-6 divide-y">
        {#each quickFaqItems as faqItem, index (faqItem.question)}
          {@const faqOpen = openGuideFaqQuestion === faqItem.question}
          <div class="py-4 first:pt-0 last:pb-0">
            <button
              type="button"
              class="text-foreground hover:text-foreground/90 focus-visible:ring-foreground flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-semibold outline-hidden transition-colors duration-150 ease-out focus-visible:ring-3"
              aria-expanded={faqOpen}
              aria-controls={`trainer-guide-faq-answer-${index}`}
              onclick={() => toggleGuideFaq(faqItem.question)}
            >
              <span>{t(locale, faqItem.question)}</span>
              <span
                class={[
                  "text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-base leading-none transition-transform duration-200 ease-out",
                  faqOpen && "rotate-45",
                ]}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              id={`trainer-guide-faq-answer-${index}`}
              aria-hidden={!faqOpen}
              inert={!faqOpen}
              class={[
                "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                faqOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ]}
            >
              <div class="min-h-0 overflow-hidden">
                <p
                  class="text-muted-foreground pb-1 text-sm leading-6 text-pretty"
                >
                  {t(locale, faqItem.answer)}
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div
        class="mt-6 flex flex-wrap gap-2"
        aria-label={`${t(locale, "Best uses for")} ${t(locale, activeTrainingModeGuide.title)}`}
      >
        {#each guideUseCases as useCase (useCase)}
          <span
            class="border-border/40 bg-muted/35 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium"
          >
            {t(locale, useCase)}
          </span>
        {/each}
      </div>

      <p class="text-muted-foreground mt-6 text-xs leading-5">
        {t(locale, guideSeoContent.trustNote)}
      </p>
    </aside>
  </div>
{/snippet}

<div
  id="trainer-guide-popover"
  popover="auto"
  role="dialog"
  class="native-dialog-popover t-resize native-guide-popover bg-popover text-popover-foreground ring-foreground/5 animation-duration-[100ms] dark:ring-foreground/10 relative rounded-4xl p-6 text-sm shadow-xl ring-1 outline-hidden sm:p-8"
  aria-labelledby="trainer-guide-popover-title"
  ontoggle={handlePopoverToggle}
>
  {#if hasActiveRoute}
    {@render routeContent()}
  {:else}
    {@render homepageContent()}
  {/if}

  {@render footer()}
</div>

<script lang="ts">
  import "./trainer-guide-dialog.css";
  import DrillIllustration from "$lib/components/drill-illustration.svelte";
  import { panelSurface, textLink } from "$lib/components/page-styles";
  import TrainerGuideHomepageContent from "$lib/components/trainer/trainer-guide-homepage-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { legalPageLinks } from "$lib/content/legal";
  import { freeUseNote } from "$lib/content/page-copy";
  import type { PageSeoContent } from "$lib/content/page-copy";
  import { siteMetadata } from "$lib/content/site";
  import type { TrainingModeGuide } from "$lib/content/training";
  import { languageState } from "$lib/i18n/state.svelte";
  import { formatDate, t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils.js";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Attachment } from "svelte/attachments";

  import {
    guideCopy,
    guideLede,
    guideSectionHeading,
    guideStage,
    guideTitle,
  } from "./guide-styles";

  let {
    activeTrainingModeGuide,
    guideSeoContent,
    hasActiveRoute,
    lastModified,
    onClose,
  }: {
    activeTrainingModeGuide: TrainingModeGuide;
    guideSeoContent: PageSeoContent;
    hasActiveRoute: boolean;
    lastModified: string;
    onClose: () => void;
  } = $props();

  let quickFaqItems = $derived(guideSeoContent.faq.slice(0, 3));
  let locale = $derived(languageState.locale);

  const footerLink = cn(
    textLink,
    "inline-flex min-h-6 items-center gap-1 text-xs"
  );

  // Close on a click that starts and ends on the backdrop, so selecting text
  // and releasing outside the panel keeps the guide open.
  const closeOnBackdropClick: Attachment<HTMLDialogElement> = (dialog) => {
    let pressedBackdrop = false;
    const handlePointerDown = (event: PointerEvent) => {
      pressedBackdrop = event.target === dialog;
    };
    const handleClick = (event: MouseEvent) => {
      if (pressedBackdrop && event.target === dialog) {
        dialog.close();
      }
    };
    dialog.addEventListener("pointerdown", handlePointerDown);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("pointerdown", handlePointerDown);
      dialog.removeEventListener("click", handleClick);
    };
  };
</script>

{#snippet routeContent()}
  <header class={[guideStage, "sm:grid-cols-[minmax(0,1fr)_13rem]"]}>
    <div class="guide-enter grid gap-3 pr-12 sm:pr-0">
      <h2 id="trainer-guide-title" class={guideTitle}>
        {t(locale, guideSeoContent.heading)}
      </h2>
      <p class={guideLede}>{t(locale, guideSeoContent.hero)}</p>
    </div>
    <DrillIllustration
      mode={activeTrainingModeGuide.mode}
      class="relative hidden sm:block"
    />
  </header>

  <div
    class="grid gap-8 px-6 py-7 sm:grid-cols-[minmax(0,1fr)_17rem] sm:grid-rows-[auto_1fr] sm:gap-x-10 sm:px-8"
  >
    <section
      class="guide-enter grid content-start gap-3 [animation-delay:40ms]"
      aria-labelledby="trainer-guide-steps"
    >
      <h3 id="trainer-guide-steps" class={guideSectionHeading}>
        {t(locale, "How to practice")}
      </h3>
      <ol class="grid gap-3">
        {#each activeTrainingModeGuide.steps as step, index (step)}
          <li class="grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline">
            <span
              class="text-brand-foreground font-semibold tabular-nums"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span class={guideCopy}>{t(locale, step)}</span>
          </li>
        {/each}
      </ol>
    </section>

    <!-- Spans both rows so the answers sit beside the steps and the overview. -->
    <div
      class="guide-enter grid content-start gap-8 [animation-delay:80ms] sm:row-span-2"
    >
      <p class={[panelSurface, "rounded-2xl p-5", guideCopy]}>
        <span class="text-foreground font-medium">
          {t(locale, "What it trains:")}
        </span>
        {t(locale, activeTrainingModeGuide.benefits)}
      </p>

      <section aria-labelledby="trainer-guide-faq">
        <h3 id="trainer-guide-faq" class={guideSectionHeading}>
          {t(locale, "Quick answers")}
        </h3>
        <div class="divide-border/60 mt-1 divide-y">
          {#each quickFaqItems as faqItem (faqItem.question)}
            <details
              name="trainer-guide-faq"
              class="group [interpolate-size:allow-keywords] details-content:h-0 details-content:overflow-clip details-content:transition-[height,content-visibility] details-content:transition-discrete details-content:duration-200 details-content:ease-out open:details-content:h-auto motion-reduce:details-content:transition-none"
            >
              <summary
                class="text-foreground focus-visible:outline-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm py-2 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
              >
                <span>{t(locale, faqItem.question)}</span>
                <PlusIcon
                  class="text-muted-foreground size-4 shrink-0 transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p class={["pb-3 text-sm", guideCopy]}>
                {t(locale, faqItem.answer)}
              </p>
            </details>
          {/each}
        </div>
      </section>
    </div>

    <section
      class="guide-enter grid content-start gap-3 [animation-delay:80ms]"
      aria-labelledby="trainer-guide-overview"
    >
      <h3 id="trainer-guide-overview" class={guideSectionHeading}>
        {t(locale, "Overview")}
      </h3>
      {#each guideSeoContent.body as paragraph (paragraph)}
        <p class={guideCopy}>{t(locale, paragraph)}</p>
      {/each}
      <p class={guideCopy}>{t(locale, freeUseNote)}</p>
    </section>
  </div>
{/snippet}

{#snippet pageMeta(className: string)}
  <div
    class={[
      "text-muted-foreground flex-wrap items-center gap-x-4 gap-y-1 text-xs",
      className,
    ]}
  >
    <span>
      {t(locale, "Updated")}
      <time datetime={lastModified}>{formatDate(locale, lastModified)}</time>
    </span>
    <a
      href={siteMetadata.repositoryUrl}
      target="_blank"
      rel="noopener noreferrer"
      class={footerLink}>{t(locale, "Source")}<ArrowUpRight class="size-3" /></a
    >
    <a href={legalPageLinks.privacy.path} class={footerLink}
      >{t(locale, legalPageLinks.privacy.label)}</a
    >
    <a href={legalPageLinks.terms.path} class={footerLink}
      >{t(locale, legalPageLinks.terms.label)}</a
    >
  </div>
{/snippet}

<dialog
  {@attach closeOnBackdropClick}
  id="trainer-guide"
  class="bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10 m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100dvw-2rem),56rem)] max-w-[calc(100dvw-2rem)] flex-col overflow-hidden rounded-4xl text-sm shadow-xl ring-1 outline-hidden backdrop:animate-[guide-backdrop-enter_150ms_ease-out] backdrop:bg-black/30 backdrop:backdrop-blur-sm open:flex open:animate-[guide-dialog-enter_150ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:backdrop:animate-none motion-reduce:open:animate-none"
  aria-labelledby="trainer-guide-title"
  onclose={onClose}
>
  <!-- Floats over the scrolling body; the blur keeps passing text from looking clipped. -->
  <form method="dialog" class="absolute top-4 right-4 z-10 sm:top-5 sm:right-5">
    <Button
      type="submit"
      variant="secondary"
      size="icon"
      class="bg-secondary/80 size-11 backdrop-blur-md"
      aria-label={t(locale, "Close")}
    >
      <XIcon />
    </Button>
  </form>

  <div
    class="min-h-0 flex-1 scrollbar-thin [scrollbar-color:var(--border)_transparent] overflow-y-auto overscroll-contain"
  >
    {#if hasActiveRoute}
      {@render routeContent()}
    {:else}
      <TrainerGuideHomepageContent {locale} />
    {/if}
    <div class="px-6 pb-6 sm:hidden">
      {@render pageMeta("flex")}
    </div>
  </div>

  <footer
    class="border-border/60 flex shrink-0 items-center justify-between gap-3 border-t px-6 py-4 sm:px-8"
  >
    {@render pageMeta("hidden sm:flex")}
    <Button
      href="/guide/"
      size="lg"
      class="h-auto min-h-12 flex-1 gap-2 px-6 text-base whitespace-normal sm:flex-none"
    >
      <BookOpenIcon data-icon="inline-start" />
      {t(locale, "Read full guide")}
    </Button>
  </footer>
</dialog>

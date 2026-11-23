<script lang="ts">
  import { textLink } from "$lib/components/site/styles";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import XIcon from "@lucide/svelte/icons/x";

  import { closeOnBackdropClick, showModalWhen } from "../modal-dialog";
  import { getTrainer } from "../trainer-context";
  import DrillGuide from "./drill-guide.svelte";
  import HomeGuide from "./home-guide.svelte";

  const trainer = getTrainer();

  const footerLink = `${textLink} inline-flex min-h-6 items-center gap-1`;
  const showGuide = showModalWhen(() => trainer.guideOpen);
</script>

{#snippet pageMeta(className: string)}
  <div class={["flex-wrap items-center gap-x-4 gap-y-1 text-xs", className]}>
    <span>
      {t("Updated")}
      <time datetime={trainer.guideLastModified}>
        {formatDate(trainer.guideLastModified)}
      </time>
    </span>
    <a
      class={footerLink}
      href={siteMetadata.repositoryUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {t("Source")}<ArrowUpRightIcon class="size-3" />
    </a>
    <a class={footerLink} href={legalPageLinks.privacy.path}>
      {t(legalPageLinks.privacy.label)}
    </a>
    <a class={footerLink} href={legalPageLinks.terms.path}>
      {t(legalPageLinks.terms.label)}
    </a>
  </div>
{/snippet}

<dialog
  id="trainer-guide"
  class="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100dvw-2rem),56rem)] max-w-[calc(100dvw-2rem)] flex-col overflow-hidden open:flex"
  {@attach showGuide}
  {@attach closeOnBackdropClick}
  aria-labelledby="trainer-guide-title"
  onclose={() => (trainer.guideOpen = false)}
>
  (trainer.guideOpen = false)} >
  <!-- Floats over the scrolling body; the blur keeps passing text from looking clipped. -->
  <form class="absolute top-4 right-4 z-10 sm:top-5 sm:right-5" method="dialog">
    <button
      class="inline-flex size-11 items-center justify-center"
      aria-label={t("Close")}
      type="submit"
    >
      <XIcon aria-hidden="true" />
    </button>
  </form>

  <div class="min-h-0 flex-1 scrollbar-thin overflow-y-auto overscroll-contain">
    {#if trainer.guideRoute}
      <DrillGuide route={trainer.guideRoute} />
    {:else}
      <HomeGuide />
    {/if}
    <div class="px-6 pb-6 sm:hidden">
      {@render pageMeta("flex")}
    </div>
  </div>

  <footer
    class="flex shrink-0 items-center justify-between gap-3 border-t px-6 py-4 sm:px-8"
  >
    {@render pageMeta("hidden sm:flex")}
    <a class="inline-flex min-h-11 items-center gap-2" href="/guide/">
      <BookOpenIcon class="size-4" aria-hidden="true" />
      {t("Read full guide")}
    </a>
  </footer>
</dialog>

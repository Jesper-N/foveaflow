<script lang="ts">
  import { heroButton, textLink } from "$lib/components/site/styles";
  import { Button } from "$lib/components/ui/button";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Attachment } from "svelte/attachments";

  import { getTrainer } from "../trainer-context";
  import DrillGuide from "./drill-guide.svelte";
  import HomeGuide from "./home-guide.svelte";

  const trainer = getTrainer();

  const footerLink = cn(
    textLink,
    "text-caption inline-flex min-h-6 items-center gap-1"
  );

  // A native modal dialog: it traps focus, closes on Escape, and returns focus
  // to the button that opened it.
  const showWhenOpened: Attachment<HTMLDialogElement> = (dialog) => {
    if (trainer.guideOpen && !dialog.open) {
      dialog.showModal();
    }
  };

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

{#snippet pageMeta(className: string)}
  <div
    class={[
      "text-muted-foreground text-caption flex-wrap items-center gap-x-4 gap-y-1",
      className,
    ]}
  >
    <span>
      {t("Updated")}
      <time datetime={trainer.guideLastModified}>
        {formatDate(trainer.guideLastModified)}
      </time>
    </span>
    <a
      href={siteMetadata.repositoryUrl}
      target="_blank"
      rel="noopener noreferrer"
      class={footerLink}
    >
      {t("Source")}<ArrowUpRightIcon class="size-3" />
    </a>
    <a href={legalPageLinks.privacy.path} class={footerLink}>
      {t(legalPageLinks.privacy.label)}
    </a>
    <a href={legalPageLinks.terms.path} class={footerLink}>
      {t(legalPageLinks.terms.label)}
    </a>
  </div>
{/snippet}

<dialog
  {@attach showWhenOpened}
  {@attach closeOnBackdropClick}
  id="trainer-guide"
  class="bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10 m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100dvw-2rem),56rem)] max-w-[calc(100dvw-2rem)] flex-col overflow-hidden rounded-4xl shadow-xl ring-1 outline-hidden backdrop:animate-[guide-backdrop-enter_150ms_ease-out] backdrop:bg-black/30 backdrop:backdrop-blur-sm open:flex open:animate-[guide-dialog-enter_150ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:backdrop:animate-none motion-reduce:open:animate-none"
  aria-labelledby="trainer-guide-title"
  onclose={() => (trainer.guideOpen = false)}
>
  <!-- Floats over the scrolling body; the blur keeps passing text from looking clipped. -->
  <form method="dialog" class="absolute top-4 right-4 z-10 sm:top-5 sm:right-5">
    <Button
      type="submit"
      variant="secondary"
      size="icon"
      class="bg-secondary/80 size-11 backdrop-blur-md"
      aria-label={t("Close")}
    >
      <XIcon />
    </Button>
  </form>

  <div
    class="min-h-0 flex-1 scrollbar-thin [scrollbar-color:var(--border)_transparent] overflow-y-auto overscroll-contain"
  >
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
    class="border-border/60 flex shrink-0 items-center justify-between gap-3 border-t px-6 py-4 sm:px-8"
  >
    {@render pageMeta("hidden sm:flex")}
    <Button
      href="/guide/"
      size="lg"
      class={[heroButton, "flex-1 sm:flex-none"]}
    >
      {t("Read full guide")}
      <ArrowUpRightIcon data-icon="inline-end" />
    </Button>
  </footer>
</dialog>

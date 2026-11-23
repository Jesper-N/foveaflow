<script lang="ts">
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";
  import { ArrowRightIcon, XIcon } from "@lucide/svelte";
  import {
    Dialog,
    DialogBackdrop,
    DialogClose,
    DialogContent,
  } from "@ui-sdk/svelte/dialog";

  import { buttonClass } from "../../ui/button-variants";
  import { backdrop, dialogSurface, sheetPresentation } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";
  import DrillGuide from "./drill-guide.svelte";
  import HomeGuide from "./home-guide.svelte";

  const trainer = getTrainer();

  const footerLink =
    "rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-160 ease-out hover:bg-fill hover:text-foreground";
</script>

<Dialog presentation="auto" bind:open={trainer.guideOpen}>
  <DialogBackdrop class={backdrop} />
  <DialogContent
    id="trainer-guide"
    class={[
      dialogSurface,
      sheetPresentation,
      "data-[presentation=dialog]:fixed data-[presentation=dialog]:inset-0 data-[presentation=dialog]:m-auto data-[presentation=dialog]:h-[min(46rem,calc(100dvh-2rem))] data-[presentation=dialog]:w-232 data-[presentation=dialog]:max-w-[calc(100vw-2rem)] data-[presentation=dialog]:rounded-4xl",
      "data-[presentation=dialog]:transition-[opacity,scale,translate] data-[presentation=dialog]:duration-300 data-[presentation=dialog]:ease-out data-[presentation=dialog]:data-ending-style:translate-y-2 data-[presentation=dialog]:data-ending-style:scale-97 data-[presentation=dialog]:data-ending-style:opacity-0 data-[presentation=dialog]:data-ending-style:duration-180 data-[presentation=dialog]:data-starting-style:translate-y-3 data-[presentation=dialog]:data-starting-style:scale-97 data-[presentation=dialog]:data-starting-style:opacity-0",
    ]}
    finalFocus={trainer.panelReturnFocus}
  >
    <DialogClose
      class={[
        buttonClass("secondary", "icon"),
        "bg-popover shadow-thumb hover:bg-popover absolute inset-e-4 top-4 z-2",
      ]}
      aria-label={t("Close")}
    >
      <XIcon aria-hidden="true" />
    </DialogClose>

    <div class="min-h-0 flex-1">
      {#if trainer.guideRoute}
        <DrillGuide route={trainer.guideRoute} />
      {:else}
        <HomeGuide />
      {/if}
    </div>

    <footer
      class="border-border flex flex-wrap items-center gap-x-1 gap-y-2 border-t px-4 py-3 max-sm:pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5"
    >
      <p class="text-muted-foreground px-2.5 text-sm">
        {t("Updated")}
        <time datetime={trainer.guideLastModified}>
          {formatDate(trainer.guideLastModified)}
        </time>
      </p>
      <nav class="me-auto flex items-center" aria-label={t("Legal pages")}>
        <a
          class={footerLink}
          href={siteMetadata.repositoryUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("Source")}
        </a>
        <a class={footerLink} href={legalPageLinks.privacy.path}>
          {t(legalPageLinks.privacy.label)}
        </a>
        <a class={footerLink} href={legalPageLinks.terms.path}>
          {t(legalPageLinks.terms.label)}
        </a>
      </nav>
      <a
        class={[
          buttonClass("primary", "lg"),
          "group/cta max-sm:order-first max-sm:w-full",
        ]}
        href="/guide/"
      >
        {t("Read full guide")}
        <ArrowRightIcon
          class="ease-spring transition-transform duration-260 group-hover/cta:translate-x-0.5 rtl:-scale-x-100"
          aria-hidden="true"
        />
      </a>
    </footer>
  </DialogContent>
</Dialog>

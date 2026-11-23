<script lang="ts">
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";
  import { XIcon } from "@lucide/svelte";
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
    "rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors duration-160 ease-out hover:text-foreground";
</script>

<Dialog presentation="auto" bind:open={trainer.guideOpen}>
  <DialogBackdrop class={backdrop} />
  <DialogContent
    id="trainer-guide"
    class={[
      dialogSurface,
      sheetPresentation,
      "data-[presentation=dialog]:fixed data-[presentation=dialog]:inset-0 data-[presentation=dialog]:m-auto data-[presentation=dialog]:h-fit data-[presentation=dialog]:max-h-[calc(100dvh-2rem)] data-[presentation=dialog]:w-160 data-[presentation=dialog]:max-w-[calc(100vw-2rem)] data-[presentation=dialog]:rounded-4xl",
      "data-[presentation=dialog]:transition-[opacity,scale] data-[presentation=dialog]:duration-260 data-[presentation=dialog]:ease-out data-[presentation=dialog]:data-ending-style:scale-96 data-[presentation=dialog]:data-ending-style:opacity-0 data-[presentation=dialog]:data-ending-style:duration-180 data-[presentation=dialog]:data-starting-style:scale-96 data-[presentation=dialog]:data-starting-style:opacity-0",
    ]}
    finalFocus={trainer.panelReturnFocus}
  >
    <DialogClose
      class={[buttonClass("secondary", "icon"), "absolute inset-e-4 top-4 z-1"]}
      aria-label={t("Close")}
    >
      <XIcon aria-hidden="true" />
    </DialogClose>

    <div
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-8 pb-6 sm:px-8"
    >
      {#if trainer.guideRoute}
        <DrillGuide route={trainer.guideRoute} />
      {:else}
        <HomeGuide />
      {/if}
    </div>

    <footer
      class="bg-fill flex flex-wrap items-center gap-x-1 gap-y-2 px-4 py-3 sm:px-6"
    >
      <p class="text-muted-foreground me-auto px-2 text-sm">
        {t("Updated")}
        <time datetime={trainer.guideLastModified}>
          {formatDate(trainer.guideLastModified)}
        </time>
      </p>
      <a class={buttonClass("primary", "sm")} href="/guide/">
        {t("Read full guide")}
      </a>
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
    </footer>
  </DialogContent>
</Dialog>

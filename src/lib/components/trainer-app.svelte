<script lang="ts">
  import { createTrainerAppController } from "$lib/components/trainer/trainer-app-controller.svelte";
  import TrainerControlsDialog from "$lib/components/trainer/trainer-controls-dialog.svelte";
  import TrainerGuidePopover from "$lib/components/trainer/trainer-guide-popover.svelte";
  import TrainerHud from "$lib/components/trainer/trainer-hud.svelte";
  import { t } from "$lib/i18n/translate";
  import { ModeWatcher } from "mode-watcher";

  let { routeSlug = "" }: { routeSlug?: string } = $props();
  const controller = createTrainerAppController(() => routeSlug);
</script>

<ModeWatcher track={false} defaultMode="system" />
<svelte:window
  onkeydown={controller.handleWindowKeydown}
  onpagehide={controller.flushSettings}
  onpointermove={controller.handleWindowPointerMove}
  onpopstate={controller.handlePopState}
/>
<svelte:document onvisibilitychange={controller.handleVisibilityChange} />

<h1 class="sr-only">
  {t(controller.locale, controller.pageSeoContent.heading)}
</h1>
<main
  {@attach controller.attachTrainer}
  class="trainer-stage bg-background text-foreground relative h-dvh w-dvw overflow-hidden"
  data-cursor-hidden={controller.cursorHidden}
  aria-label={t(controller.locale, "FoveaFlow eye trainer app")}
>
  <p id="trainer-canvas-description" class="sr-only">
    {t(
      controller.locale,
      "FoveaFlow eye trainer animation for visual tracking practice. Use Pause motion to stop target movement before changing controls."
    )}
  </p>
  <p id="trainer-motion-status" class="sr-only" aria-live="polite">
    {t(controller.locale, "Motion")}
    {controller.motionPaused
      ? t(controller.locale, "paused")
      : t(controller.locale, "playing")}.
    {t(controller.locale, "Direction")}
    {controller.motionDirectionLabel}.
  </p>

  <canvas
    {@attach controller.attachCanvasOnce}
    class="bg-background absolute inset-0 h-full w-full touch-none"
    aria-label={t(
      controller.locale,
      "FoveaFlow eye trainer animation for visual tracking practice"
    )}
    aria-describedby="trainer-canvas-description trainer-motion-status"
  ></canvas>

  {#if controller.localeReady}
    <TrainerHud
      attachHudShell={controller.attachHudShell}
      hudHidden={controller.hudHidden}
      hudContentWidth={controller.hudContentWidth}
      attachHudContentSizer={controller.attachHudContentSizer}
      settings={controller.settings}
      isLilacChaserMode={controller.isLilacChaserMode}
      motionPaused={controller.motionPaused}
      motionDirectionToggleLabel={controller.motionDirectionToggleLabel}
      canToggleDirection={controller.canToggleDirection}
      bind:mobilePresetSelectOpen={controller.mobilePresetSelectOpen}
      bind:mobilePatternSelectOpen={controller.mobilePatternSelectOpen}
      bind:mobileLilacChaserColorSelectOpen={
        controller.mobileLilacChaserColorSelectOpen
      }
      bind:desktopPresetSelectOpen={controller.desktopPresetSelectOpen}
      bind:desktopPatternSelectOpen={controller.desktopPatternSelectOpen}
      bind:desktopLilacChaserColorSelectOpen={
        controller.desktopLilacChaserColorSelectOpen
      }
      bind:languageSelectOpen={controller.languageSelectOpen}
      guideButtonLabel={controller.activeRoute
        ? `${t(controller.locale, "Open")} ${t(controller.locale, controller.guideSeoContent.heading)} ${t(controller.locale, "guide")}`
        : t(controller.locale, "About FoveaFlow eye trainer")}
      guideButtonTitle={controller.activeRoute
        ? t(controller.locale, "Open guide")
        : t(controller.locale, "About FoveaFlow")}
      patternSelectContentClass={controller.patternSelectContentClass}
      actions={controller.hudActions}
    />
  {/if}

  <TrainerGuidePopover
    activeTrainingModeGuide={controller.activeTrainingModeGuide}
    guideSeoContent={controller.guideSeoContent}
    guideUseCases={controller.guideUseCases}
    hasActiveRoute={Boolean(controller.activeRoute)}
    openGuideFaqQuestion={controller.openGuideFaqQuestion}
    onGuidePopoverToggle={controller.handleGuidePopoverToggle}
    toggleGuideFaq={controller.toggleGuideFaq}
  />

  <TrainerControlsDialog
    bind:open={controller.panelOpen}
    bind:settings={controller.settings}
    availableControlSections={controller.localizedControlSections}
    currentControlSection={controller.currentControlSection}
    currentControlSectionLabel={controller.currentControlSectionLabel}
    motionPaused={controller.motionPaused}
    motionDirectionLabel={controller.motionDirectionLabel}
    canToggleDirection={controller.canToggleDirection}
    colorMode={controller.colorMode}
    isDarkMode={controller.isDarkMode}
    isMotMode={controller.isMotMode}
    isLilacChaserMode={controller.isLilacChaserMode}
    behaviorValue={controller.behaviorValue}
    patternSelectContentClass={controller.patternSelectContentClass}
    actions={controller.dialogActions}
  />
</main>

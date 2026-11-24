<script lang="ts">
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { useShortcut } from "@ui-sdk/svelte/shortcuts";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, untrack } from "svelte";

  import ControlsDialog from "./controls/controls-dialog.svelte";
  import GuideDialog from "./guide/guide-dialog.svelte";
  import TrainerIsland from "./island/trainer-island.svelte";
  import { isKeyCapturedBy, trainerShortcuts } from "./shortcuts";
  import { setTrainer } from "./trainer-context";
  import { Trainer } from "./trainer.svelte";

  let { routeSlug = "" }: { routeSlug?: string } = $props();

  // The route only seeds the first render. After that the trainer follows the URL.
  const trainer = setTrainer(new Trainer(untrack(() => routeSlug)));

  onMount(() => trainer.mount());

  for (const { action, keys, ...options } of trainerShortcuts) {
    useShortcut(
      keys,
      () => {
        trainer.runShortcut(action);
      },
      {
        ...options,
        when: () => !isKeyCapturedBy(document.activeElement, keys),
      }
    );
  }
</script>

<ModeWatcher
  defaultMode="system"
  themeColors={{ dark: "#171717", light: "#f1f1f0" }}
  track={false}
/>
<svelte:window
  onpagehide={trainer.flushSettings}
  onpointermove={trainer.handlePointerMove}
  onpopstate={trainer.handlePopState}
/>
<svelte:document onvisibilitychange={trainer.handleVisibilityChange} />

<main
  class="trainer-stage group/stage bg-canvas stage-dots relative h-dvh overflow-hidden overscroll-none data-[cursor-hidden=true]:cursor-none data-[cursor-hidden=true]:**:cursor-none"
  aria-label={t("FoveaFlow eye trainer app")}
  data-cursor-hidden={trainer.cursor.hidden}
>
  <h1 class="sr-only">{t(trainer.pageCopy.heading)}</h1>
  <p id="trainer-motion-status" class="sr-only" aria-live="polite">
    {t("Motion")}
    {trainer.motionPaused ? t("paused") : t("playing")}.
    {t("Direction")}
    {trainer.settings.motionDirection === 1 ? t("forward") : t("reverse")}.
  </p>

  <canvas
    class="absolute inset-0 size-full touch-none"
    {@attach trainer.attachCanvas}
    aria-describedby="trainer-motion-status"
    aria-label={t(
      "FoveaFlow eye trainer animation for visual tracking practice"
    )}
  ></canvas>

  {#if languageState.ready}
    <TrainerIsland />
  {/if}
  <GuideDialog />
  <ControlsDialog />
</main>

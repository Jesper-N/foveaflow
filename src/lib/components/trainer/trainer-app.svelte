<script lang="ts">
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, untrack } from "svelte";

  import ControlsDialog from "./controls/controls-dialog.svelte";
  import GuideDialog from "./guide/guide-dialog.svelte";
  import TrainerHud from "./hud/trainer-hud.svelte";
  import { setTrainer } from "./trainer-context";
  import { Trainer } from "./trainer.svelte";

  let { routeSlug = "" }: { routeSlug?: string } = $props();

  // The route only seeds the first render. After that the trainer follows the URL.
  const trainer = setTrainer(new Trainer(untrack(() => routeSlug)));
  onMount(() => trainer.mount());
</script>

<ModeWatcher track={false} defaultMode="system" />
<svelte:window
  onkeydown={trainer.handleKeydown}
  onpagehide={trainer.flushSettings}
  onpointermove={trainer.handlePointerMove}
  onpopstate={trainer.handlePopState}
/>
<svelte:document onvisibilitychange={trainer.handleVisibilityChange} />

<main
  class="trainer-stage bg-background text-foreground relative h-dvh w-dvw overflow-hidden overscroll-none data-[cursor-hidden=true]:cursor-none data-[cursor-hidden=true]:**:cursor-none"
  data-cursor-hidden={trainer.cursor.hidden}
  aria-label={t("FoveaFlow eye trainer app")}
>
  <h1 class="sr-only">{t(trainer.pageCopy.heading)}</h1>
  <p id="trainer-canvas-description" class="sr-only">
    {t(
      "FoveaFlow eye trainer animation for visual tracking practice. Use Pause motion to stop target movement before changing controls."
    )}
  </p>
  <p id="trainer-motion-status" class="sr-only" aria-live="polite">
    {t("Motion")}
    {trainer.motionPaused ? t("paused") : t("playing")}.
    {t("Direction")}
    {trainer.settings.motionDirection === 1 ? t("forward") : t("reverse")}.
  </p>

  <canvas
    {@attach trainer.attachCanvas}
    class="bg-background absolute inset-0 block h-full w-full touch-none"
    aria-label={t(
      "FoveaFlow eye trainer animation for visual tracking practice"
    )}
    aria-describedby="trainer-canvas-description trainer-motion-status"
  ></canvas>

  <!-- The island waits for translations so its labels never flash in English. -->
  {#if languageState.ready}
    <TrainerHud />
  {/if}
  <GuideDialog />
  <ControlsDialog />
</main>

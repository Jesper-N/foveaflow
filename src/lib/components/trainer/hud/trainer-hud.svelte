<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import {
    ArrowLeftRightIcon,
    BookOpenIcon,
    PauseIcon,
    PlayIcon,
    SlidersHorizontalIcon,
  } from "@lucide/svelte";

  import BrandMark from "../../ui/brand-mark.svelte";
  import IconButton from "../../ui/icon-button.svelte";
  import { pressable } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";
  import HudDrillSelects from "./hud-drill-selects.svelte";
  import HudQuickAdjustments from "./hud-quick-adjustments.svelte";

  const trainer = getTrainer();

  const fadeWhenIdle =
    "pointer-events-auto transition-opacity duration-160 ease-out pointer-fine:group-data-[hud-idle=true]/stage:opacity-0 pointer-fine:group-data-[hud-idle=true]/stage:duration-700 has-focus-visible:opacity-100";
</script>

<div
  id="trainer-controls"
  class="pointer-events-none absolute inset-0 flex flex-col justify-between gap-3 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-4"
  data-nosnippet
>
  <header class={["flex items-start justify-between gap-2", fadeWhenIdle]}>
    <a
      class={[
        "bg-popover text-md shadow-popover flex h-11 items-center gap-2.5 rounded-full ps-1.5 pe-4 font-medium",
        pressable,
      ]}
      href="/"
    >
      <BrandMark class="size-8 rounded-full" />
      {siteMetadata.name}
    </a>

    <nav
      class="bg-popover shadow-popover flex items-center gap-0.5 rounded-full p-1"
      aria-label={t("App actions")}
    >
      <LanguageSelect compact />
      <IconButton
        aria-controls="trainer-guide"
        label={trainer.route ? t("Open guide") : t("About FoveaFlow")}
        onclick={trainer.openGuide}
        shortcut="g"
        side="bottom"
      >
        <BookOpenIcon aria-hidden="true" />
      </IconButton>
      <IconButton
        label={t("Open controls")}
        onclick={trainer.openControls}
        shortcut="s"
        side="bottom"
      >
        <SlidersHorizontalIcon aria-hidden="true" />
      </IconButton>
    </nav>
  </header>

  <section
    class={[
      "bg-popover shadow-popover motion-safe:animate-rise mx-auto grid w-full max-w-xl gap-x-6 gap-y-3 rounded-4xl p-2 lg:flex lg:w-auto lg:max-w-none lg:items-center lg:p-2 lg:pe-6",
      fadeWhenIdle,
    ]}
    aria-label={t("Drill")}
  >
    <div class="flex min-w-0 items-center gap-1.5">
      <IconButton
        class="size-11"
        aria-describedby="trainer-motion-status"
        label={trainer.motionPaused ? t("Resume motion") : t("Pause motion")}
        onclick={trainer.togglePaused}
        shortcut="space"
        variant="primary"
      >
        {#if trainer.motionPaused}
          <PlayIcon class="fill-current" aria-hidden="true" />
        {:else}
          <PauseIcon class="fill-current" aria-hidden="true" />
        {/if}
      </IconButton>
      {#if trainer.canReverse}
        <IconButton
          class={trainer.settings.motionDirection === -1
            ? "bg-fill text-foreground"
            : undefined}
          aria-describedby="trainer-motion-status"
          label={trainer.settings.motionDirection === 1
            ? t("Reverse motion direction")
            : t("Use forward motion direction")}
          onclick={trainer.toggleDirection}
        >
          <ArrowLeftRightIcon aria-hidden="true" />
        </IconButton>
      {/if}
      <HudDrillSelects />
    </div>
    <div
      class={[
        "grid gap-x-6 gap-y-2 px-3 pb-1 lg:w-96 lg:px-0 lg:pb-0",
        trainer.isLilacChaser ? "sm:grid-cols-2" : "grid-cols-2",
      ]}
    >
      <HudQuickAdjustments />
    </div>
  </section>
</div>

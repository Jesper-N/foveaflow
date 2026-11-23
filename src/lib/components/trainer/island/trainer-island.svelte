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
  import { Button } from "@ui-sdk/svelte/button";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";

  import BrandMark from "../../ui/brand-mark.svelte";
  import IconButton from "../../ui/icon-button.svelte";
  import { pressable } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";
  import IslandAdjustments from "./island-adjustments.svelte";
  import IslandSelects from "./island-selects.svelte";

  const HOVER_INTENT_MS = 80;
  const COLLAPSE_DELAY_MS = 320;

  const POPUP_SELECTOR =
    "[data-slot='select-content'], [data-slot='popover-content'], [data-slot='tooltip-content']";

  const trainer = getTrainer();

  let island: HTMLElement | undefined;
  let expandTimer: number | undefined;
  let collapseTimer: number | undefined;
  let openedByKeyboard = false;
  let lastPointerType = "mouse";

  let expanded = $derived(trainer.islandExpanded);

  const isBusy = () =>
    island !== undefined &&
    (island.querySelector("[data-open]") !== null ||
      island.matches(":has(:focus-visible)"));

  const expand = () => {
    window.clearTimeout(collapseTimer);
    trainer.islandExpanded = true;
  };

  const collapse = () => {
    window.clearTimeout(expandTimer);
    window.clearTimeout(collapseTimer);
    trainer.islandExpanded = false;
  };

  const scheduleCollapse = () => {
    window.clearTimeout(expandTimer);
    window.clearTimeout(collapseTimer);
    collapseTimer = window.setTimeout(() => {
      if (!isBusy() && island?.matches(":hover") !== true) {
        trainer.islandExpanded = false;
      }
    }, COLLAPSE_DELAY_MS);
  };

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      return;
    }

    window.clearTimeout(collapseTimer);
    expandTimer = window.setTimeout(expand, HOVER_INTENT_MS);
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && lastPointerType !== "touch") {
      scheduleCollapse();
    }
  };

  const handleFocusIn = (event: FocusEvent) => {
    if (
      event.target instanceof Element &&
      event.target.matches(":focus-visible")
    ) {
      openedByKeyboard = true;
      expand();
    }
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (
      openedByKeyboard &&
      event.relatedTarget instanceof Element &&
      island?.contains(event.relatedTarget) !== true
    ) {
      openedByKeyboard = false;
      scheduleCollapse();
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && expanded && !isBusy()) {
      collapse();
    }
  };

  const islandEvents: Attachment<HTMLElement> = (node) => {
    island = node;

    const stops = [
      on(node, "focusin", handleFocusIn),
      on(node, "focusout", handleFocusOut),
      on(node, "keydown", handleKeydown),
      on(node, "pointerenter", handlePointerEnter),
      on(node, "pointerleave", handlePointerLeave),
    ];

    return () => {
      for (const stop of stops) {
        stop();
      }

      window.clearTimeout(expandTimer);
      window.clearTimeout(collapseTimer);
    };
  };

  const handleDocumentPointerDown = (event: PointerEvent) => {
    lastPointerType = event.pointerType;

    if (
      expanded &&
      event.target instanceof Element &&
      island?.contains(event.target) !== true &&
      event.target.closest(POPUP_SELECTOR) === null
    ) {
      openedByKeyboard = false;
      collapse();
    }
  };
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />

<div
  id="trainer-controls"
  class="island-shadow pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-3"
  data-idle={trainer.cursor.hidden && !trainer.motionPaused && !expanded}
  data-nosnippet
>
  <section
    class="island dark text-foreground pointer-events-auto relative w-full max-w-172 bg-black"
    {@attach islandEvents}
    aria-label={t("Trainer controls")}
    data-expanded={expanded}
  >
    <Button
      class="island-compact absolute top-0 left-1/2 z-1 h-(--compact-height) w-(--compact-width) -translate-x-1/2 cursor-pointer rounded-full outline-none"
      aria-expanded={expanded}
      aria-label={t("Trainer controls")}
      onclick={expand}
      tabindex={-1}
    ></Button>

    <div class="island-panel grid gap-2 p-2">
      <header class="flex items-center gap-1 ps-1.5">
        <a
          class={[
            "text-md me-auto flex h-9 items-center gap-2.5 rounded-full pe-3 font-medium",
            pressable,
          ]}
          href="/"
        >
          <BrandMark class="size-7" />
          {siteMetadata.name}
        </a>
        <nav class="flex items-center gap-0.5" aria-label={t("App actions")}>
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

      <div class="bg-fill grid gap-x-6 gap-y-2 rounded-3xl p-2">
        <div
          class="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-1.5 sm:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)]"
        >
          <IconButton
            class="size-11"
            aria-describedby="trainer-motion-status"
            label={trainer.motionPaused
              ? t("Resume motion")
              : t("Pause motion")}
            onclick={trainer.togglePaused}
            shortcut="space"
            variant="primary"
          >
            {#if trainer.motionPaused}
              <PlayIcon
                class="translate-x-px fill-current"
                aria-hidden="true"
              />
            {:else}
              <PauseIcon class="fill-current" aria-hidden="true" />
            {/if}
          </IconButton>
          {#if trainer.canReverse}
            <IconButton
              class={trainer.settings.motionDirection === -1
                ? "bg-fill-hover text-foreground"
                : undefined}
              aria-describedby="trainer-motion-status"
              label={trainer.settings.motionDirection === 1
                ? t("Reverse motion direction")
                : t("Use forward motion direction")}
              onclick={trainer.toggleDirection}
            >
              <ArrowLeftRightIcon aria-hidden="true" />
            </IconButton>
          {:else}
            <span></span>
          {/if}
          <IslandSelects />
        </div>
        <div
          class={[
            "grid gap-x-6 px-2.5 pb-1",
            trainer.isLilacChaser ? "sm:grid-cols-2" : "grid-cols-2",
          ]}
        >
          <IslandAdjustments />
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .island-shadow {
    filter: drop-shadow(0 10px 24px rgb(0 0 0 / 0.22))
      drop-shadow(0 0 0.5px rgb(255 255 255 / 0.28));
  }

  .island-shadow {
    transition: opacity 160ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .island-shadow[data-idle="true"] {
      opacity: 0;
      transition-duration: 700ms;
    }
  }

  .island {
    --compact-width: 7.5rem;
    --compact-height: 2.25rem;
    --compact-inset: calc(50% - var(--compact-width) / 2);

    clip-path: inset(
      0 var(--compact-inset) calc(100% - var(--compact-height))
        var(--compact-inset) round calc(var(--compact-height) / 2)
    );
    transition: clip-path 420ms var(--ease-spring-settle);
  }

  .island[data-expanded="true"] {
    clip-path: inset(0 0 0 0 round 1.75rem);
    transition-duration: 620ms;
    transition-timing-function: var(--ease-spring-soft);
  }

  @media (pointer: coarse) {
    .island {
      --compact-width: 8.5rem;
      --compact-height: 2.75rem;
    }
  }

  .island[data-expanded="true"] :global(.island-compact) {
    pointer-events: none;
  }

  .island-panel {
    opacity: 0;
    filter: blur(6px);
    scale: 0.97;
    translate: 0 -6px;
    transform-origin: top center;
    pointer-events: none;
    transition:
      opacity 140ms var(--ease-out),
      filter 140ms var(--ease-out),
      scale 140ms var(--ease-out),
      translate 140ms var(--ease-out);
  }

  .island[data-expanded="true"] .island-panel {
    opacity: 1;
    filter: blur(0);
    scale: 1;
    translate: 0 0;
    pointer-events: auto;
    transition-duration: 320ms;
    transition-delay: 70ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .island,
    .island[data-expanded="true"] {
      transition: none;
    }

    .island-panel,
    .island[data-expanded="true"] .island-panel {
      filter: none;
      scale: 1;
      translate: 0 0;
      transition: opacity 160ms var(--ease-out);
    }
  }
</style>

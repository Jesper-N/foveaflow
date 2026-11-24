<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
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

  import IconButton from "../../ui/icon-button.svelte";
  import { smoothResize } from "../../ui/smooth-resize";
  import TooltipGroup from "../../ui/tooltip-group.svelte";
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
    class="island bg-popover text-foreground pointer-events-auto relative w-full max-w-120"
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

    <div class="island-panel" {@attach smoothResize()}>
      <div class="grid gap-3 p-3">
        <div
          class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <IslandSelects />
          <TooltipGroup
            class="flex items-center gap-1 justify-self-end max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1"
            side="bottom"
          >
            {#if trainer.canReverse}
              <IconButton
                class={trainer.settings.motionDirection === -1
                  ? "bg-fill-hover text-foreground"
                  : undefined}
                aria-describedby="trainer-motion-status"
                grouped
                label={trainer.settings.motionDirection === 1
                  ? t("Reverse motion direction")
                  : t("Use forward motion direction")}
                onclick={trainer.toggleDirection}
              >
                <ArrowLeftRightIcon aria-hidden="true" />
              </IconButton>
            {/if}
            <IconButton
              class="size-11 rounded-full"
              aria-describedby="trainer-motion-status"
              grouped
              label={trainer.motionPaused
                ? t("Resume motion")
                : t("Pause motion")}
              onclick={trainer.togglePaused}
              shortcut="space"
              variant="accent"
            >
              {#if trainer.motionPaused}
                <PlayIcon
                  class="translate-x-px fill-current stroke-0"
                  aria-hidden="true"
                />
              {:else}
                <PauseIcon class="fill-current stroke-0" aria-hidden="true" />
              {/if}
            </IconButton>
          </TooltipGroup>
        </div>

        <div
          class={[
            "bg-fill grid gap-x-6 gap-y-1 rounded-2xl px-4 py-2",
            !trainer.isLilacChaser && "grid-cols-2",
          ]}
        >
          <IslandAdjustments />
        </div>

        <nav aria-label={t("App actions")}>
          <TooltipGroup
            class="flex items-center justify-between gap-1"
            offset={20}
            side="bottom"
          >
            <LanguageSelect compact tip />
            <span class="flex items-center gap-0.5">
              <IconButton
                aria-controls="trainer-guide"
                grouped
                label={trainer.route ? t("Open guide") : t("About FoveaFlow")}
                onclick={trainer.openGuide}
                shortcut="g"
              >
                <BookOpenIcon aria-hidden="true" />
              </IconButton>
              <IconButton
                grouped
                label={t("Open controls")}
                onclick={trainer.openControls}
                shortcut="s"
              >
                <SlidersHorizontalIcon aria-hidden="true" />
              </IconButton>
            </span>
          </TooltipGroup>
        </nav>
      </div>
    </div>
  </section>
</div>

<style>
  .island-shadow {
    filter: drop-shadow(0 0 0.5px rgb(0 0 0 / 0.2))
      drop-shadow(0 1px 2px rgb(0 0 0 / 0.06));
    transition: opacity 160ms var(--ease-out);
  }

  .island-shadow:has(:global(.island[data-expanded="true"])) {
    filter: drop-shadow(0 0 0.5px rgb(0 0 0 / 0.16))
      drop-shadow(0 8px 20px rgb(0 0 0 / 0.08));
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
    transition: clip-path 340ms var(--ease-drawer) 60ms;
  }

  .island[data-expanded="true"] {
    clip-path: inset(0 0 0 0 round 1.5rem);
    transition-duration: 480ms;
    transition-delay: 0ms;
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
    overflow: clip;
    opacity: 0;
    filter: blur(4px);
    translate: 0 -4px;
    pointer-events: none;
    transition:
      opacity 120ms var(--ease-out),
      filter 120ms var(--ease-out),
      translate 120ms var(--ease-out);
  }

  .island[data-expanded="true"] .island-panel {
    opacity: 1;
    filter: blur(0);
    translate: 0 0;
    pointer-events: auto;
    transition-duration: 280ms;
    transition-delay: 90ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .island,
    .island[data-expanded="true"] {
      transition: none;
    }

    .island-panel,
    .island[data-expanded="true"] .island-panel {
      filter: none;
      translate: 0 0;
      transition: opacity 160ms var(--ease-out);
    }
  }
</style>

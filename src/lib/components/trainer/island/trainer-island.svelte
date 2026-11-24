<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { getDrillGuide } from "$lib/content/drill-guides";
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

  import DrillPreview from "../../icons/drill-preview.svelte";
  import IconButton from "../../ui/icon-button.svelte";
  import TooltipGroup from "../../ui/tooltip-group.svelte";
  import { getTrainer } from "../trainer-context";
  import IslandAdjustments from "./island-adjustments.svelte";
  import IslandDrillTabs from "./island-drill-tabs.svelte";
  import IslandSelects from "./island-selects.svelte";

  const HOVER_INTENT_MS = 30;
  const COLLAPSE_DELAY_MS = 220;

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

  const measurePanel: Attachment<HTMLElement> = (panel) => {
    const notch = panel.closest<HTMLElement>(".notch");

    const observer = new ResizeObserver(() => {
      notch?.style.setProperty("--open-height", `${panel.offsetHeight}px`);
    });

    observer.observe(panel);

    return () => {
      observer.disconnect();
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
  class="notch-shadow pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
  data-idle={trainer.cursor.hidden && !trainer.motionPaused && !expanded}
  data-nosnippet
>
  <section
    class="notch island bg-popover text-foreground pointer-events-auto relative"
    {@attach islandEvents}
    aria-label={t("Trainer controls")}
    data-expanded={expanded}
  >
    <Button
      class="absolute inset-0 z-1 cursor-pointer rounded-[inherit] outline-none"
      aria-expanded={expanded}
      aria-label={t("Trainer controls")}
      onclick={expand}
      tabindex={-1}
    ></Button>

    <div class="notch-clip absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        class="notch-panel absolute top-0 left-1/2 -ml-[calc(var(--open-width)/2)] grid w-(--open-width) gap-4 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-4 sm:px-5 sm:pb-5"
        {@attach measurePanel}
      >
        <div class="flex items-center justify-between gap-3">
          <IslandDrillTabs />
          <nav aria-label={t("App actions")}>
            <TooltipGroup
              class="flex items-center gap-0.5"
              clearOf=".notch"
              offset={10}
              side="bottom"
            >
              <LanguageSelect compact tip />
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
            </TooltipGroup>
          </nav>
        </div>

        <div
          class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
        >
          <DrillPreview
            class="h-24 w-32 shrink-0 rounded-2xl max-sm:hidden"
            drillId={trainer.settings.drillId}
            patternId={trainer.settings.patternId}
            playing={false}
          />
          <div class="grid min-w-0 gap-3">
            {#if trainer.isPursuit}
              <IslandSelects />
            {:else}
              <p class="text-muted-foreground text-sm text-pretty">
                {t(getDrillGuide(trainer.settings.drillId).summary)}
              </p>
            {/if}
            <div
              class={[
                "grid gap-x-5 gap-y-1",
                !trainer.isLilacChaser && "grid-cols-2",
              ]}
            >
              <IslandAdjustments />
            </div>
          </div>
          <TooltipGroup
            class="flex flex-col items-center gap-1"
            clearOf=".notch"
            offset={10}
            side="bottom"
          >
            <IconButton
              class="size-12 rounded-full [&_svg]:size-5"
              aria-describedby="trainer-motion-status"
              grouped
              label={trainer.motionPaused
                ? t("Resume motion")
                : t("Pause motion")}
              onclick={trainer.togglePaused}
              shortcut="space"
              variant="primary"
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
          </TooltipGroup>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .notch-shadow {
    filter: drop-shadow(0 0 0.5px rgb(0 0 0 / 0.22))
      drop-shadow(0 1px 2px rgb(0 0 0 / 0.06));
    transition: opacity 160ms var(--ease-out);
  }

  .notch-shadow:has(:global(.notch[data-expanded="true"])) {
    filter: drop-shadow(0 0 0.5px rgb(0 0 0 / 0.16))
      drop-shadow(0 12px 28px rgb(0 0 0 / 0.12));
  }

  @media (hover: hover) and (pointer: fine) {
    .notch-shadow[data-idle="true"] {
      opacity: 0;
      transition-duration: 700ms;
    }
  }

  .notch {
    --ear: 0.625rem;
    --radius: 0.75rem;
    --open-width: min(36rem, calc(100vw - 1rem - 2 * var(--ear)));

    width: 9.5rem;
    height: calc(1.75rem + env(safe-area-inset-top));
    border-radius: 0 0 var(--radius) var(--radius);
    transition:
      width 220ms var(--ease-out) 40ms,
      height 220ms var(--ease-out) 40ms,
      border-radius 220ms var(--ease-out) 40ms;
  }

  .notch[data-expanded="true"] {
    --radius: 1.75rem;

    width: var(--open-width);
    height: var(--open-height, 12rem);
    transition:
      width 380ms var(--ease-spring-soft),
      height 420ms var(--ease-spring-soft),
      border-radius 380ms var(--ease-spring-soft);
  }

  @media (pointer: coarse) {
    .notch:not([data-expanded="true"]) {
      width: 10.5rem;
      height: calc(2rem + env(safe-area-inset-top));
    }
  }

  .notch::before,
  .notch::after {
    content: "";
    position: absolute;
    top: 0;
    width: var(--ear);
    height: var(--ear);
    pointer-events: none;
  }

  .notch::before {
    right: 100%;
    background: radial-gradient(
      circle at 0 100%,
      transparent calc(var(--ear) - 0.5px),
      var(--popover) var(--ear)
    );
  }

  .notch::after {
    left: 100%;
    background: radial-gradient(
      circle at 100% 100%,
      transparent calc(var(--ear) - 0.5px),
      var(--popover) var(--ear)
    );
  }

  .notch[data-expanded="true"] :global(button.absolute.inset-0) {
    pointer-events: none;
  }

  .notch-panel {
    opacity: 0;
    translate: 0 -6px;
    pointer-events: none;
    transition:
      opacity 90ms var(--ease-out),
      translate 90ms var(--ease-out);
  }

  .notch[data-expanded="true"] .notch-panel {
    opacity: 1;
    translate: 0 0;
    pointer-events: auto;
    transition-duration: 200ms;
    transition-delay: 60ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .notch,
    .notch[data-expanded="true"] {
      transition: none;
    }

    .notch-panel,
    .notch[data-expanded="true"] .notch-panel {
      translate: 0 0;
      transition: opacity 120ms var(--ease-out);
    }
  }
</style>

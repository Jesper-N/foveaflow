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

  import DrillPreview from "../../icons/drill-preview.svelte";
  import BrandMark from "../../ui/brand-mark.svelte";
  import IconButton from "../../ui/icon-button.svelte";
  import { pressable } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";
  import IslandAdjustments from "./island-adjustments.svelte";
  import { createIslandMorph } from "./island-morph";
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
  let morph = $state.raw<ReturnType<typeof createIslandMorph>>();

  $effect(() => {
    morph?.setExpanded(expanded);
  });

  const islandMorph: Attachment<HTMLElement> = (node) => {
    const notch = node.querySelector<HTMLElement>(".island-compact");
    const created = notch === null ? undefined : createIslandMorph(node, notch);

    morph = created;

    return () => {
      created?.destroy();
      morph = undefined;
    };
  };

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
    class="island dark text-foreground pointer-events-auto relative w-full max-w-108 bg-black"
    {@attach islandEvents}
    {@attach islandMorph}
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

    <div class="island-panel grid gap-3 p-3.5">
      <div class="flex items-center gap-3">
        <DrillPreview
          class="h-12 w-16 shrink-0 rounded-xl"
          drillId={trainer.settings.drillId}
          playing={false}
        />
        <IslandSelects />
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
        {/if}
        <IconButton
          class="size-12 rounded-full [&_svg]:size-5"
          aria-describedby="trainer-motion-status"
          label={trainer.motionPaused ? t("Resume motion") : t("Pause motion")}
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
      </div>

      <div
        class={["grid gap-x-5 px-0.5", !trainer.isLilacChaser && "grid-cols-2"]}
      >
        <IslandAdjustments />
      </div>

      <footer
        class="border-border -mx-1 flex items-center gap-1 border-t ps-1 pt-2"
      >
        <a
          class={[
            "text-muted-foreground hover:text-foreground me-auto flex h-9 items-center gap-2 rounded-full pe-2 text-sm font-medium",
            pressable,
          ]}
          href="/"
        >
          <BrandMark class="size-6" />
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
      </footer>
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
    transform-origin: top center;
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
    .island-panel,
    .island[data-expanded="true"] .island-panel {
      filter: none;
      scale: 1;
      translate: 0 0;
      transition: opacity 160ms var(--ease-out);
    }
  }
</style>

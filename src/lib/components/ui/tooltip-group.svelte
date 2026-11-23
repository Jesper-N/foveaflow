<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { ClassValue } from "svelte/elements";
  import { on } from "svelte/events";
  import { fly } from "svelte/transition";

  interface Props {
    side?: "top" | "bottom";
    offset?: number;
    class?: ClassValue;
    children: Snippet;
  }

  let {
    side = "top",
    offset = 8,
    class: className,
    children,
  }: Props = $props();

  const OPEN_DELAY_MS = 420;
  const HIDE_GRACE_MS = 140;
  const REOPEN_WINDOW_MS = 400;
  const EDGE = 8;

  let tip = $state.raw<HTMLDivElement>();
  let measure = $state.raw<HTMLSpanElement>();
  let label = $state("");
  let shortcut = $state<string | undefined>();
  let serial = $state(0);
  let shift = $state(0);
  let open = $state(false);
  let snap = $state(true);

  let current: HTMLElement | null = null;
  let closedAt = 0;
  let openTimer: number | undefined;
  let hideTimer: number | undefined;

  const place = async (trigger: HTMLElement, group: HTMLElement) => {
    await tick();

    if (!tip || !measure) {
      return;
    }

    const box = trigger.getBoundingClientRect();
    const width = measure.offsetWidth;
    const center = box.left + box.width / 2;

    const left = Math.min(
      Math.max(EDGE, center - width / 2),
      window.innerWidth - EDGE - width
    );

    group.dataset["direction"] =
      left >= Number(tip.dataset["left"] ?? left) ? "right" : "left";
    tip.dataset["left"] = String(left);
    tip.style.setProperty("left", `${left}px`);
    tip.style.setProperty("right", `${window.innerWidth - left - width}px`);

    if (side === "bottom") {
      tip.style.setProperty("top", `${box.bottom + offset}px`);
    } else {
      tip.style.setProperty(
        "bottom",
        `${window.innerHeight - box.top + offset}px`
      );
    }
  };

  const show = (trigger: HTMLElement, group: HTMLElement) => {
    window.clearTimeout(hideTimer);
    window.clearTimeout(openTimer);

    if (trigger === current && open) {
      return;
    }

    const travelling = open || performance.now() - closedAt < REOPEN_WINDOW_MS;

    const previous = current;

    current = trigger;
    shift =
      previous === null
        ? 0
        : Math.sign(
            trigger.getBoundingClientRect().left -
              previous.getBoundingClientRect().left
          );
    label = trigger.dataset["tip"] ?? "";
    shortcut = trigger.dataset["tipKey"];
    serial += 1;

    const reveal = async () => {
      snap = !open;
      await place(trigger, group);
      open = true;
      requestAnimationFrame(() => {
        snap = false;
      });
    };

    if (travelling) {
      void reveal();
    } else {
      openTimer = window.setTimeout(() => {
        void reveal();
      }, OPEN_DELAY_MS);
    }
  };

  const close = () => {
    if (open) {
      closedAt = performance.now();
    }

    open = false;
    current = null;
  };

  const hide = (immediately = false) => {
    window.clearTimeout(openTimer);
    window.clearTimeout(hideTimer);

    if (immediately) {
      close();
    } else {
      hideTimer = window.setTimeout(close, HIDE_GRACE_MS);
    }
  };

  const triggerOf = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLElement>("[data-tip]")
      : null;

  const follow: Attachment<HTMLElement> = (group) => {
    tip?.showPopover();

    const stops = [
      on(group, "pointerover", (event) => {
        const trigger = triggerOf(event.target);

        if (event.pointerType !== "touch" && trigger) {
          show(trigger, group);
        }
      }),
      on(group, "pointerout", (event) => {
        if (triggerOf(event.relatedTarget) === null) {
          hide();
        }
      }),
      on(group, "focusin", (event) => {
        const trigger = triggerOf(event.target);

        if (trigger?.matches(":focus-visible") === true) {
          closedAt = performance.now();
          show(trigger, group);
        }
      }),
      on(group, "focusout", () => {
        hide();
      }),
      on(group, "pointerdown", () => {
        hide(true);
      }),
      on(group, "keydown", (event) => {
        if (event.key === "Escape" || event.key === "Enter") {
          hide(true);
        }
      }),
    ];

    return () => {
      for (const stop of stops) {
        stop();
      }

      window.clearTimeout(openTimer);
      window.clearTimeout(hideTimer);
    };
  };

  const still = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const labelIn = (node: Element) =>
    fly(node, { duration: 220, opacity: 0, x: still() ? 0 : shift * 14 });

  const labelOut = (node: Element) =>
    fly(node, { duration: 160, opacity: 0, x: still() ? 0 : shift * -14 });
</script>

<div class={["relative", className]} {@attach follow}>
  {@render children()}

  <div
    bind:this={tip}
    class="morph-tip bg-primary text-primary-foreground pointer-events-none m-0 h-7 overflow-hidden rounded-md border-0 p-0"
    aria-hidden="true"
    data-open={open ? "" : undefined}
    data-side={side}
    data-snap={snap ? "" : undefined}
    popover="manual"
  >
    {#key serial}
      <span
        class="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center gap-2 ps-2.5 pe-1.5 text-xs font-medium whitespace-nowrap"
        in:labelIn
        out:labelOut
      >
        {label}
        {#if shortcut}
          <kbd
            class="bg-primary-foreground/16 text-2xs grid h-4.5 min-w-4.5 place-items-center rounded-xs px-1 font-sans font-semibold"
          >
            {shortcut}
          </kbd>
        {/if}
      </span>
    {/key}
  </div>
  <span
    bind:this={measure}
    class="pointer-events-none invisible fixed top-0 left-0 flex items-center gap-2 ps-2.5 pe-1.5 text-xs font-medium whitespace-nowrap"
    aria-hidden="true"
  >
    {label}
    {#if shortcut}
      <kbd class="text-2xs grid h-4.5 min-w-4.5 px-1 font-sans font-semibold">
        {shortcut}
      </kbd>
    {/if}
  </span>
</div>

<style>
  .morph-tip {
    --lead: 330ms;
    --trail: 790ms;
    --scale-timing: 160ms var(--ease-out);

    position: fixed;
    inset: auto;
    width: auto;
    opacity: 0;
    scale: 0.72;
    transform-origin: 50% 140%;
    transition:
      left var(--lead) var(--ease-edge-lead),
      right var(--lead) var(--ease-edge-lead),
      opacity 140ms var(--ease-out),
      scale var(--scale-timing);
  }

  .morph-tip[data-side="bottom"] {
    transform-origin: 50% -40%;
  }

  :global([data-direction="right"]) > .morph-tip {
    transition:
      right var(--lead) var(--ease-edge-lead),
      left var(--trail) var(--ease-edge-trail),
      opacity 140ms var(--ease-out),
      scale var(--scale-timing);
  }

  :global([data-direction="left"]) > .morph-tip {
    transition:
      left var(--lead) var(--ease-edge-lead),
      right var(--trail) var(--ease-edge-trail),
      opacity 140ms var(--ease-out),
      scale var(--scale-timing);
  }

  .morph-tip[data-open] {
    --scale-timing: 420ms var(--ease-spring-pop);

    opacity: 1;
    scale: 1;
  }

  .morph-tip[data-snap] {
    --lead: 0s;
    --trail: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .morph-tip {
      scale: 1;
    }
  }
</style>

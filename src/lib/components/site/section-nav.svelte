<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";

  import { pageWidth } from "./layout";

  let { links }: { links: readonly { id: string; label: string }[] } = $props();

  let activeId = $state<string | null>(null);
  let indicator = $state<HTMLLIElement>();
  let indicatorLeft = 0;

  const placeIndicator = (link: HTMLElement | null, list: HTMLElement) => {
    if (!indicator) {
      return;
    }

    if (!link) {
      indicator.style.opacity = "0";

      return;
    }

    indicator.toggleAttribute("data-snap", indicator.style.opacity !== "1");
    list.dataset["direction"] =
      link.offsetLeft >= indicatorLeft ? "right" : "left";
    indicatorLeft = link.offsetLeft;
    indicator.style.opacity = "1";
    indicator.style.left = `${link.offsetLeft}px`;
    indicator.style.right = `${list.clientWidth - link.offsetLeft - link.offsetWidth}px`;
  };

  const followSections: Attachment<HTMLElement> = (list) => {
    const visible: Record<string, boolean> = {};
    let jumpingTo: string | null = null;

    const targets = links.flatMap(({ id }) => {
      const target = document.querySelector(`#${CSS.escape(id)}`);

      return target ? [target] : [];
    });

    const show = (id: string | null) => {
      activeId = id;

      const link =
        activeId === null
          ? null
          : list.querySelector<HTMLElement>(`a[href="#${activeId}"]`);

      placeIndicator(link, list);

      if (link) {
        list.scrollTo({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2,
        });
      }
    };

    const update = () => {
      if (jumpingTo !== null) {
        return;
      }

      const middle = window.innerHeight / 2;

      const passed = targets.filter(
        (target) => target.getBoundingClientRect().top < middle
      );

      show(
        links.find(({ id }) => visible[id] === true)?.id ??
          passed.at(-1)?.id ??
          links[0]?.id ??
          null
      );
    };

    const jump = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href^='#']")
          : null;

      if (link) {
        jumpingTo = link.hash.slice(1);
        show(jumpingTo);
      }
    };

    const settle = () => {
      jumpingTo = null;
      update();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible[entry.target.id] = entry.isIntersecting;
        }

        update();
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    for (const target of targets) {
      observer.observe(target);
    }

    const stops = [on(list, "click", jump), on(window, "scrollend", settle)];

    return () => {
      for (const stop of stops) {
        stop();
      }

      observer.disconnect();
    };
  };
</script>

<nav
  class="bg-background short:top-0 sticky top-16 z-9"
  aria-labelledby="page-toc"
>
  <div class={[pageWidth, "flex items-center gap-4"]}>
    <h2
      id="page-toc"
      class="text-muted-foreground shrink-0 text-xs max-md:sr-only"
    >
      {t("On this page")}
    </h2>
    <ul
      class="scroll-fade-x relative flex min-w-0 flex-1 snap-x scroll-px-6 scrollbar-none gap-1 overflow-x-auto px-6 py-2.5"
      {@attach followSections}
    >
      <li
        bind:this={indicator}
        class="bg-primary stretch-indicator pointer-events-none absolute top-2.5 h-9 rounded-full opacity-0 pointer-coarse:h-11"
        aria-hidden="true"
      ></li>
      {#each links as link (link.id)}
        <li class="snap-start">
          <a
            class={[
              "relative flex h-9 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-160 ease-out pointer-coarse:h-11",
              activeId === link.id
                ? "text-primary-foreground delay-100"
                : "text-muted-foreground hover:bg-fill hover:text-foreground",
            ]}
            aria-current={activeId === link.id ? "location" : undefined}
            href="#{link.id}"
          >
            {t(link.label)}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import type { Attachment } from "svelte/attachments";

  import { pageWidth } from "./layout";

  let { links }: { links: readonly { id: string; label: string }[] } = $props();

  let activeId = $state<string | null>(null);
  let indicator = $state<HTMLLIElement>();

  const placeIndicator = (link: HTMLElement | null) => {
    if (!indicator) {
      return;
    }

    if (!link) {
      indicator.style.opacity = "0";

      return;
    }

    indicator.style.opacity = "1";
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.translate = `${link.offsetLeft}px 0`;
  };

  const followSections: Attachment<HTMLElement> = (list) => {
    const visible: Record<string, boolean> = {};

    const targets = links.flatMap(({ id }) => {
      const target = document.querySelector(`#${CSS.escape(id)}`);

      return target ? [target] : [];
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible[entry.target.id] = entry.isIntersecting;
        }

        activeId = links.find(({ id }) => visible[id] === true)?.id ?? null;

        const link =
          activeId === null
            ? null
            : list.querySelector<HTMLElement>(`a[href="#${activeId}"]`);

        placeIndicator(link);

        if (link) {
          list.scrollTo({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
            left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2,
          });
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    for (const target of targets) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  };
</script>

<nav
  class="bg-background/88 sticky top-16 z-9 backdrop-blur-md"
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
      class="relative flex min-w-0 flex-1 snap-x scrollbar-none gap-1 overflow-x-auto py-2.5"
      {@attach followSections}
    >
      <li
        bind:this={indicator}
        class="bg-primary pointer-events-none absolute inset-s-0 top-2.5 h-9 rounded-full opacity-0 transition-[translate,width,opacity] duration-300 ease-out pointer-coarse:h-11"
        aria-hidden="true"
      ></li>
      {#each links as link (link.id)}
        <li class="snap-start">
          <a
            class={[
              "relative flex h-9 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-160 ease-out pointer-coarse:h-11",
              activeId === link.id
                ? "text-primary-foreground"
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

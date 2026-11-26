<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { t } from "$lib/i18n/translate";
  import type { DrillId } from "$lib/trainer/settings/drills";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";

  import DrillIcon from "../icons/drill-icon.svelte";
  import DrillPreview from "../icons/drill-preview.svelte";
  import { buttonClass } from "../ui/button-variants";
  import { bodyText, sectionHeading } from "./layout";
  import StepList from "./step-list.svelte";

  let activeDrill = $state<DrillId>("pursuit");

  let activeIndex = $derived(
    drillGuides.findIndex(({ drillId }) => drillId === activeDrill)
  );

  const followScroll: Attachment<HTMLElement> = (root) => {
    const settle = () => {
      const middle = window.innerHeight / 2;
      let closest: { id: DrillId; distance: number } | null = null;

      for (const guide of drillGuides) {
        const article = root.querySelector(`#${CSS.escape(guide.drillId)}`);
        const box = article?.getBoundingClientRect();

        const distance =
          box === undefined
            ? Number.POSITIVE_INFINITY
            : Math.abs(box.top + box.height / 2 - middle);

        if (closest === null || distance < closest.distance) {
          closest = { distance, id: guide.drillId };
        }
      }

      if (closest !== null) {
        activeDrill = closest.id;
      }
    };

    settle();

    return on(window, "scrollend", settle);
  };

  const followDrill =
    (drillId: DrillId): Attachment<HTMLElement> =>
    (node) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting === true) {
            activeDrill = drillId;
          }
        },
        { rootMargin: "-45% 0px -45% 0px" }
      );

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    };
</script>

<section id="practice" class="short:scroll-mt-16 grid scroll-mt-36 gap-12">
  <h2 class={sectionHeading}>{t("How to practice")}</h2>

  <div
    class="grid gap-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-x-20"
    {@attach followScroll}
  >
    <div class="max-lg:hidden">
      <div class="sticky top-36 grid gap-3">
        <div
          class="bg-card relative aspect-square overflow-hidden rounded-4xl p-2"
        >
          {#each drillGuides as guide (guide.drillId)}
            <DrillPreview
              class={[
                "stage-layer absolute top-2 left-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-3xl",
                guide.drillId === activeDrill ? "is-active" : "is-idle",
              ]}
              backdrop="fovea"
              drillId={guide.drillId}
            />
          {/each}
        </div>
        <div class="flex items-center justify-between px-2 text-sm">
          <span class="flex items-center gap-2 font-medium">
            <DrillIcon class="size-4" drillId={activeDrill} />
            {t(drillGuides[activeIndex]?.title ?? "")}
          </span>
          <span class="flex items-center gap-1.5" aria-hidden="true">
            {#each drillGuides as guide, index (guide.drillId)}
              <span
                class={[
                  "h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out",
                  index === activeIndex
                    ? "bg-foreground w-6"
                    : "bg-fill-active w-1.5",
                ]}
              ></span>
            {/each}
          </span>
        </div>
      </div>
    </div>

    <div class="grid gap-20 lg:gap-0">
      {#each drillGuides as guide (guide.drillId)}
        <article
          id={guide.drillId}
          class={[
            "short:scroll-mt-16 grid scroll-mt-36 content-start gap-6 transition-opacity duration-500 ease-out lg:min-h-[70vh] lg:pb-12",
            guide.drillId !== activeDrill &&
              "lg:opacity-40 lg:focus-within:opacity-100 lg:hover:opacity-100",
          ]}
          {@attach followDrill(guide.drillId)}
        >
          <div class="grid gap-3">
            <h3 class="text-lg font-semibold">{t(guide.title)}</h3>
            <p class={bodyText}>{t(guide.summary)}</p>
          </div>
          <StepList steps={guide.steps} />
          <p class="bg-fill text-md rounded-2xl p-4 text-pretty">
            {t(guide.benefits)}
          </p>
          <a
            class={[buttonClass("primary", "lg"), "justify-self-start"]}
            href={mainRouteForDrill(guide.drillId)?.path}
          >
            {t("Try this drill")}
          </a>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  :global(.stage-layer) {
    transition:
      opacity 420ms var(--ease-out),
      filter 420ms var(--ease-out),
      scale 520ms var(--ease-out);
  }

  :global(.stage-layer.is-idle) {
    opacity: 0;
    filter: blur(8px);
    scale: 0.96;
  }

  :global(.stage-layer.is-idle[data-playing] *) {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.stage-layer),
    :global(.stage-layer.is-idle) {
      filter: none;
      scale: 1;
      transition: opacity 200ms var(--ease-out);
    }
  }
</style>

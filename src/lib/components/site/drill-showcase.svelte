<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { t } from "$lib/i18n/translate";
  import type { DrillId } from "$lib/trainer/settings/drills";
  import { ArrowRightIcon } from "@lucide/svelte";
  import type { Attachment } from "svelte/attachments";

  import DrillIcon from "../icons/drill-icon.svelte";
  import DrillPreview from "../icons/drill-preview.svelte";
  import { buttonClass } from "../ui/button-variants";
  import { bodyText, sectionHeading } from "./layout";
  import StepList from "./step-list.svelte";

  let activeDrill = $state<DrillId>("pursuit");

  let activeIndex = $derived(
    drillGuides.findIndex(({ drillId }) => drillId === activeDrill)
  );

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

<section id="practice" class="grid scroll-mt-36 gap-12">
  <div class="grid max-w-2xl gap-3">
    <h2 class={sectionHeading}>{t("How each drill works")}</h2>
    <p class={bodyText}>
      {t(
        "Keep your head still unless a drill says otherwise. These modes are about eye movement, attention, and focus, not neck movement."
      )}
    </p>
  </div>

  <div class="grid gap-16 lg:grid-cols-2 lg:gap-20">
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
      {#each drillGuides as guide, index (guide.drillId)}
        <article
          id={guide.drillId}
          class={[
            "grid scroll-mt-36 content-center gap-6 transition-opacity duration-500 ease-out lg:min-h-[70vh] lg:py-12",
            guide.drillId !== activeDrill &&
              "lg:opacity-40 lg:focus-within:opacity-100 lg:hover:opacity-100",
          ]}
          {@attach followDrill(guide.drillId)}
        >
          <DrillPreview
            class="aspect-4/3 w-full rounded-3xl lg:hidden"
            drillId={guide.drillId}
          />
          <div class="grid gap-3">
            <span
              class="text-muted-foreground text-sm font-medium tabular-nums"
            >
              {String(index + 1).padStart(2, "0")} / {String(
                drillGuides.length
              ).padStart(2, "0")}
            </span>
            <h3 class="text-xl font-semibold">{t(guide.title)}</h3>
            <p class={bodyText}>{t(guide.summary)}</p>
          </div>
          <StepList steps={guide.steps} />
          <p class="bg-fill text-md rounded-2xl p-4 text-pretty">
            <span class="font-medium">{t("What it trains:")}</span>
            <span class="text-muted-foreground">{t(guide.benefits)}</span>
          </p>
          <a
            class={[
              buttonClass("primary", "lg"),
              "group/cta justify-self-start",
            ]}
            href={mainRouteForDrill(guide.drillId)?.path}
          >
            {t("Try this drill")}
            <ArrowRightIcon
              class="ease-spring transition-transform duration-260 group-hover/cta:translate-x-0.5 rtl:-scale-x-100"
              aria-hidden="true"
            />
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

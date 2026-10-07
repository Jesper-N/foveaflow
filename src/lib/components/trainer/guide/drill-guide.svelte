<script lang="ts">
  import { panelSurface } from "$lib/components/site/styles";
  import { getDrillGuide } from "$lib/content/drill-guides";
  import type { DrillRoute } from "$lib/content/drill-routes";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import PlusIcon from "@lucide/svelte/icons/plus";

  import GuideHeader from "./guide-header.svelte";
  import { guideCopy, guideSectionHeading } from "./styles";

  let { route }: { route: DrillRoute } = $props();

  let drillGuide = $derived(getDrillGuide(route.drillId));
  let copy = $derived(route.copy);
</script>

<GuideHeader
  title={t(copy.heading)}
  lede={t(copy.hero)}
  drillId={drillGuide.drillId}
/>

<div
  class="grid gap-8 px-6 py-7 sm:grid-cols-[minmax(0,1fr)_17rem] sm:grid-rows-[auto_1fr] sm:gap-x-10 sm:px-8"
>
  <section
    class="guide-enter grid content-start gap-2 [animation-delay:40ms]"
    aria-labelledby="trainer-guide-steps"
  >
    <h3 id="trainer-guide-steps" class={guideSectionHeading}>
      {t("How to practice")}
    </h3>
    <ol class="grid gap-1">
      {#each drillGuide.steps as step, index (step)}
        <li class="grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline">
          <span class="text-muted-foreground tabular-nums" aria-hidden="true">
            {index + 1}
          </span>
          <span class={guideCopy}>{t(step)}</span>
        </li>
      {/each}
    </ol>
  </section>

  <!-- Spans both rows so the answers sit beside the steps and the overview. -->
  <div
    class="guide-enter grid content-start gap-6 [animation-delay:80ms] sm:row-span-2"
  >
    <p class={[panelSurface, "rounded-2xl p-5", guideCopy]}>
      <span class="text-foreground font-semibold">{t("What it trains:")}</span>
      {t(drillGuide.benefits)}
    </p>

    <section aria-labelledby="trainer-guide-faq">
      <h3 id="trainer-guide-faq" class={guideSectionHeading}>
        {t("Quick answers")}
      </h3>
      <div class="divide-border/60 mt-1 divide-y">
        {#each copy.faq as item (item.question)}
          <!-- Sharing a name makes the answers an accordion: opening one closes the rest. -->
          <details
            name="trainer-guide-faq"
            class="group [interpolate-size:allow-keywords] details-content:h-0 details-content:overflow-clip details-content:transition-[height,content-visibility] details-content:transition-discrete details-content:duration-200 details-content:ease-out open:details-content:h-auto motion-reduce:details-content:transition-none"
          >
            <summary
              class="text-foreground focus-visible:outline-ring text-subtitle flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm py-2 text-left font-semibold text-balance focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
            >
              <span>{t(item.question)}</span>
              <PlusIcon
                class="text-muted-foreground size-4 shrink-0 transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none"
              />
            </summary>
            <p class={["pb-3", guideCopy]}>{t(item.answer)}</p>
          </details>
        {/each}
      </div>
    </section>
  </div>

  <section
    class="guide-enter grid content-start gap-2 [animation-delay:80ms]"
    aria-labelledby="trainer-guide-overview"
  >
    <h3 id="trainer-guide-overview" class={guideSectionHeading}>
      {t("Overview")}
    </h3>
    <div class="grid gap-3">
      {#each copy.body as paragraph (paragraph)}
        <p class={guideCopy}>{t(paragraph)}</p>
      {/each}
      <p class={guideCopy}>{t(freeUseNote)}</p>
    </div>
  </section>
</div>

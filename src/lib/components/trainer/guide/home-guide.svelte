<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import { drillCard, editorialSubheading } from "$lib/components/site/styles";
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { homeCopy } from "$lib/content/home";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils";

  import GuideHeader from "./guide-header.svelte";
  import { guideCopy, guideSectionHeading } from "./styles";
</script>

<GuideHeader title={t(homeCopy.heading)} lede={t(homeCopy.hero)} />

<div class="grid gap-6 px-6 py-7 sm:px-8">
  <section
    class="guide-enter grid gap-2 [animation-delay:40ms]"
    aria-labelledby="trainer-guide-drills"
  >
    <h3 id="trainer-guide-drills" class={guideSectionHeading}>
      {t("Drills")}
    </h3>
    <ul class="grid gap-3 sm:grid-cols-2">
      {#each drillGuides as guide (guide.drillId)}
        <li>
          <a
            href={mainRouteForDrill(guide.drillId)?.path ?? "/"}
            class={cn(
              drillCard,
              "grid h-full grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 rounded-2xl p-3"
            )}
          >
            <span class="px-2 py-1.5">
              <DrillIllustration drillId={guide.drillId} />
            </span>
            <span class="grid gap-2">
              <span class={editorialSubheading}>
                {t(guide.title)}
              </span>
              <span class="text-muted-foreground text-caption text-pretty">
                {t(guide.summary)}
              </span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section
    class="guide-enter grid gap-2 [animation-delay:80ms]"
    aria-labelledby="trainer-guide-overview"
  >
    <h3 id="trainer-guide-overview" class={guideSectionHeading}>
      {t("Overview")}
    </h3>
    <!-- Balanced columns keep the closing note from sitting alone. -->
    <div class="*:break-inside-avoid *:not-last:pb-3 sm:columns-2 sm:gap-10">
      {#each homeCopy.body as paragraph (paragraph)}
        <p class={guideCopy}>{t(paragraph)}</p>
      {/each}
      <p class={guideCopy}>{t(freeUseNote)}</p>
    </div>
  </section>
</div>

<script lang="ts">
  import { articles } from "$lib/content/articles";
  import { referenceLinks, guideFaq } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";

  import PageCta from "./page-cta.svelte";
  import PageSection from "./page-section.svelte";
  import {
    editorialCopy,
    editorialSubheading,
    iconBadge,
    panelSurface,
  } from "./styles";
</script>

<PageSection
  id="controls"
  heading={t("Controls")}
  intro={t(
    "Change speed and target size first. They usually have the biggest effect on difficulty and control."
  )}
>
  <div class={[panelSurface, "mt-3 flex items-start gap-4 rounded-2xl p-5"]}>
    <span class={[iconBadge, "size-10"]} aria-hidden="true">
      <SlidersHorizontalIcon class="size-4" />
    </span>
    <div class="grid gap-2">
      <h3 class={editorialSubheading}>{t("Motion and target")}</h3>
      <p class="text-muted-foreground">
        {t(
          "Speed, size, shape, color, opacity, and trail change the feel of the moving drills. Lilac Chaser has its own ball color and scale controls."
        )}
      </p>
    </div>
  </div>
</PageSection>

<PageSection id="more-guides" heading={t("More guides")}>
  <!-- Dividers live on the wrappers so the rounded focus outline can't bend them. -->
  <div class="divide-border mt-2 divide-y">
    {#each articles as article (article.slug)}
      <div class="py-6 first:pt-0 last:pb-0">
        <a
          href={article.path}
          class="group focus-visible:outline-ring flex items-start gap-5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <div class="flex-1">
            <h3 class={editorialSubheading}>
              {t(article.heading)}
            </h3>
            <p class="text-muted-foreground text-caption mt-2">
              {t(article.description)}
            </p>
          </div>
          <span
            class="bg-muted group-hover:bg-primary/10 group-hover:text-brand-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors motion-reduce:transition-none"
          >
            <ArrowUpRightIcon class="size-4" />
          </span>
        </a>
      </div>
    {/each}
  </div>
</PageSection>

<PageSection id="faq" heading={t("Guide FAQ")} data-nosnippet>
  <div class="divide-border mt-2 divide-y">
    {#each guideFaq as item (item.question)}
      <details class="group py-3 first:pt-0 last:pb-0 open:pb-6">
        <summary
          class="focus-visible:outline-ring text-subtitle flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 rounded-sm font-semibold text-balance focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
        >
          {t(item.question)}
          <PlusIcon
            class="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
          />
        </summary>
        <p class={[editorialCopy, "pr-10"]}>{t(item.answer)}</p>
      </details>
    {/each}
  </div>
</PageSection>

<PageSection
  id="references"
  heading={t("Research and background reading")}
  intro={t(
    "These sources explain the eye movements and visual effects behind the drills. They do not establish that FoveaFlow improves eyesight or game performance."
  )}
>
  <ol class="divide-border mt-3 divide-y">
    {#each referenceLinks as reference (reference.url)}
      <li>
        <a
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground focus-visible:outline-ring flex items-baseline gap-4 rounded-sm py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none"
        >
          <span class="flex-1">{t(reference.label)}</span>
          <ArrowUpRightIcon class="size-3.5 shrink-0 self-center" />
        </a>
      </li>
    {/each}
  </ol>
</PageSection>

<PageCta
  title={t("Ready to try a drill?")}
  body={t("Start slow. Adjust as you go.")}
  href="/"
  label={t("Open FoveaFlow")}
/>

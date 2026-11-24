<script lang="ts">
  import { articles } from "$lib/content/articles";
  import type { Article } from "$lib/content/articles";
  import { guideFaq, referenceLinks } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import { ArrowUpRightIcon } from "@lucide/svelte";
  import type { Attachment } from "svelte/attachments";

  import DrillIcon from "../icons/drill-icon.svelte";
  import AccordionList from "../ui/accordion-list.svelte";
  import BrandMark from "../ui/brand-mark.svelte";
  import { pressable } from "../ui/styles";
  import ControlsPlayground from "./controls-playground.svelte";
  import { sectionHeading, subHeading } from "./layout";
  import PageSection from "./page-section.svelte";

  const guides: readonly Article[] = articles;

  const routineOf = (article: Article) =>
    article.sections.flatMap((section) => section.routine ?? []);

  const share =
    (minutes: number): Attachment<HTMLElement> =>
    (node) => {
      node.style.flexGrow = String(minutes);
    };

  let faq = $derived(
    guideFaq.map(({ question, answer }) => ({
      answer: t(answer),
      question: t(question),
    }))
  );
</script>

<PageSection
  id="controls"
  heading={t("Controls")}
  intro={t(
    "Change speed and target size first. They usually have the biggest effect on difficulty and control."
  )}
>
  <ControlsPlayground />
</PageSection>

<section
  id="more-guides"
  class="grid scroll-mt-36 gap-10"
  aria-labelledby="more-guides-heading"
>
  <h2 id="more-guides-heading" class={sectionHeading}>{t("More guides")}</h2>
  <div class="grid gap-2 md:grid-cols-3">
    {#each guides as article (article.slug)}
      <a
        class={[
          "group/article bg-card hover:bg-fill-hover grid content-start gap-4 rounded-3xl p-2 pb-5 motion-safe:active:scale-99",
          pressable,
        ]}
        href={article.path}
      >
        <span
          class="canvas-grid relative grid aspect-2/1 place-items-center overflow-hidden rounded-2xl"
          aria-hidden="true"
        >
          {#if article.comparison}
            <span class="flex items-center">
              <BrandMark
                class="ring-canvas ease-spring relative z-1 size-16 rounded-3xl ring-4 transition-[translate] duration-260 group-hover/article:-translate-x-1.5"
              />
              <span
                class="bg-popover text-muted-foreground ring-canvas ease-spring -ms-4 grid size-16 place-items-center rounded-3xl text-xl font-semibold ring-4 transition-[translate] duration-260 group-hover/article:translate-x-1.5"
              >
                {article.comparison.alternative.charAt(0)}
              </span>
            </span>
          {:else}
            <span class="flex w-4/5 gap-1.5">
              {#each routineOf(article) as step (step.drillId)}
                <span
                  class="bg-popover shadow-thumb grid h-16 min-w-0 basis-0 place-items-center rounded-2xl"
                  {@attach share(step.minutes)}
                >
                  <DrillIcon class="size-6" drillId={step.drillId} />
                </span>
              {/each}
            </span>
          {/if}
          <span
            class="bg-popover shadow-thumb ease-spring absolute inset-e-2 top-2 grid size-8 place-items-center rounded-full transition-[translate] duration-260 group-hover/article:translate-x-0.5 group-hover/article:-translate-y-0.5"
          >
            <ArrowUpRightIcon class="size-3.5 rtl:-scale-x-100" />
          </span>
        </span>
        <span class="grid gap-2 px-3">
          <span class="text-muted-foreground text-xs font-medium">
            {t(article.kicker)}
          </span>
          <h3 class={subHeading}>{t(article.heading)}</h3>
          <span class="text-muted-foreground line-clamp-3 text-sm text-pretty">
            {t(article.description)}
          </span>
        </span>
      </a>
    {/each}
  </div>
</section>

<PageSection id="faq" data-nosnippet heading={t("Guide FAQ")}>
  <AccordionList class="-mt-4" items={faq} />
</PageSection>

<PageSection
  id="references"
  heading={t("Research and background reading")}
  intro={t(
    "These sources do not establish that FoveaFlow improves eyesight or game performance."
  )}
>
  <ol class="divide-border border-border grid divide-y border-y">
    {#each referenceLinks as reference, index (reference.url)}
      <li>
        <a
          class="group/ref text-md flex items-start gap-4 py-4 transition-colors duration-160 ease-out"
          href={reference.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span
            class="text-muted-foreground w-6 shrink-0 pt-px text-sm tabular-nums"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span class="grid flex-1 gap-0.5">
            <span class="text-pretty">{t(reference.label)}</span>
            <span class="text-muted-foreground text-xs">
              {new URL(reference.url).hostname.replace(/^www\./u, "")}
            </span>
          </span>
          <ArrowUpRightIcon
            class="text-muted-foreground ease-spring group-hover/ref:text-foreground mt-0.5 size-4 shrink-0 transition-[translate,color] duration-260 group-hover/ref:translate-x-0.5 group-hover/ref:-translate-y-0.5 rtl:-scale-x-100"
            aria-hidden="true"
          />
        </a>
      </li>
    {/each}
  </ol>
</PageSection>

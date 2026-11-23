<script lang="ts">
  import { articles } from "$lib/content/articles";
  import { guideFaq, referenceLinks } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import { ArrowUpRightIcon } from "@lucide/svelte";

  import AccordionList from "../ui/accordion-list.svelte";
  import { pressable } from "../ui/styles";
  import ControlsPlayground from "./controls-playground.svelte";
  import { subHeading } from "./layout";
  import PageSection from "./page-section.svelte";

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

<PageSection id="more-guides" heading={t("More guides")}>
  <div class="grid gap-2">
    {#each articles as article (article.slug)}
      <a
        class={[
          "group/article bg-card hover:bg-fill-hover flex items-center justify-between gap-6 rounded-3xl p-5 motion-safe:active:scale-99",
          pressable,
        ]}
        href={article.path}
      >
        <span class="grid gap-1">
          <span class="text-muted-foreground text-xs font-medium">
            {t(article.kicker)}
          </span>
          <h3 class={subHeading}>{t(article.heading)}</h3>
          <span class="text-muted-foreground text-sm text-pretty">
            {t(article.description)}
          </span>
        </span>
        <span
          class="bg-popover shadow-thumb ease-spring grid size-10 shrink-0 place-items-center rounded-full transition-[translate] duration-260 group-hover/article:-translate-y-0.5"
          aria-hidden="true"
        >
          <ArrowUpRightIcon class="size-4 rtl:-scale-x-100" />
        </span>
      </a>
    {/each}
  </div>
</PageSection>

<PageSection id="faq" data-nosnippet heading={t("Guide FAQ")}>
  <AccordionList class="-mt-4" items={faq} />
</PageSection>

<PageSection
  id="references"
  heading={t("Research and background reading")}
  intro={t(
    "These sources explain the eye movements and visual effects behind the drills. They do not establish that FoveaFlow improves eyesight or game performance."
  )}
>
  <ol class="bg-card grid gap-1 rounded-4xl p-2">
    {#each referenceLinks as reference, index (reference.url)}
      <li>
        <a
          class="group/ref text-md hover:bg-fill flex items-start gap-4 rounded-2xl p-3 transition-colors duration-160 ease-out"
          href={reference.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span
            class="text-muted-foreground w-6 shrink-0 pt-px text-sm tabular-nums"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span class="flex-1 text-pretty">{t(reference.label)}</span>
          <ArrowUpRightIcon
            class="text-muted-foreground ease-spring group-hover/ref:text-foreground mt-0.5 size-4 shrink-0 transition-[translate,color] duration-260 group-hover/ref:translate-x-0.5 group-hover/ref:-translate-y-0.5 rtl:-scale-x-100"
            aria-hidden="true"
          />
        </a>
      </li>
    {/each}
  </ol>
</PageSection>

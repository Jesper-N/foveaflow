<script lang="ts">
  import { articles } from "$lib/content/articles";
  import { guideFaq, referenceLinks } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";
  import { ArrowUpRightIcon } from "@lucide/svelte";

  import { pressable } from "../ui/styles";
  import { bodyText, subHeading, textLink } from "./layout";
  import PageCta from "./page-cta.svelte";
  import PageSection from "./page-section.svelte";
</script>

<PageSection
  id="controls"
  heading={t("Controls")}
  intro={t(
    "Change speed and target size first. They usually have the biggest effect on difficulty and control."
  )}
>
  <div class="bg-fill grid gap-1.5 rounded-2xl p-4">
    <h3 class={subHeading}>{t("Motion and target")}</h3>
    <p class="text-md text-muted-foreground text-pretty">
      {t(
        "Speed, size, shape, color, opacity, and trail change the feel of the moving drills. Lilac Chaser has its own ball color and scale controls."
      )}
    </p>
  </div>
</PageSection>

<PageSection id="more-guides" heading={t("More guides")}>
  <div class="grid gap-2">
    {#each articles as article (article.slug)}
      <a
        class={[
          "group/article bg-fill hover:bg-fill-hover flex items-start justify-between gap-4 rounded-2xl p-4 motion-safe:active:scale-98",
          pressable,
        ]}
        href={article.path}
      >
        <span class="grid gap-1">
          <h3 class={subHeading}>{t(article.heading)}</h3>
          <span class="text-muted-foreground text-sm text-pretty"
            >{t(article.description)}</span
          >
        </span>
        <ArrowUpRightIcon
          class="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform duration-220 ease-out group-hover/article:translate-x-0.5 group-hover/article:-translate-y-0.5"
          aria-hidden="true"
        />
      </a>
    {/each}
  </div>
</PageSection>

<PageSection id="faq" data-nosnippet heading={t("Guide FAQ")}>
  <div class="grid gap-6">
    {#each guideFaq as item (item.question)}
      <div class="grid gap-1.5">
        <h3 class={subHeading}>{t(item.question)}</h3>
        <p class={bodyText}>{t(item.answer)}</p>
      </div>
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
  <ol class="grid gap-3">
    {#each referenceLinks as reference, index (reference.url)}
      <li class="text-md flex gap-3">
        <span class="text-muted-foreground w-6 shrink-0 tabular-nums"
          >{index + 1}.</span
        >
        <a
          class={textLink}
          href={reference.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t(reference.label)}
        </a>
      </li>
    {/each}
  </ol>
</PageSection>

<PageCta
  body={t("Start slow. Adjust as you go.")}
  href="/"
  label={t("Open FoveaFlow")}
  title={t("Ready to try a drill?")}
/>

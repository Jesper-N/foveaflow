<script lang="ts">
  import { articles } from "$lib/content/articles";
  import { referenceLinks, guideFaq } from "$lib/content/guide";
  import { t } from "$lib/i18n/translate";

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
  <h3>{t("Motion and target")}</h3>
  <p>
    {t(
      "Speed, size, shape, color, opacity, and trail change the feel of the moving drills. Lilac Chaser has its own ball color and scale controls."
    )}
  </p>
</PageSection>

<PageSection id="more-guides" heading={t("More guides")}>
  {#each articles as article (article.slug)}
    <h3><a href={article.path}>{t(article.heading)}</a></h3>
    <p>{t(article.description)}</p>
  {/each}
</PageSection>

<PageSection id="faq" data-nosnippet heading={t("Guide FAQ")}>
  {#each guideFaq as item (item.question)}
    <h3>{t(item.question)}</h3>
    <p>{t(item.answer)}</p>
  {/each}
</PageSection>

<PageSection
  id="references"
  heading={t("Research and background reading")}
  intro={t(
    "These sources explain the eye movements and visual effects behind the drills. They do not establish that FoveaFlow improves eyesight or game performance."
  )}
>
  <ol>
    {#each referenceLinks as reference (reference.url)}
      <li>
        <a href={reference.url} rel="noopener noreferrer" target="_blank">
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

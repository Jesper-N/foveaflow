<script lang="ts">
  import { drillGuides } from "$lib/content/drill-guides";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { homeCopy } from "$lib/content/home";
  import { freeUseNote } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
</script>

<h2 id="trainer-guide-title">{t(homeCopy.heading)}</h2>
<p>{t(homeCopy.hero)}</p>

<section aria-labelledby="trainer-guide-drills">
  <h3 id="trainer-guide-drills">{t("Drills")}</h3>
  <ul>
    {#each drillGuides as guide (guide.drillId)}
      <li>
        <a href={mainRouteForDrill(guide.drillId)?.path ?? "/"}>
          {t(guide.title)}
        </a>
        <p>{t(guide.summary)}</p>
      </li>
    {/each}
  </ul>
</section>

<section aria-labelledby="trainer-guide-overview">
  <h3 id="trainer-guide-overview">{t("Overview")}</h3>
  {#each homeCopy.body as paragraph (paragraph)}
    <p>{t(paragraph)}</p>
  {/each}
  <p>{t(freeUseNote)}</p>
</section>

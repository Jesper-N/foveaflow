<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";

  let {
    comparison,
    checkedOn,
  }: {
    comparison: NonNullable<Article["comparison"]>;
    /** ISO date the other app was last checked. */
    checkedOn: string;
  } = $props();
</script>

<section aria-labelledby="feature-comparison">
  <h2 id="feature-comparison">{t("Feature comparison")}</h2>
  <table>
    <caption>
      {siteMetadata.name} / {comparison.alternative}: {t("Feature comparison")}
    </caption>
    <thead>
      <tr>
        <th scope="col">{t("Feature")}</th>
        <th scope="col">{siteMetadata.name}</th>
        <th scope="col">{comparison.alternative}</th>
      </tr>
    </thead>
    <tbody>
      {#each comparison.rows as row (row.feature)}
        <tr>
          <th scope="row">{t(row.feature)}</th>
          <td>{t(row.foveaflow)}</td>
          <td>{t(row.alternative)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p>
    {t("Checked against the public browser interface on")}
    <time datetime={checkedOn}>{formatDate(checkedOn)}</time>. {t(
      "Features may change. This comparison does not cover unreleased apps."
    )}
  </p>
  <a href={comparison.source.href} rel="noopener noreferrer" target="_blank">
    {t(comparison.source.label)}
  </a>
</section>

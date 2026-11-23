<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";

  import { pageWidth, textLink } from "./layout";

  let {
    comparison,
    checkedOn,
  }: { comparison: NonNullable<Article["comparison"]>; checkedOn: string } =
    $props();
</script>

<section
  class={[pageWidth, "grid gap-4 pb-16"]}
  aria-labelledby="feature-comparison"
>
  <h2 id="feature-comparison" class="text-lg font-semibold">
    {t("Feature comparison")}
  </h2>
  <div class="bg-card overflow-x-auto rounded-3xl p-1.5">
    <table class="text-md w-full min-w-xl border-collapse text-start">
      <caption class="sr-only">
        {siteMetadata.name} / {comparison.alternative}: {t(
          "Feature comparison"
        )}
      </caption>
      <thead>
        <tr class="text-muted-foreground text-xs">
          <th class="w-1/3 px-4 py-3 text-start font-normal" scope="col"
            >{t("Feature")}</th
          >
          <th
            class="text-foreground px-4 py-3 text-start font-medium"
            scope="col"
          >
            {siteMetadata.name}
          </th>
          <th class="px-4 py-3 text-start font-normal" scope="col"
            >{comparison.alternative}</th
          >
        </tr>
      </thead>
      <tbody class="[&>tr:nth-child(odd)]:bg-popover">
        {#each comparison.rows as row (row.feature)}
          <tr
            class="align-top [&>*:first-child]:rounded-s-2xl [&>*:last-child]:rounded-e-2xl"
          >
            <th class="px-4 py-3.5 text-start font-medium" scope="row"
              >{t(row.feature)}</th
            >
            <td class="px-4 py-3.5 text-pretty">{t(row.foveaflow)}</td>
            <td class="text-muted-foreground px-4 py-3.5 text-pretty"
              >{t(row.alternative)}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="text-muted-foreground max-w-2xl text-sm">
    {t("Checked against the public browser interface on")}
    <time datetime={checkedOn}>{formatDate(checkedOn)}</time>. {t(
      "Features may change. This comparison does not cover unreleased apps."
    )}
    <a
      class={textLink}
      href={comparison.source.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {t(comparison.source.label)}
    </a>
  </p>
</section>

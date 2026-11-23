<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";
  import { ArrowUpRightIcon } from "@lucide/svelte";

  import BrandMark from "../ui/brand-mark.svelte";
  import { textLink } from "./layout";

  let {
    comparison,
    checkedOn,
  }: { comparison: NonNullable<Article["comparison"]>; checkedOn: string } =
    $props();

  const cell = "px-5 py-4 align-top text-start";

  let lastIndex = $derived(comparison.rows.length - 1);
</script>

<section class="grid gap-5" aria-labelledby="feature-comparison">
  <h2 id="feature-comparison" class="sr-only">{t("Feature comparison")}</h2>
  <div class="bg-card overflow-x-auto rounded-4xl p-2">
    <table class="text-md w-full min-w-2xl border-separate border-spacing-0">
      <caption class="sr-only">
        {siteMetadata.name} / {comparison.alternative}: {t(
          "Feature comparison"
        )}
      </caption>
      <colgroup>
        <col class="w-1/4" />
        <col class="w-[37.5%]" />
        <col class="w-[37.5%]" />
      </colgroup>
      <thead>
        <tr>
          <th
            class={[cell, "text-muted-foreground text-xs font-medium"]}
            scope="col"
          >
            {t("Feature")}
          </th>
          <th
            class={[cell, "bg-popover rounded-t-3xl font-semibold"]}
            scope="col"
          >
            <span class="flex items-center gap-2.5">
              <BrandMark class="size-6 rounded-md" />
              {siteMetadata.name}
            </span>
          </th>
          <th class={[cell, "text-muted-foreground font-medium"]} scope="col">
            {comparison.alternative}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each comparison.rows as row, index (row.feature)}
          <tr>
            <th
              class={[
                cell,
                "font-medium",
                index !== lastIndex && "border-border border-b",
              ]}
              scope="row"
            >
              {t(row.feature)}
            </th>
            <td
              class={[
                cell,
                "bg-popover text-pretty",
                index === lastIndex
                  ? "rounded-b-3xl"
                  : "border-border border-b",
              ]}
            >
              {t(row.foveaflow)}
            </td>
            <td
              class={[
                cell,
                "text-muted-foreground text-pretty",
                index !== lastIndex && "border-border border-b",
              ]}
            >
              {t(row.alternative)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p
    class="text-muted-foreground mx-auto max-w-2xl text-center text-sm text-pretty"
  >
    {t("Checked against the public browser interface on")}
    <time datetime={checkedOn}>{formatDate(checkedOn)}</time>. {t(
      "Features may change. This comparison does not cover unreleased apps."
    )}
    <a
      class={[textLink, "inline-flex items-center gap-0.5"]}
      href={comparison.source.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {t(comparison.source.label)}
      <ArrowUpRightIcon class="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
    </a>
  </p>
</section>

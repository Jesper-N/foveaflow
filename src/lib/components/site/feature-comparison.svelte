<script lang="ts">
  import type { Article } from "$lib/content/articles";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import { editorialHeading, editorialLink, panelSurface } from "./styles";

  let {
    comparison,
    checkedOn,
  }: {
    comparison: NonNullable<Article["comparison"]>;
    /** ISO date the other app was last checked. */
    checkedOn: string;
  } = $props();
</script>

<section class="pt-12 sm:pt-16" aria-labelledby="feature-comparison">
  <h2 id="feature-comparison" class={[editorialHeading, "mb-6"]}>
    {t("Feature comparison")}
  </h2>
  <!-- A table on wide screens. On phones each row stacks into a card. -->
  <div class="ring-border/70 overflow-hidden rounded-2xl ring-1">
    <table class="block w-full border-collapse text-left text-sm sm:table">
      <caption class="sr-only">
        {siteMetadata.name} / {comparison.alternative}: {t(
          "Feature comparison"
        )}
      </caption>
      <thead class="sr-only sm:not-sr-only sm:table-header-group">
        <tr class="border-border border-b">
          <th scope="col" class="w-1/4 px-5 py-5 font-medium">
            {t("Feature")}
          </th>
          <th
            scope="col"
            class={[
              panelSurface,
              "w-[37.5%] px-5 py-5 text-base font-semibold",
            ]}
          >
            <span class="flex items-center gap-2">
              <img
                src="/logo-render/logo.svg"
                alt=""
                width="22"
                height="22"
                class="size-5.5 rounded-sm"
              />
              {siteMetadata.name}
            </span>
          </th>
          <th scope="col" class="w-[37.5%] px-5 py-5 text-base font-medium">
            {comparison.alternative}
          </th>
        </tr>
      </thead>
      <tbody class="divide-border block divide-y sm:table-row-group">
        {#each comparison.rows as row (row.feature)}
          <tr class="grid grid-cols-2 sm:table-row">
            <th
              scope="row"
              class="bg-muted/30 col-span-2 px-4 pt-4 pb-2 font-medium sm:bg-transparent sm:px-5 sm:py-5 sm:align-top"
            >
              {t(row.feature)}
            </th>
            <td
              class={[
                panelSurface,
                "px-4 py-4 align-top leading-6 sm:px-5 sm:py-5",
              ]}
            >
              <span
                class="text-brand-foreground mb-2 block text-xs font-semibold sm:hidden"
              >
                {siteMetadata.name}
              </span>
              {t(row.foveaflow)}
            </td>
            <td
              class="text-muted-foreground px-4 py-4 align-top leading-6 sm:px-5 sm:py-5"
            >
              <span
                class="text-foreground mb-2 block text-xs font-medium sm:hidden"
              >
                {comparison.alternative}
              </span>
              {t(row.alternative)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div
    class="text-muted-foreground mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-xs leading-5"
  >
    <p>
      {t("Checked against the public browser interface on")}
      <time datetime={checkedOn}>{formatDate(checkedOn)}</time>. {t(
        "Features may change. This comparison does not cover unreleased apps."
      )}
    </p>
    <a
      class={cn(editorialLink, "text-xs")}
      href={comparison.source.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {t(comparison.source.label)}
      <ArrowUpRightIcon class="size-3.5" />
    </a>
  </div>
</section>

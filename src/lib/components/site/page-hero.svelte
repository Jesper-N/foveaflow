<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import type { Snippet } from "svelte";

  let {
    breadcrumb,
    title,
    lede,
    actions,
    meta,
    children,
  }: {
    /** Trail to this page, in English. Labels are translated here; the last one has no link. */
    breadcrumb?: readonly { href?: string; label: string }[];
    title: string;
    lede: string;
    actions?: Snippet;
    meta?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<header>
  {#if breadcrumb}
    <nav aria-label={t("Breadcrumb")}>
      <ol>
        {#each breadcrumb as crumb (crumb.label)}
          <li>
            {#if crumb.href}
              <a href={crumb.href}>{t(crumb.label)}</a>
            {:else}
              <span aria-current="page">{t(crumb.label)}</span>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
  {/if}
  <h1>{title}</h1>
  <p>{lede}</p>
  {#if actions}
    <p>{@render actions()}</p>
  {/if}
  {#if meta}
    <p>{@render meta()}</p>
  {/if}
  {@render children?.()}
</header>

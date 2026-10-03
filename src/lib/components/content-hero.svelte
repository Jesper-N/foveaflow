<script lang="ts">
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import type { Snippet } from "svelte";

  import { contentStage, editorialLede, editorialTitle } from "./page-styles";

  let {
    locale,
    breadcrumb,
    title,
    lede,
    actions,
    meta,
    illustration,
    footer,
  }: {
    locale: AppLocale;
    breadcrumb?: readonly { href?: string; label: string }[];
    title: string;
    lede: string;
    actions?: Snippet;
    meta?: Snippet;
    illustration?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<section class="pt-8 pb-4 sm:pt-12">
  {#if breadcrumb}
    <nav aria-label={t(locale, "Breadcrumb")} class="mb-5 px-1">
      <ol
        class="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm"
      >
        {#each breadcrumb as crumb, index (crumb.label)}
          {#if index > 0}
            <li aria-hidden="true">
              <ChevronRight class="size-3.5" />
            </li>
          {/if}
          <li>
            {#if crumb.href}
              <a
                href={crumb.href}
                class="hover:text-foreground focus-visible:outline-ring rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none"
                >{t(locale, crumb.label)}</a
              >
            {:else}
              <span class="text-foreground" aria-current="page"
                >{t(locale, crumb.label)}</span
              >
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
  {/if}

  <div class={contentStage}>
    <div
      class={[
        "relative grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-14",
        illustration && "lg:grid-cols-[minmax(0,1fr)_20rem]",
      ]}
    >
      <div class="flex min-w-0 flex-col items-start gap-5">
        <h1 class={editorialTitle}>{title}</h1>
        <p class={editorialLede}>{lede}</p>
        {#if actions}
          <div
            class="mt-1 flex flex-col items-stretch gap-3 self-stretch sm:flex-row sm:flex-wrap sm:items-center sm:self-start"
          >
            {@render actions()}
          </div>
        {/if}
        {#if meta}
          <p class="text-muted-foreground text-xs">{@render meta()}</p>
        {/if}
      </div>
      {#if illustration}
        <div class="hidden lg:block">{@render illustration()}</div>
      {/if}
    </div>
    {#if footer}
      <div class="relative px-3 pb-3">{@render footer()}</div>
    {/if}
  </div>
</section>

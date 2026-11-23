<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { ChevronRightIcon } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { pageWidth } from "./layout";

  interface Props {
    breadcrumb?: readonly { href?: string; label: string }[];
    title: string;
    lede: string;
    actions?: Snippet;
    meta?: Snippet;
    children?: Snippet;
  }

  let { breadcrumb, title, lede, actions, meta, children }: Props = $props();
</script>

<header class={[pageWidth, "grid gap-10 pt-12 pb-16 sm:pt-20"]}>
  <div class="motion-safe:animate-rise grid max-w-3xl gap-5">
    {#if breadcrumb}
      <nav aria-label={t("Breadcrumb")}>
        <ol
          class="text-muted-foreground flex flex-wrap items-center gap-1 text-sm"
        >
          {#each breadcrumb as crumb, index (crumb.label)}
            <li class="flex items-center gap-1">
              {#if index > 0}
                <ChevronRightIcon
                  class="text-faint size-3.5 rtl:rotate-180"
                  aria-hidden="true"
                />
              {/if}
              {#if crumb.href}
                <a
                  class="hover:text-foreground transition-colors duration-160 ease-out"
                  href={crumb.href}
                >
                  {t(crumb.label)}
                </a>
              {:else}
                <span class="text-foreground" aria-current="page"
                  >{t(crumb.label)}</span
                >
              {/if}
            </li>
          {/each}
        </ol>
      </nav>
    {/if}
    <h1 class="text-2xl font-semibold text-balance sm:text-3xl">{title}</h1>
    <p class="text-muted-foreground max-w-2xl text-base text-pretty">
      {lede}
    </p>
    {#if actions}
      <div class="flex flex-wrap items-center gap-2 pt-1">
        {@render actions()}
      </div>
    {/if}
    {#if meta}
      <p class="text-muted-foreground text-sm">{@render meta()}</p>
    {/if}
  </div>
  {@render children?.()}
</header>

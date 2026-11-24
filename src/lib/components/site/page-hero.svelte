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
    layout?: "center" | "split";
    children?: Snippet;
  }

  let {
    breadcrumb,
    title,
    lede,
    actions,
    meta,
    layout = "center",
    children,
  }: Props = $props();

  let split = $derived(layout === "split");
</script>

<header
  class={[
    pageWidth,
    "grid gap-14 pt-14 pb-10 sm:pt-24 sm:pb-14",
    split &&
      "lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-center lg:gap-16 lg:pt-16",
  ]}
>
  <div
    class={[
      "motion-safe:animate-rise grid max-w-3xl gap-6",
      split
        ? "justify-items-start text-start"
        : "mx-auto justify-items-center text-center",
    ]}
  >
    {#if breadcrumb}
      <nav aria-label={t("Breadcrumb")}>
        <ol
          class={[
            "bg-fill flex flex-wrap items-center gap-1 rounded-full p-1 text-sm",
            !split && "justify-center",
          ]}
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
                  class="text-muted-foreground hover:text-foreground rounded-full px-2.5 py-1 transition-colors duration-160 ease-out"
                  href={crumb.href}
                >
                  {t(crumb.label)}
                </a>
              {:else}
                <span
                  class="bg-popover shadow-thumb rounded-full px-2.5 py-1 font-medium"
                  aria-current="page"
                >
                  {t(crumb.label)}
                </span>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>
    {/if}
    <h1
      class={[
        "text-2xl font-semibold text-balance sm:text-3xl",
        split && "xl:text-4xl",
      ]}
    >
      {title}
    </h1>
    <p
      class="text-muted-foreground max-w-2xl text-base text-pretty sm:text-lg sm:leading-7 sm:tracking-normal"
    >
      {lede}
    </p>
    {#if actions}
      <div
        class={[
          "flex flex-wrap items-center gap-2 pt-2",
          !split && "justify-center",
        ]}
      >
        {@render actions()}
      </div>
    {/if}
    {#if meta}
      <p class="text-muted-foreground text-sm">{@render meta()}</p>
    {/if}
  </div>
  {@render children?.()}
</header>

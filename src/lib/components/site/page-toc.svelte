<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

  let {
    links,
  }: {
    /** Section ids and English labels, translated here. */
    links: readonly { id: string; label: string }[];
  } = $props();
</script>

{#snippet navigation()}
  <nav
    aria-label={t("On this page")}
    class="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 lg:grid-cols-1"
  >
    {#each links as link (link.id)}
      <a
        href={`#${link.id}`}
        class="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:outline-ring rounded-lg px-3 py-2.5 text-sm leading-5 transition-colors focus-visible:outline-2 motion-reduce:transition-none"
      >
        {t(link.label)}
      </a>
    {/each}
  </nav>
{/snippet}

<!-- A sticky sidebar on wide screens, a collapsed list on small ones. -->
<aside class="lg:sticky lg:top-8 lg:self-start">
  <div class="hidden lg:block">
    <h2 class="px-3 text-sm font-semibold">{t("On this page")}</h2>
    {@render navigation()}
  </div>
  <details class="group border-border border-b pb-4 lg:hidden">
    <summary
      class="focus-visible:outline-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
    >
      {t("On this page")}
      <ChevronDownIcon
        class="text-muted-foreground size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
      />
    </summary>
    {@render navigation()}
  </details>
</aside>

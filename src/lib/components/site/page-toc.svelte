<script lang="ts">
  import { t } from "$lib/i18n/translate";

  let { links }: { links: readonly { id: string; label: string }[] } = $props();
</script>

<nav
  class="grid content-start gap-1 lg:sticky lg:top-24"
  aria-labelledby="page-toc"
>
  <h2 id="page-toc" class="text-muted-foreground px-3 pb-1 text-xs">
    {t("On this page")}
  </h2>
  <ul class="max-lg:bg-fill grid gap-0.5 max-lg:rounded-2xl max-lg:p-1.5">
    {#each links as link (link.id)}
      <li>
        <a
          class="text-muted-foreground hover:bg-fill hover:text-foreground flex min-h-8 items-center rounded-xl px-3 text-sm transition-colors duration-160 ease-out pointer-coarse:min-h-11"
          href="#{link.id}"
        >
          {t(link.label)}
        </a>
      </li>
    {/each}
  </ul>
</nav>

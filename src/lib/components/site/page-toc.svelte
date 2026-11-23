<script lang="ts">
  import { t } from "$lib/i18n/translate";

  let {
    links,
  }: {
    /** Section ids and English labels, translated here. */
    links: readonly { id: string; label: string }[];
  } = $props();
</script>

<nav aria-labelledby="page-toc">
  <h2 id="page-toc">{t("On this page")}</h2>
  <ul>
    {#each links as link (link.id)}
      <li><a href="#{link.id}">{t(link.label)}</a></li>
    {/each}
  </ul>
</nav>

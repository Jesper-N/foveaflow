<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import PageHero from "./page-hero.svelte";
  import SiteShell from "./site-shell.svelte";
</script>

<SiteShell path="/404/">
  <PageHero
    lede={t(
      "The page you’re looking for does not exist. Open the trainer or use the guide to find your next drill."
    )}
    title={t("This path ends here")}
  >
    {#snippet actions()}
      <a href="/">{t("Open FoveaFlow")}</a>
      <a href="/guide/">{t("Read the guide")}</a>
    {/snippet}
  </PageHero>
</SiteShell>

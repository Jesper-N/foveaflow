<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ThemeSelect from "$lib/components/theme-select.svelte";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { ModeWatcher } from "mode-watcher";
  import type { Snippet } from "svelte";

  let { path, children }: { path: string; children: Snippet } = $props();

  const footerLinks = [
    { href: "/guide/", label: "Guide" },
    ...Object.values(legalPageLinks).map(({ path: href, label }) => ({
      href,
      label,
    })),
  ];
</script>

<!-- The head script in base-layout.astro already applied the saved theme. -->
<ModeWatcher disableHeadScriptInjection />
<a class="sr-only focus:not-sr-only" href="#content">
  {t("Skip to content")}
</a>

<header>
  <a href="/">{siteMetadata.name}</a>
  <nav aria-label={t("Page navigation")}>
    {#if path !== "/guide/"}
      <a href="/guide/">{t("Guide")}</a>
    {/if}
    <a href="/">{t("Open FoveaFlow")}</a>
  </nav>
  <LanguageSelect />
  <ThemeSelect />
</header>

<main id="content" tabindex="-1">
  {@render children()}
</main>

<footer>
  <p>{t("FoveaFlow is free. No account, no paid plan.")}</p>
  <nav aria-label={t("Legal pages")}>
    {#each footerLinks as link (link.href)}
      <a
        aria-current={path === link.href ? "page" : undefined}
        href={link.href}
      >
        {t(link.label)}
      </a>
    {/each}
  </nav>
</footer>

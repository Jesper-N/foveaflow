<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ThemeSelect from "$lib/components/theme-select.svelte";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  import { startAgentBridge } from "../agent-bridge";
  import BrandMark from "../ui/brand-mark.svelte";
  import { buttonClass } from "../ui/button-variants";
  import { pageWidth, pillLink } from "./layout";

  let { path, children }: { path: string; children: Snippet } = $props();

  const footerLinks = [
    { href: "/guide/", label: "Guide" },
    ...Object.values(legalPageLinks).map(({ path: href, label }) => ({
      href,
      label,
    })),
  ];

  onMount(startAgentBridge);
</script>

<ModeWatcher
  disableHeadScriptInjection
  themeColors={{ dark: "#0a0a0a", light: "#ffffff" }}
/>
<a
  class="bg-primary text-md text-primary-foreground fixed inset-s-4 top-3 z-20 -translate-y-20 rounded-full px-4 py-2 font-medium focus-visible:translate-y-0"
  href="#content"
>
  {t("Skip to content")}
</a>

<div class="flex min-h-dvh flex-col">
  <header class="bg-background/88 sticky top-0 z-10 backdrop-blur-md">
    <div class={[pageWidth, "flex h-16 items-center gap-1"]}>
      <a
        class="text-md me-auto flex items-center gap-2.5 rounded-full font-medium"
        href="/"
      >
        <BrandMark class="size-8" />
        <span class="max-sm:sr-only">{siteMetadata.name}</span>
      </a>
      <nav class="flex items-center gap-1" aria-label={t("Page navigation")}>
        {#if path !== "/guide/"}
          <a class={pillLink} href="/guide/">{t("Guide")}</a>
        {/if}
        <a class={buttonClass("primary", "md")} href="/"
          >{t("Open FoveaFlow")}</a
        >
      </nav>
      <div class="flex items-center gap-1">
        <LanguageSelect compact />
        <ThemeSelect />
      </div>
    </div>
  </header>

  <main id="content" class="flex-1 outline-none" tabindex="-1">
    {@render children()}
  </main>

  <footer class="mt-24">
    <div
      class={[
        pageWidth,
        "text-muted-foreground flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between",
      ]}
    >
      <p class="flex items-center gap-2.5">
        <BrandMark class="size-6 rounded-md" />
        {t("FoveaFlow is free. No account, no paid plan.")}
      </p>
      <nav class="-mx-3 flex flex-wrap gap-1" aria-label={t("Legal pages")}>
        {#each footerLinks as link (link.href)}
          <a
            class={pillLink}
            aria-current={path === link.href ? "page" : undefined}
            href={link.href}
          >
            {t(link.label)}
          </a>
        {/each}
      </nav>
    </div>
  </footer>
</div>

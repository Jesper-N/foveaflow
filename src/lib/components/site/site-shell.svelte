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

  <footer class={[pageWidth, "mt-32 pb-6"]}>
    <div
      class="bg-card grid gap-10 rounded-4xl p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-10"
    >
      <div class="grid content-start gap-4">
        <a
          class="flex items-center gap-3 justify-self-start text-lg font-semibold"
          href="/"
        >
          <BrandMark class="size-10 rounded-xl" />
          {siteMetadata.name}
        </a>
        <p class="text-md text-muted-foreground max-w-sm text-pretty">
          {t("FoveaFlow is free. No account, no paid plan.")}
        </p>
      </div>
      <nav
        class="-mx-3 flex flex-wrap content-start gap-1 sm:flex-col sm:items-end"
        aria-label={t("Legal pages")}
      >
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

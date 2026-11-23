<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ThemeSelect from "$lib/components/theme-select.svelte";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import { ModeWatcher } from "mode-watcher";
  import type { Snippet } from "svelte";

  import { actionLink, textLink } from "./styles";

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
<div class="min-h-dvh">
  <a
    class="fixed top-3 left-3 z-50 -translate-y-24 bg-[Canvas] p-3 focus:translate-y-0"
    href="#content"
  >
    {t("Skip to content")}
  </a>

  <header class="border-b">
    <div
      class="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 sm:px-8"
    >
      <a
        class="flex items-center gap-2"
        aria-label={t("Open FoveaFlow")}
        href="/"
      >
        <img
          class="size-7"
          alt=""
          height="28"
          src="/logo-render/logo.svg"
          width="28"
        />
        {siteMetadata.name}
      </a>
      <nav
        class="flex flex-wrap items-center gap-4"
        aria-label={t("Page navigation")}
      >
        {#if path !== "/guide/"}
          <a class={actionLink} href="/guide/">
            <ArrowLeftIcon class="size-4" aria-hidden="true" />
            {t("Guide")}
          </a>
        {/if}
        <LanguageSelect />
        <a class={[actionLink, "max-sm:hidden"]} href="/">
          {t("Open FoveaFlow")}
          <ArrowUpRightIcon class="size-4" aria-hidden="true" />
        </a>
        <ThemeSelect />
      </nav>
    </div>
  </header>

  <main
    id="content"
    class="mx-auto max-w-7xl px-5 outline-none sm:px-8"
    tabindex="-1"
  >
    {@render children()}
  </main>

  <footer class="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
    <div
      class="flex flex-col gap-6 border-t py-8 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-2">
        <a class="self-start" href="/">{siteMetadata.name}</a>
        <p>{t("FoveaFlow is free. No account, no paid plan.")}</p>
      </div>
      <nav class="flex flex-wrap gap-6" aria-label={t("Legal pages")}>
        {#each footerLinks as link (link.href)}
          <a
            class={textLink}
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

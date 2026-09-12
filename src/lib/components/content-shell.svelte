<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ThemeSelect from "$lib/components/theme-select.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import type { Snippet } from "svelte";

  let {
    locale,
    path,
    children,
  }: { locale: AppLocale; path: string; children: Snippet } = $props();
  const links = [
    { href: "/guide/", label: "Guide" },
    { href: "/privacy/", label: "Privacy" },
    { href: "/terms/", label: "Terms" },
  ];
  const textLink =
    "rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";
</script>

<div class="bg-background text-foreground selection:bg-primary/25 min-h-dvh">
  <a
    href="#content"
    class="bg-primary text-primary-foreground fixed top-3 left-3 z-50 -translate-y-24 rounded-lg px-4 py-3 focus:translate-y-0"
    >{t(locale, "Skip to content")}</a
  >
  <header class="border-border/70 relative z-30 border-b">
    <div
      class="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
    >
      <a
        href="/"
        aria-label={t(locale, "Open FoveaFlow")}
        class="focus-visible:outline-ring flex shrink-0 items-center gap-2.5 rounded-sm text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <img
          src="/logo-small.jpg"
          alt=""
          width="28"
          height="28"
          class="size-7 rounded-sm"
        />
        FoveaFlow
      </a>
      <nav
        aria-label={t(locale, "Page navigation")}
        class="flex items-center gap-2 sm:gap-4"
      >
        {#if path !== "/guide/"}
          <a
            href="/guide/"
            aria-label={t(locale, "Guide")}
            title={t(locale, "Guide")}
            class={`${buttonVariants({ variant: "ghost", size: "sm" })} text-muted-foreground size-10 gap-2 rounded-lg p-0 sm:w-auto sm:px-3`}
          >
            <ArrowLeft class="size-4" /><span class="hidden sm:inline"
              >{t(locale, "Guide")}</span
            >
          </a>
        {/if}
        <LanguageSelect
          showSelectedName
          collapseNameOnSmall
          showFlag={false}
          size="sm"
          variant="ghost"
          triggerClass="max-w-44 data-[size=sm]:h-10 max-sm:size-10"
        />
        <Button href="/" size="lg" class="hidden gap-2 sm:inline-flex"
          >{t(locale, "Open FoveaFlow")}<ArrowUpRight class="size-4" /></Button
        >
        <ThemeSelect {locale} />
      </nav>
    </div>
  </header>
  <main
    id="content"
    tabindex="-1"
    class="mx-auto max-w-7xl px-5 outline-none sm:px-8 lg:px-12"
  >
    {@render children()}
  </main>
  <footer class="mx-auto mt-16 max-w-7xl px-5 sm:mt-24 sm:px-8 lg:px-12">
    <div
      class="border-border/70 flex flex-col gap-6 border-t py-8 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-2">
        <a href="/" class="font-semibold">FoveaFlow</a>
        <p class="text-muted-foreground text-sm">
          {t(locale, "FoveaFlow is free. No account, no paid plan.")}
        </p>
      </div>
      <nav aria-label={t(locale, "Legal pages")} class="flex flex-wrap gap-6">
        {#each links as link (link.href)}<a
            href={link.href}
            aria-current={path === link.href ? "page" : undefined}
            class={textLink}>{t(locale, link.label)}</a
          >{/each}
      </nav>
    </div>
  </footer>
</div>

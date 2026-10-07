<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ThemeSelect from "$lib/components/theme-select.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { cn } from "$lib/utils";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import { ModeWatcher } from "mode-watcher";
  import type { Snippet } from "svelte";

  import { textLink } from "./styles";

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
<div class="bg-background text-foreground selection:bg-primary/25 min-h-dvh">
  <a
    href="#content"
    class="bg-primary text-primary-foreground text-trim fixed top-3 left-3 z-50 -translate-y-24 rounded-lg px-4 py-3 focus:translate-y-0"
  >
    {t("Skip to content")}
  </a>

  <header class="border-border/70 relative z-30 border-b">
    <div
      class="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
    >
      <a
        href="/"
        aria-label={t("Open FoveaFlow")}
        class="focus-visible:outline-ring text-title flex shrink-0 items-center gap-2.5 rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <img
          src="/logo-render/logo.svg"
          alt=""
          width="28"
          height="28"
          class="size-7 rounded-sm"
        />
        {siteMetadata.name}
      </a>
      <nav
        aria-label={t("Page navigation")}
        class="flex items-center gap-2 sm:gap-4"
      >
        {#if path !== "/guide/"}
          <a
            href="/guide/"
            aria-label={t("Guide")}
            title={t("Guide")}
            class={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "text-muted-foreground size-10 gap-2 p-0 sm:w-auto sm:px-3"
            )}
          >
            <ArrowLeftIcon />
            <span class="hidden sm:inline">{t("Guide")}</span>
          </a>
        {/if}
        <LanguageSelect
          showSelectedName
          collapseNameOnSmall
          size="sm"
          variant="ghost"
          triggerClass="max-w-44 data-[size=sm]:h-10 max-sm:size-10"
        />
        <Button
          href="/"
          variant="outline"
          size="lg"
          class="hidden gap-2 sm:inline-flex"
        >
          {t("Open FoveaFlow")}
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
        <ThemeSelect />
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
        <a
          href="/"
          class="focus-visible:outline-ring text-subtitle self-start rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {siteMetadata.name}
        </a>
        <p class="text-muted-foreground text-caption">
          {t("FoveaFlow is free. No account, no paid plan.")}
        </p>
      </div>
      <nav aria-label={t("Legal pages")} class="flex flex-wrap gap-6">
        {#each footerLinks as link (link.href)}
          <a
            href={link.href}
            aria-current={path === link.href ? "page" : undefined}
            class={textLink}
          >
            {t(link.label)}
          </a>
        {/each}
      </nav>
    </div>
  </footer>
</div>

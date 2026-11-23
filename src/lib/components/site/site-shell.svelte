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
    class="bg-primary text-primary-foreground fixed top-3 left-3 z-50 -translate-y-24 rounded-lg px-4 py-3 focus:translate-y-0"
    href="#content"
  >
    {t("Skip to content")}
  </a>

  <header class="border-border/70 relative z-30 border-b">
    <div
      class="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
    >
      <a
        class="focus-visible:outline-ring flex shrink-0 items-center gap-2.5 rounded-sm text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label={t("Open FoveaFlow")}
        href="/"
      >
        <img
          class="size-7 rounded-sm"
          alt=""
          height="28"
          src="/logo-render/logo.svg"
          width="28"
        />
        {siteMetadata.name}
      </a>
      <nav
        class="flex items-center gap-2 sm:gap-4"
        aria-label={t("Page navigation")}
      >
        {#if path !== "/guide/"}
          <a
            class={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "text-muted-foreground size-10 gap-2 p-0 sm:w-auto sm:px-3"
            )}
            aria-label={t("Guide")}
            href="/guide/"
            title={t("Guide")}
          >
            <ArrowLeftIcon />
            <span class="hidden sm:inline">{t("Guide")}</span>
          </a>
        {/if}
        <LanguageSelect
          collapseNameOnSmall
          showSelectedName
          size="sm"
          triggerClass="max-w-44 data-[size=sm]:h-10 max-sm:size-10"
          variant="ghost"
        />
        <Button
          class="hidden gap-2 sm:inline-flex"
          href="/"
          size="lg"
          variant="outline"
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
    class="mx-auto max-w-7xl px-5 outline-none sm:px-8 lg:px-12"
    tabindex="-1"
  >
    {@render children()}
  </main>

  <footer class="mx-auto mt-16 max-w-7xl px-5 sm:mt-24 sm:px-8 lg:px-12">
    <div
      class="border-border/70 flex flex-col gap-6 border-t py-8 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-2">
        <a
          class="focus-visible:outline-ring self-start rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
          href="/"
        >
          {siteMetadata.name}
        </a>
        <p class="text-muted-foreground text-sm">
          {t("FoveaFlow is free. No account, no paid plan.")}
        </p>
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

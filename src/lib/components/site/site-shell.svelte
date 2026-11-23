<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import ThemeSelect from "$lib/components/theme-select.svelte";
  import { mainRouteForDrill } from "$lib/content/drill-routes";
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { t } from "$lib/i18n/translate";
  import { drills } from "$lib/trainer/settings/drills";
  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  import { startAgentBridge } from "../agent-bridge";
  import DrillIcon from "../icons/drill-icon.svelte";
  import BrandMark from "../ui/brand-mark.svelte";
  import { buttonClass } from "../ui/button-variants";
  import TooltipGroup from "../ui/tooltip-group.svelte";
  import { pageWidth, pillLink } from "./layout";

  let { path, children }: { path: string; children: Snippet } = $props();

  const footerLinks = [
    { href: "/guide/", label: "Guide" },
    ...Object.values(legalPageLinks).map(({ path: href, label }) => ({
      href,
      label,
    })),
  ];

  const drillLinks = drills.map((drill) => ({
    href: mainRouteForDrill(drill.id)?.path ?? "/",
    id: drill.id,
    label: drill.name,
  }));

  const footerLink =
    "flex items-center gap-2.5 text-md text-muted-foreground transition-colors duration-160 ease-out hover:text-foreground aria-[current=page]:text-foreground";

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
  <header
    class="bg-background sticky top-0 z-10 shadow-[0_1px_0_var(--background)]"
  >
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
      <TooltipGroup class="flex items-center gap-1" side="bottom">
        <LanguageSelect compact tip />
        <ThemeSelect />
      </TooltipGroup>
    </div>
  </header>

  <main id="content" class="flex-1 outline-none" tabindex="-1">
    {@render children()}
  </main>

  <footer class={[pageWidth, "mt-24 pb-6 lg:mt-32"]}>
    <div
      class="bg-card grid grid-cols-2 gap-x-6 gap-y-10 rounded-4xl p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-16"
    >
      <div class="col-span-2 grid content-start gap-4 md:col-span-1">
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
      <nav class="grid content-start gap-3" aria-labelledby="footer-drills">
        <h2 id="footer-drills" class="text-xs font-medium">{t("Drills")}</h2>
        {#each drillLinks as link (link.id)}
          <a
            class={footerLink}
            aria-current={path === link.href ? "page" : undefined}
            href={link.href}
          >
            <DrillIcon class="size-4" drillId={link.id} />
            {t(link.label)}
          </a>
        {/each}
      </nav>
      <nav class="grid content-start gap-3" aria-labelledby="footer-pages">
        <h2 id="footer-pages" class="text-xs font-medium">
          {siteMetadata.name}
        </h2>
        {#each footerLinks as link (link.href)}
          <a
            class={footerLink}
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

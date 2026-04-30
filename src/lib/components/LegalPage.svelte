<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { siteMetadata, type LegalPageContent } from "$lib/seo";

  let { page }: { page: LegalPageContent } = $props();

  const guideEnterTop = "guide-enter guide-enter-top";
  const guideEnterUp = "guide-enter guide-enter-up";
  const articleCard =
    "bg-card/70 shadow-[0_16px_36px_-30px_rgba(20,24,22,0.4)] backdrop-blur";
  const navLinks = [
    { href: "/guide/", label: "Guide" },
    { href: "/privacy/", label: "Privacy" },
    { href: "/terms/", label: "Terms" },
  ];
</script>

<main
  class="fixed inset-0 min-h-[100dvh] overflow-auto bg-background text-foreground selection:bg-accent/30"
>
  <div class="mx-auto grid w-full max-w-5xl gap-10 px-4 py-5 sm:px-6 lg:px-8">
    <header class={`flex items-center justify-between gap-4 ${guideEnterTop}`}>
      <Button
        href="/"
        variant="outline"
        class="pressable-ui"
        aria-label="Open Eye Trainer"
      >
        <ArrowLeftIcon class="size-4" />
        <span class="pl-1">Open Eye Trainer</span>
      </Button>

      <nav class="hidden items-center gap-1 sm:flex" aria-label="Legal pages">
        {#each navLinks as navLink (navLink.href)}
          <Button
            href={navLink.href}
            variant={page.path === navLink.href ? "outline" : "ghost"}
            size="sm"
            class="pressable-ui"
          >
            {navLink.label}
          </Button>
        {/each}
      </nav>
    </header>

    <section
      class={`grid gap-8 pt-10 pb-10 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:pt-20 md:pb-14 ${guideEnterUp}`}
    >
      <div>
        <Badge variant="secondary" class="mb-5 px-3 py-1">
          {page.label}
        </Badge>
        <h1
          class="max-w-[12ch] text-4xl leading-none font-semibold tracking-tight text-foreground md:text-6xl"
        >
          {page.title}
        </h1>
        <p
          class="mt-6 max-w-[41rem] text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
        >
          {page.summary}
        </p>
      </div>

      <Item.Root
        variant="outline"
        class={`border-border/80 p-5 ${articleCard}`}
      >
        <Item.Media
          variant="icon"
          class="size-10 rounded-lg border bg-muted text-accent"
        >
          {#if page.path === "/privacy/"}
            <ShieldCheckIcon class="size-5" />
          {:else}
            <FileTextIcon class="size-5" />
          {/if}
        </Item.Media>
        <Item.Content>
          <Item.Title class="line-clamp-none text-base">
            Updated April 28, 2026
          </Item.Title>
          <Item.Description class="line-clamp-none leading-6">
            This page is specific to this free browser tool.
          </Item.Description>
        </Item.Content>
      </Item.Root>
    </section>

    <section
      class={`grid gap-6 border-t border-border/60 pt-10 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 ${guideEnterUp}`}
    >
      <div class="md:sticky md:top-6 md:self-start">
        <Item.Root variant="muted" class="border border-border/70">
          <Item.Content>
            <Item.Title class="line-clamp-none text-sm">
              On this page
            </Item.Title>
            <nav class="mt-3 grid gap-1" aria-label="On this page">
              {#each page.sections as section (section.id)}
                <a
                  href={`#${section.id}`}
                  class="rounded-md px-2 py-1.5 text-sm leading-5 text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-background hover:text-foreground active:scale-[0.98]"
                >
                  {section.heading}
                </a>
              {/each}
            </nav>
          </Item.Content>
        </Item.Root>
      </div>

      <div class="grid gap-4 pb-6">
        {#each page.sections as section (section.id)}
          <article id={section.id} class="scroll-mt-6">
            <Item.Root
              variant="outline"
              class={`items-start border-border/80 p-5 md:p-6 ${articleCard}`}
            >
              <Item.Content>
                <Item.Title class="line-clamp-none text-lg">
                  {section.heading}
                </Item.Title>
                <div
                  class="mt-3 grid max-w-[46rem] gap-3 text-sm leading-6 text-muted-foreground"
                >
                  {#each section.body as paragraph (paragraph)}
                    <p>{paragraph}</p>
                  {/each}
                </div>

                {#if "links" in section && section.links?.length}
                  <div class="mt-4 flex flex-wrap gap-2">
                    {#each section.links as link (link.url)}
                      <Button
                        href={link.url}
                        variant="outline"
                        size="sm"
                        class="pressable-ui"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{link.label}</span>
                        <ExternalLinkIcon class="size-3" />
                      </Button>
                    {/each}
                  </div>
                {/if}
              </Item.Content>
            </Item.Root>
          </article>
        {/each}
      </div>
    </section>

    <footer
      class={`guide-enter-delay-1 flex flex-col gap-3 border-t border-border/60 pt-6 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between ${guideEnterUp}`}
    >
      <span>{siteMetadata.name} is free. No account, no paid plan.</span>
      <div class="flex flex-wrap gap-2">
        <Button href="/" variant="ghost" size="sm" class="pressable-ui">
          App
        </Button>
        <Button href="/guide/" variant="ghost" size="sm" class="pressable-ui">
          Guide
        </Button>
      </div>
    </footer>
  </div>
</main>

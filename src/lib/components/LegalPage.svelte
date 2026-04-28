<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { siteMetadata, type LegalPageContent } from "$lib/seo";

  let { page }: { page: LegalPageContent } = $props();

  const guideEnterTop = "guide-enter guide-enter-top";
  const guideEnterUp = "guide-enter guide-enter-up";
  const articleCard =
    "bg-card/70 shadow-[0_20px_40px_-28px_rgba(20,24,22,0.35)] backdrop-blur";
</script>

<main
  class="fixed inset-0 min-h-[100dvh] overflow-auto bg-background text-foreground selection:bg-accent/30"
>
  <div class="mx-auto grid w-full max-w-5xl gap-10 px-4 py-5 sm:px-6 lg:px-8">
    <nav class={`flex items-center justify-between gap-4 ${guideEnterTop}`}>
      <Button
        href="/"
        variant="outline"
        class="active:translate-y-px"
        aria-label="Open Eye Trainer"
      >
        <ArrowLeftIcon class="size-4" />
        <span class="pl-1">Open Eye Trainer</span>
      </Button>

      <div class="flex items-center gap-2">
        <Button href="/guide/" variant="ghost" size="sm">Guide</Button>
        <Button href="/privacy/" variant="ghost" size="sm">Privacy</Button>
        <Button href="/terms/" variant="ghost" size="sm">Terms</Button>
      </div>
    </nav>

    <section
      class={`grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:py-12 ${guideEnterUp}`}
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
        <p class="mt-6 max-w-[42rem] text-base leading-7 text-muted-foreground">
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

    <Separator />

    <section
      class={`grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)] ${guideEnterUp}`}
    >
      <aside class="md:sticky md:top-6 md:self-start">
        <Item.Root variant="muted" class="border border-border/70">
          <Item.Content>
            <Item.Title class="line-clamp-none">On this page</Item.Title>
            <div class="mt-3 grid gap-2">
              {#each page.sections as section (section.id)}
                <a
                  href={`#${section.id}`}
                  class="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  {section.heading}
                </a>
              {/each}
            </div>
          </Item.Content>
        </Item.Root>
      </aside>

      <div class="grid gap-4 pb-6">
        {#each page.sections as section (section.id)}
          <article id={section.id} class="scroll-mt-6">
            <Item.Root
              variant="outline"
              class={`items-start border-border/80 p-5 ${articleCard}`}
            >
              <Item.Content>
                <Item.Title class="line-clamp-none text-lg">
                  {section.heading}
                </Item.Title>
                <div
                  class="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground"
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
        <Button href="/" variant="ghost" size="sm">App</Button>
        <Button href="/guide/" variant="ghost" size="sm">Guide</Button>
      </div>
    </footer>
  </div>
</main>

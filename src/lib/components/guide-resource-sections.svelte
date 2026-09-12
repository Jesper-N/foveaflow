<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { guideFaqItems } from "$lib/content/page-copy";
  import { supportPages } from "$lib/content/support-pages";
  import { referenceLinks } from "$lib/content/training";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Plus from "@lucide/svelte/icons/plus";
  import Scan from "@lucide/svelte/icons/scan";
  import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";

  import {
    editorialHeading,
    editorialCopy,
    editorialSection,
  } from "./page-styles";

  let { locale }: { locale: AppLocale } = $props();
</script>

<section id="controls" class={editorialSection}>
  <h2 class={editorialHeading}>{t(locale, "Controls")}</h2>
  <p class={`${editorialCopy} mt-4`}>
    {t(
      locale,
      "Change speed and target size first. They usually have the biggest effect on difficulty and control."
    )}
  </p>
  <div
    class="divide-border bg-muted/30 mt-6 grid divide-y rounded-2xl sm:grid-cols-2 sm:divide-x sm:divide-y-0"
  >
    <div class="p-5 sm:p-6">
      <SlidersHorizontal class="text-muted-foreground mb-4 size-5" />
      <h3 class="mb-2 font-semibold">{t(locale, "Motion and target")}</h3>
      <p class="text-muted-foreground text-sm leading-6">
        {t(
          locale,
          "Speed, size, shape, color, opacity, and trail change the feel of the moving drills. Lilac Chaser has its own ball color and scale controls."
        )}
      </p>
    </div>
    <div class="p-5 sm:p-6">
      <Scan class="text-muted-foreground mb-4 size-5" />
      <h3 class="mb-2 font-semibold">{t(locale, "Screen scale")}</h3>
      <p class="text-muted-foreground text-sm leading-6">
        {t(
          locale,
          "Viewing distance and CSS pixels/cm help speed settings match your display setup more closely."
        )}
      </p>
    </div>
  </div>
</section>

<section id="more-guides" class={editorialSection}>
  <h2 class={editorialHeading}>{t(locale, "More guides")}</h2>
  <div class="divide-border mt-6 divide-y">
    {#each supportPages as page (page.slug)}
      <a
        href={page.path}
        class="group focus-visible:outline-ring flex items-start gap-5 rounded-sm py-6 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div class="flex-1">
          <h3
            class="group-hover:text-brand-foreground mb-2 font-semibold transition-colors"
          >
            {t(locale, page.heading)}
          </h3>
          <p class="text-muted-foreground text-sm leading-6">
            {t(locale, page.description)}
          </p>
        </div>
        <span
          class="bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors motion-reduce:transition-none"
          ><ArrowUpRight class="size-4" /></span
        >
      </a>
    {/each}
  </div>
</section>

<section id="faq" data-nosnippet class={editorialSection}>
  <h2 class={editorialHeading}>{t(locale, "Guide FAQ")}</h2>
  <div class="divide-border border-border mt-6 divide-y border-y">
    {#each guideFaqItems as item (item.question)}
      <details class="group py-5 open:pb-6">
        <summary
          class="focus-visible:outline-ring flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
        >
          {t(locale, item.question)}<Plus
            class="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
          />
        </summary>
        <p class={`${editorialCopy} mt-4 pr-10`}>{t(locale, item.answer)}</p>
      </details>
    {/each}
  </div>
</section>

<section id="references" class={editorialSection}>
  <h2 class={editorialHeading}>
    {t(locale, "Research and background reading")}
  </h2>
  <p class={`${editorialCopy} mt-4`}>
    {t(
      locale,
      "These sources explain the eye movements and visual effects behind the drills. They do not establish that FoveaFlow improves eyesight or game performance."
    )}
  </p>
  <ol class="divide-border mt-6 divide-y">
    {#each referenceLinks as reference (reference.url)}
      <li>
        <a
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-brand-foreground focus-visible:outline-ring flex items-baseline gap-4 rounded-sm py-4 text-sm leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          ><span class="flex-1">{t(locale, reference.label)}</span><ArrowUpRight
            class="size-4 shrink-0 self-center"
          /></a
        >
      </li>
    {/each}
  </ol>
</section>

<section
  class={`${editorialSection} flex flex-wrap items-center justify-between gap-6`}
>
  <div>
    <h2 class="text-xl font-semibold">{t(locale, "Ready to try a drill?")}</h2>
    <p class="text-muted-foreground mt-2 text-sm">
      {t(locale, "Start slow. Adjust as you go.")}
    </p>
  </div>
  <Button href="/" size="lg" class="h-11 gap-2 px-5"
    >{t(locale, "Open FoveaFlow")}<ArrowUpRight class="size-4" /></Button
  >
</section>

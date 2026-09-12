<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import ContentShell from "./content-shell.svelte";
  import {
    editorialEyebrow,
    editorialTitle,
    editorialCopy,
  } from "./page-styles";

  let locale = $derived(languageState.locale);
</script>

<ContentShell {locale} path="/404/">
  <section
    class="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-start justify-center gap-6 py-16"
  >
    <p
      aria-hidden="true"
      class="text-muted-foreground/30 text-7xl leading-none font-semibold tabular-nums"
    >
      404
    </p>
    <p class={editorialEyebrow}>{t(locale, "Page not found")}</p>
    <h1 class={editorialTitle}>{t(locale, "This path ends here.")}</h1>
    <p class={editorialCopy}>
      {t(
        locale,
        "The page you’re looking for does not exist. Open the trainer or use the guide to find your next drill."
      )}
    </p>
    <div class="flex flex-wrap gap-3">
      <Button href="/" size="lg" class="h-11 gap-2 px-5"
        >{t(locale, "Open FoveaFlow")}<ArrowUpRight
          data-icon="inline-end"
        /></Button
      >
      <Button href="/guide/" variant="outline" size="lg" class="h-11"
        >{t(locale, "Read the guide")}</Button
      >
    </div>
  </section>
</ContentShell>

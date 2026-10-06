<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import PageHero from "./page-hero.svelte";
  import SiteShell from "./site-shell.svelte";
  import { heroButton } from "./styles";
</script>

<SiteShell path="/404/">
  <div class="flex min-h-[60dvh] flex-col justify-center">
    <PageHero
      title={t("This path ends here")}
      lede={t(
        "The page you’re looking for does not exist. Open the trainer or use the guide to find your next drill."
      )}
    >
      {#snippet actions()}
        <Button href="/" size="lg" class={heroButton}>
          {t("Open FoveaFlow")}
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
        <Button href="/guide/" variant="ghost" size="lg" class="h-11 gap-2">
          {t("Read the guide")}
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      {/snippet}
      {#snippet illustration()}
        <!-- A tracking path that trails off before reaching its target. -->
        <svg
          viewBox="0 0 240 140"
          width="240"
          height="140"
          fill="none"
          aria-hidden="true"
          class="text-foreground relative h-auto w-full"
        >
          <path
            d="M20 70H220M120 14V126"
            class="stroke-border"
            stroke-dasharray="2 5"
          />
          <path
            d="M30 108C48 62 90 44 124 64"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M124 64C146 77 164 70 178 56"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray="0.1 7"
            opacity=".6"
          />
          <circle
            cx="202"
            cy="38"
            r="9"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="3 4"
            opacity=".5"
          />
        </svg>
      {/snippet}
    </PageHero>
  </div>
</SiteShell>

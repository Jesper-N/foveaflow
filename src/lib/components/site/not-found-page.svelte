<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import PageHero from "./page-hero.svelte";
  import SiteShell from "./site-shell.svelte";
  import { actionLink } from "./styles";
</script>

<SiteShell path="/404/">
  <div class="flex min-h-[60dvh] flex-col justify-center">
    <PageHero
      lede={t(
        "The page you’re looking for does not exist. Open the trainer or use the guide to find your next drill."
      )}
      title={t("This path ends here")}
    >
      {#snippet actions()}
        <a class={actionLink} href="/">
          {t("Open FoveaFlow")}
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
        <a class={actionLink} href="/guide/">
          {t("Read the guide")}
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      {/snippet}
      {#snippet illustration()}
        <!-- A tracking path that trails off before reaching its target. -->
        <svg
          class="relative h-auto w-full"
          aria-hidden="true"
          fill="none"
          height="140"
          viewBox="0 0 240 140"
          width="240"
        >
          <path
            d="M20 70H220M120 14V126"
            opacity=".2"
            stroke="currentColor"
            stroke-dasharray="2 5"
          />
          <path
            d="M30 108C48 62 90 44 124 64"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          />
          <path
            d="M124 64C146 77 164 70 178 56"
            opacity=".6"
            stroke="currentColor"
            stroke-dasharray="0.1 7"
            stroke-linecap="round"
            stroke-width="2"
          />
          <circle
            cx="202"
            cy="38"
            opacity=".5"
            r="9"
            stroke="currentColor"
            stroke-dasharray="3 4"
            stroke-width="2"
          />
        </svg>
      {/snippet}
    </PageHero>
  </div>
</SiteShell>

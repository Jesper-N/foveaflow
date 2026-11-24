<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import PathEndArt from "../icons/path-end-art.svelte";
  import { buttonClass } from "../ui/button-variants";
  import { pageWidth } from "./layout";
  import SiteShell from "./site-shell.svelte";
</script>

<SiteShell path="/404/">
  <div
    class={[
      pageWidth,
      "grid justify-items-center gap-8 pt-16 text-center sm:pt-24",
    ]}
  >
    <div class="bg-card w-full max-w-md rounded-4xl p-2">
      <PathEndArt class="aspect-8/5 w-full rounded-3xl" />
    </div>
    <div
      class="motion-safe:animate-rise grid max-w-lg justify-items-center gap-4"
    >
      <h1 class="text-2xl font-semibold text-balance sm:text-3xl">
        {t("This path ends here")}
      </h1>
      <p class="text-muted-foreground text-base text-pretty">
        {t("The page you’re looking for does not exist.")}
      </p>
      <div class="flex flex-wrap justify-center gap-2 pt-2">
        <a class={buttonClass("primary", "lg")} href="/"
          >{t("Open FoveaFlow")}</a
        >
        <a class={buttonClass("secondary", "lg")} href="/guide/"
          >{t("Read the guide")}</a
        >
      </div>
    </div>
  </div>
</SiteShell>

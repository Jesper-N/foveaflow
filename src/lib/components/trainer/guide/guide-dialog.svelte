<script lang="ts">
  import { legalPageLinks } from "$lib/content/legal";
  import { siteMetadata } from "$lib/content/site";
  import { formatDate, t } from "$lib/i18n/translate";

  import { showModalWhen } from "../modal-dialog";
  import { getTrainer } from "../trainer-context";
  import DrillGuide from "./drill-guide.svelte";
  import HomeGuide from "./home-guide.svelte";

  const trainer = getTrainer();
  const showGuide = showModalWhen(() => trainer.guideOpen);
</script>

<dialog
  id="trainer-guide"
  {@attach showGuide}
  aria-labelledby="trainer-guide-title"
  onclose={() => (trainer.guideOpen = false)}
>
  <form method="dialog">
    <button type="submit">{t("Close")}</button>
  </form>

  {#if trainer.guideRoute}
    <DrillGuide route={trainer.guideRoute} />
  {:else}
    <HomeGuide />
  {/if}

  <footer>
    <p>
      {t("Updated")}
      <time datetime={trainer.guideLastModified}>
        {formatDate(trainer.guideLastModified)}
      </time>
    </p>
    <a href="/guide/">{t("Read full guide")}</a>
    <a
      href={siteMetadata.repositoryUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {t("Source")}
    </a>
    <a href={legalPageLinks.privacy.path}>{t(legalPageLinks.privacy.label)}</a>
    <a href={legalPageLinks.terms.path}>{t(legalPageLinks.terms.label)}</a>
  </footer>
</dialog>

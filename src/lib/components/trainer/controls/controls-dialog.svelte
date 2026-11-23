<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import { showModalWhen } from "../modal-dialog";
  import { getTrainer } from "../trainer-context";
  import DrillSettings from "./drill-settings.svelte";
  import GeneralSettings from "./general-settings.svelte";
  import TargetSettings from "./target-settings.svelte";

  const trainer = getTrainer();
  const showControls = showModalWhen(() => trainer.controlsOpen);
</script>

<dialog
  {@attach showControls}
  aria-describedby="trainer-controls-description"
  aria-labelledby="trainer-controls-title"
  onclose={() => (trainer.controlsOpen = false)}
>
  <h2 id="trainer-controls-title">{t("Controls")}</h2>
  <p id="trainer-controls-description">
    {t("Change your saved FoveaFlow settings.")}
  </p>

  <DrillSettings />
  <TargetSettings />
  <GeneralSettings />

  <p>{t("Settings save automatically.")}</p>
  <form method="dialog">
    <button type="submit">{t("Done")}</button>
  </form>
</dialog>

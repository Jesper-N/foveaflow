<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { t } from "$lib/i18n/translate";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "../../theme-options";
  import { getTrainer } from "../trainer-context";
  import RadioGroup from "./radio-group.svelte";

  const trainer = getTrainer();
  let resetDialog = $state<HTMLDialogElement>();

  let resetDescription = $derived(
    t(
      "Restore the selected drill to its default behavior, visuals, and saved local settings."
    )
  );

  let themeChoices = $derived(
    themeOptions.map((option) => ({
      label: t(option.label),
      value: option.value,
    }))
  );
</script>

<section aria-labelledby="trainer-general-settings">
  <h3 id="trainer-general-settings">{t("General")}</h3>
  <p>{t("Language, theme, and saved preferences.")}</p>

  <LanguageSelect />

  <RadioGroup
    name="trainer-theme"
    legend={t("Theme")}
    onValueChange={selectTheme}
    options={themeChoices}
    value={userPrefersMode.current}
  />

  <div>
    <h4>{t("Defaults")}</h4>
    <p>{resetDescription}</p>
    <button onclick={() => resetDialog?.showModal()} type="button">
      {t("Reset to defaults")}
    </button>
  </div>
</section>

<dialog
  bind:this={resetDialog}
  aria-describedby="trainer-reset-description"
  aria-labelledby="trainer-reset-title"
  role="alertdialog"
>
  <h2 id="trainer-reset-title">{t("Reset to defaults?")}</h2>
  <p id="trainer-reset-description">{resetDescription}</p>
  <form method="dialog">
    <button type="submit">{t("Cancel")}</button>
    <button onclick={trainer.resetSettings} type="submit">
      {t("Reset to defaults")}
    </button>
  </form>
</dialog>

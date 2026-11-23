<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { t } from "$lib/i18n/translate";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "../../theme-options";
  import { getTrainer } from "../trainer-context";
  import RadioGroup from "./radio-group.svelte";
  import SettingsRow from "./settings-row.svelte";
  import SettingsSection from "./settings-section.svelte";

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

<SettingsSection label={t("General")}>
  <SettingsRow>
    <label for="trainer-language">{t("Language")}</label>
    <LanguageSelect id="trainer-language" />
  </SettingsRow>

  <RadioGroup
    name="trainer-theme"
    legend={t("Theme")}
    onValueChange={selectTheme}
    options={themeChoices}
    value={userPrefersMode.current}
  />

  <SettingsRow>
    <p>{t("Defaults")}</p>
    <p>{resetDescription}</p>
    <button
      class="inline-flex min-h-11 items-center gap-2 self-start"
      onclick={() => resetDialog?.showModal()}
      type="button"
    >
      <RotateCcwIcon class="size-4" aria-hidden="true" />
      {t("Reset to defaults")}
    </button>
  </SettingsRow>
</SettingsSection>

<dialog
  bind:this={resetDialog}
  class="m-auto max-w-sm p-6"
  aria-describedby="trainer-reset-description"
  aria-labelledby="trainer-reset-title"
  role="alertdialog"
>
  <h2 id="trainer-reset-title">{t("Reset to defaults?")}</h2>
  <p id="trainer-reset-description">{resetDescription}</p>
  <form class="mt-4 flex justify-end gap-2" method="dialog">
    <button class="min-h-11" type="submit">{t("Cancel")}</button>
    <button class="min-h-11" onclick={trainer.resetSettings} type="submit">
      {t("Reset to defaults")}
    </button>
  </form>
</dialog>

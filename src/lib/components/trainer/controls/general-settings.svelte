<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Field from "$lib/components/ui/field";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { t } from "$lib/i18n/translate";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "../../theme-options";
  import { getTrainer } from "../trainer-context";
  import SettingsRow from "./settings-row.svelte";
  import SettingsSection from "./settings-section.svelte";

  const trainer = getTrainer();
  let resetConfirmOpen = $state(false);

  let resetDescription = $derived(
    t(
      "Restore the selected drill to its default behavior, visuals, and saved local settings."
    )
  );

  const confirmReset = () => {
    trainer.resetSettings();
    resetConfirmOpen = false;
  };
</script>

<SettingsSection label={t("General")}>
  <SettingsRow>
    <Field.FieldTitle>{t("Language")}</Field.FieldTitle>
    <LanguageSelect showSelectedName triggerClass="min-h-11 w-full" />
  </SettingsRow>

  <SettingsRow>
    <Field.FieldTitle id="trainer-theme-label">{t("Theme")}</Field.FieldTitle>
    <ToggleGroup.Root
      type="single"
      class="grid w-full grid-cols-3"
      bind:value={() => userPrefersMode.current, selectTheme}
      variant="outline"
      aria-labelledby="trainer-theme-label"
    >
      {#each themeOptions as option (option.value)}
        <ToggleGroup.Item value={option.value} class="min-h-11 px-2">
          <option.icon data-icon="inline-start" />{t(option.label)}
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </SettingsRow>

  <SettingsRow>
    <Field.FieldContent>
      <Field.FieldTitle>{t("Defaults")}</Field.FieldTitle>
      <Field.FieldDescription>{resetDescription}</Field.FieldDescription>
    </Field.FieldContent>
    <div class="flex @lg/field-group:justify-end">
      <AlertDialog.Root bind:open={resetConfirmOpen}>
        <AlertDialog.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              class="h-auto min-h-11 max-w-full whitespace-normal"
              variant="outline"
            >
              <RotateCcwIcon data-icon="inline-start" />
              {t("Reset to defaults")}
            </Button>
          {/snippet}
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{t("Reset to defaults?")}</AlertDialog.Title>
            <AlertDialog.Description>
              {resetDescription}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>{t("Cancel")}</AlertDialog.Cancel>
            <AlertDialog.Action variant="destructive" onclick={confirmReset}>
              {t("Reset to defaults")}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  </SettingsRow>
</SettingsSection>

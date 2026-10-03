<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { setMode, userPrefersMode } from "mode-watcher";

  import {
    settingsRowClass,
    settingsRowsClass,
    settingsSectionClass,
  } from "./settings-styles";

  let { actions }: { actions: TrainerDialogActions } = $props();
  let locale = $derived(languageState.locale);
  let resetConfirmOpen = $state(false);

  const handleThemeChange = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setMode(value);
    }
  };

  const confirmReset = () => {
    actions.resetSettings();
    resetConfirmOpen = false;
  };
</script>

<Field.FieldSet class={settingsSectionClass} aria-label={t(locale, "General")}>
  <Field.FieldGroup class={settingsRowsClass}>
    <Field.Field class={settingsRowClass}>
      <Field.Title>{t(locale, "Language")}</Field.Title>
      <LanguageSelect showSelectedName triggerClass="min-h-11 w-full" />
    </Field.Field>
    <Field.Field class={settingsRowClass}>
      <Field.Title id="trainer-theme-label">{t(locale, "Theme")}</Field.Title>
      <ToggleGroup.Root
        type="single"
        class="grid w-full grid-cols-3"
        bind:value={() => userPrefersMode.current, handleThemeChange}
        variant="outline"
        aria-labelledby="trainer-theme-label"
      >
        <ToggleGroup.Item value="light" class="min-h-11 px-2">
          <SunIcon data-icon="inline-start" />{t(locale, "Light")}
        </ToggleGroup.Item>
        <ToggleGroup.Item value="dark" class="min-h-11 px-2">
          <MoonIcon data-icon="inline-start" />{t(locale, "Dark")}
        </ToggleGroup.Item>
        <ToggleGroup.Item value="system" class="min-h-11 px-2">
          <MonitorIcon data-icon="inline-start" />{t(locale, "System")}
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </Field.Field>
    <Field.Field class={settingsRowClass}>
      <Field.Content>
        <Field.Title>{t(locale, "Defaults")}</Field.Title>
        <Field.Description>
          {t(
            locale,
            "Restore the selected drill to its default behavior, visuals, and saved local settings."
          )}
        </Field.Description>
      </Field.Content>
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
                {t(locale, "Reset to defaults")}
              </Button>
            {/snippet}
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title
                >{t(locale, "Reset to defaults?")}</AlertDialog.Title
              >
              <AlertDialog.Description>
                {t(
                  locale,
                  "Restore the selected drill to its default behavior, visuals, and saved local settings."
                )}
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>{t(locale, "Cancel")}</AlertDialog.Cancel>
              <AlertDialog.Action variant="destructive" onclick={confirmReset}>
                {t(locale, "Reset to defaults")}
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </Field.Field>
  </Field.FieldGroup>
</Field.FieldSet>

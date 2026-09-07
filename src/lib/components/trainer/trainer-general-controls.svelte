<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";

  import { settingsSectionClass } from "./settings-styles";

  let { actions }: { actions: TrainerDialogActions } = $props();
  let locale = $derived(languageState.locale);
</script>

<Field.FieldSet class={settingsSectionClass}>
  <Field.Legend>{t(locale, "Language")}</Field.Legend>
  <Field.Field>
    <LanguageSelect showSelectedName triggerClass="min-h-11 w-full" />
  </Field.Field>
</Field.FieldSet>
<Field.FieldSet class={settingsSectionClass}>
  <Field.Legend>{t(locale, "Defaults")}</Field.Legend>
  <Field.Description>
    {t(
      locale,
      "Restore the selected drill to its default behavior, visuals, calibration, and saved local settings."
    )}
  </Field.Description>
  <Button
    class="h-auto min-h-11 max-w-full justify-start self-start whitespace-normal"
    variant="outline"
    onclick={actions.resetSettings}
  >
    <RotateCcwIcon data-icon="inline-start" />
    {t(locale, "Reset to defaults")}
  </Button>
</Field.FieldSet>

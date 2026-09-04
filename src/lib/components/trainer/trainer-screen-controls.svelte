<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import { trainerSettingBounds } from "$lib/trainer/settings";

  let {
    actions,
    settings = $bindable(),
    canToggleDirection,
  }: {
    actions: TrainerDialogActions;
    settings: TrainerSettings;
    canToggleDirection: boolean;
  } = $props();

  const handleShowTrailChange = (checked: boolean) => {
    if (!canToggleDirection) {
      return;
    }
    settings.showTrail = checked;
  };

  const handleViewingDistanceInput = (event: Event) => {
    actions.handleCalibrationInput(event, "viewingDistanceCm");
  };

  const handleCssPixelsPerCmInput = (event: Event) => {
    actions.handleCalibrationInput(event, "cssPxPerCm");
  };

  let locale = $derived(languageState.locale);
</script>

<div class="grid gap-3 sm:grid-cols-2">
  <Field.Field>
    <Field.Label for="trainer-distance">
      {t(locale, "Viewing distance")}
    </Field.Label>
    <Input
      id="trainer-distance"
      type="number"
      min={trainerSettingBounds.viewingDistanceCm.min}
      max={trainerSettingBounds.viewingDistanceCm.max}
      value={settings.calibration.viewingDistanceCm}
      oninput={handleViewingDistanceInput}
    />
  </Field.Field>
  <Field.Field>
    <Field.Label for="trainer-css-px-cm">
      {t(locale, "CSS pixels/cm")}
    </Field.Label>
    <Input
      id="trainer-css-px-cm"
      type="number"
      min={trainerSettingBounds.cssPxPerCm.min}
      max={trainerSettingBounds.cssPxPerCm.max}
      step="0.1"
      value={settings.calibration.cssPxPerCm}
      oninput={handleCssPixelsPerCmInput}
    />
  </Field.Field>
</div>
<Field.Field orientation="horizontal" class="min-h-12 justify-between">
  <Field.Label for="trainer-show-trail" class="text-base font-medium">
    {t(locale, "Show trail")}
  </Field.Label>
  <Switch
    id="trainer-show-trail"
    checked={settings.showTrail && canToggleDirection}
    onCheckedChange={handleShowTrailChange}
    disabled={!canToggleDirection}
    aria-label={t(locale, "Show trail")}
  />
</Field.Field>

<script lang="ts">
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import {
    trainerSettingBounds,
    type CalibrationField,
  } from "$lib/trainer/settings";

  let {
    settings = $bindable(),
    canToggleDirection,
    handleCalibrationInput,
  }: {
    settings: TrainerSettings;
    canToggleDirection: boolean;
    handleCalibrationInput: (event: Event, field: CalibrationField) => void;
  } = $props();

  const handleShowTrailChange = (checked: boolean) => {
    if (!canToggleDirection) return;
    settings.showTrail = checked;
  };
</script>

<div class="grid gap-3 sm:grid-cols-2">
  <Field.Field>
    <Field.Label for="trainer-distance">Viewing distance</Field.Label>
    <Input
      id="trainer-distance"
      type="number"
      min={trainerSettingBounds.viewingDistanceCm.min}
      max={trainerSettingBounds.viewingDistanceCm.max}
      value={settings.calibration.viewingDistanceCm}
      oninput={(event) => handleCalibrationInput(event, "viewingDistanceCm")}
    />
  </Field.Field>
  <Field.Field>
    <Field.Label for="trainer-css-px-cm">CSS pixels/cm</Field.Label>
    <Input
      id="trainer-css-px-cm"
      type="number"
      min={trainerSettingBounds.cssPxPerCm.min}
      max={trainerSettingBounds.cssPxPerCm.max}
      step="0.1"
      value={settings.calibration.cssPxPerCm}
      oninput={(event) => handleCalibrationInput(event, "cssPxPerCm")}
    />
  </Field.Field>
</div>
<div class="flex min-h-12 items-center justify-between gap-4">
  <span class="text-base font-medium">Show trail</span>
  <Switch
    checked={settings.showTrail && canToggleDirection}
    onCheckedChange={handleShowTrailChange}
    disabled={!canToggleDirection}
    aria-label="Show trail"
  />
</div>

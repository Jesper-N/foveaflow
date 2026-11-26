<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { isPursuitPattern } from "$lib/trainer/settings/patterns";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import PatternGlyph from "../../icons/pattern-glyph.svelte";
  import Segmented from "../../ui/segmented.svelte";
  import Select from "../../ui/select.svelte";
  import Switch from "../../ui/switch.svelte";
  import {
    behaviorGroups,
    drillGroups,
    patternGroups,
  } from "../select-options";
  import { getTrainer } from "../trainer-context";
  import SettingSlider from "./setting-slider.svelte";
  import SettingsSection from "./settings-section.svelte";

  const trainer = getTrainer();
</script>

<SettingsSection id="trainer-exercise-settings">
  <Select
    groups={drillGroups()}
    label={t("Drill")}
    onValueChange={trainer.selectDrill}
    value={trainer.settings.drillId}
  >
    {#snippet icon(drillId)}
      <DrillIcon class="size-4.5" {drillId} />
    {/snippet}
  </Select>
  {#if trainer.isPursuit}
    <Select
      groups={patternGroups()}
      label={t("Motion path")}
      onValueChange={trainer.selectPattern}
      value={trainer.settings.patternId}
    >
      {#snippet icon(patternId)}
        {#if isPursuitPattern(patternId)}
          <PatternGlyph class="h-4 w-5.5" {patternId} />
        {/if}
      {/snippet}
    </Select>
  {/if}
</SettingsSection>

{#if !trainer.isLilacChaser}
  <SettingsSection id="trainer-motion-settings" title={t("Motion")}>
    <Select
      groups={behaviorGroups()}
      label={t("Motion feel")}
      onValueChange={trainer.selectBehavior}
      value={trainer.behavior}
    />
    <SettingSlider label={t("Speed")} setting="speed" />
    {#if trainer.canReverse}
      <div class="flex items-center justify-between gap-3" data-setting-row>
        <span class="text-md min-w-0 truncate font-medium" aria-hidden="true">
          {t("Direction")}
        </span>
        <Segmented
          label={t("Direction")}
          onValueChange={trainer.setDirection}
          options={[
            { label: t("Forward"), value: "forward" },
            { label: t("Reverse"), value: "reverse" },
          ]}
          value={trainer.settings.motionDirection === 1 ? "forward" : "reverse"}
        />
      </div>
      <Switch
        label={t("Show trail")}
        bind:checked={trainer.settings.showTrail}
      />
    {/if}
  </SettingsSection>
{/if}

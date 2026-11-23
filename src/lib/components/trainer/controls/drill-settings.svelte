<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { isPursuitPattern } from "$lib/trainer/settings/patterns";

  import DrillIcon from "../../icons/drill-icon.svelte";
  import PatternGlyph from "../../icons/pattern-glyph.svelte";
  import Segmented from "../../ui/segmented.svelte";
  import Select from "../../ui/select.svelte";
  import { settingsGroup } from "../../ui/styles";
  import Switch from "../../ui/switch.svelte";
  import {
    behaviorGroups,
    drillGroups,
    patternGroups,
  } from "../select-options";
  import { getTrainer } from "../trainer-context";
  import SettingSlider from "./setting-slider.svelte";
  import SettingsIntro from "./settings-intro.svelte";

  const trainer = getTrainer();
</script>

<SettingsIntro>{t("Choose your exercise and how it moves.")}</SettingsIntro>

<div class={settingsGroup}>
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
</div>

{#if !trainer.isLilacChaser}
  <section class={settingsGroup} aria-labelledby="trainer-motion-settings">
    <h3
      id="trainer-motion-settings"
      class="text-muted-foreground text-sm font-medium"
    >
      {t("Motion")}
    </h3>
    <Select
      groups={behaviorGroups()}
      label={t("Motion feel")}
      onValueChange={trainer.selectBehavior}
      value={trainer.behavior}
    />
    <SettingSlider label={t("Speed")} setting="speed" />
    {#if trainer.canReverse}
      <div class="flex items-center justify-between gap-3">
        <span class="text-md font-medium" aria-hidden="true"
          >{t("Direction")}</span
        >
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
  </section>
{/if}

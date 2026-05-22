<script lang="ts">
  import type { Snippet } from "svelte";

  import ModePathPreview from "$lib/components/ModePathPreview.svelte";
  import TrainerPatternSelectGroups from "$lib/components/trainer/TrainerPatternSelectGroups.svelte";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { exercisePresets, type TrainerSettings } from "$lib/engine/presets";
  import {
    behaviorOptions,
    getBehaviorName,
    getLilacChaserColorName,
    getPatternName,
    getPresetName,
    lilacChaserColorOptions,
    type BehaviorId,
  } from "$lib/trainer/options";
  import {
    trainerSettingBounds,
    type TrainerSliderValue,
  } from "$lib/trainer/settings";

  let {
    settings,
    isLilacChaserMode,
    behaviorValue,
    patternSelectContentClass,
    handlePresetChange,
    handlePatternChange,
    handleBehaviorChange,
    handleLilacChaserColorChange,
    lilacChaserScaleSliderValue,
    setLilacChaserScaleSliderValue,
    sliderRow,
  }: {
    settings: TrainerSettings;
    isLilacChaserMode: boolean;
    behaviorValue: BehaviorId;
    patternSelectContentClass: string;
    handlePresetChange: (value: string) => void;
    handlePatternChange: (value: string) => void;
    handleBehaviorChange: (value: string) => void;
    handleLilacChaserColorChange: (value: string) => void;
    lilacChaserScaleSliderValue: () => number[];
    setLilacChaserScaleSliderValue: (value: TrainerSliderValue) => void;
    sliderRow: Snippet<[string, string]>;
  } = $props();
</script>

<Field.Field>
  <Field.Label for="trainer-mode">Drill</Field.Label>
  <Select.Root
    type="single"
    value={settings.presetId}
    onValueChange={handlePresetChange}
  >
    <Select.Trigger id="trainer-mode" class="w-full" aria-label="Drill">
      {getPresetName(settings.presetId)}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each exercisePresets as preset (preset.id)}
          <Select.Item value={preset.id}>
            <span class="flex min-w-0 items-center gap-2">
              <ModePathPreview mode={preset.id} compact />
              <span class="truncate">{preset.name}</span>
            </span>
          </Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</Field.Field>

{#if settings.presetId === "pursuit"}
  <Field.Field>
    <Field.Label for="trainer-pattern">Motion path</Field.Label>
    <Select.Root
      type="single"
      value={settings.patternId}
      onValueChange={handlePatternChange}
    >
      <Select.Trigger
        id="trainer-pattern"
        class="w-full"
        aria-label="Motion path"
      >
        {getPatternName(settings.patternId)}
      </Select.Trigger>
      <Select.Content class={patternSelectContentClass}>
        <TrainerPatternSelectGroups />
      </Select.Content>
    </Select.Root>
  </Field.Field>
{/if}

{#if !isLilacChaserMode}
  <Field.Field>
    <Field.Label for="trainer-behavior">Motion feel</Field.Label>
    <Select.Root
      type="single"
      value={behaviorValue}
      onValueChange={handleBehaviorChange}
    >
      <Select.Trigger
        id="trainer-behavior"
        class="w-full"
        aria-label="Motion feel"
      >
        {getBehaviorName(behaviorValue)}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each behaviorOptions as option (option.id)}
            <Select.Item value={option.id}>{option.name}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </Field.Field>
{:else}
  <Field.Field>
    <Field.Label for="lilac-chaser-color">Ball color</Field.Label>
    <Select.Root
      type="single"
      value={settings.lilacChaserBallColor}
      onValueChange={handleLilacChaserColorChange}
    >
      <Select.Trigger
        id="lilac-chaser-color"
        class="w-full"
        aria-label="Lilac Chaser ball color"
      >
        <span class="flex min-w-0 items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            class="size-3 shrink-0 rounded-full border border-border/60"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="6" fill={settings.lilacChaserBallColor} />
          </svg>
          <span class="truncate">
            {getLilacChaserColorName(settings.lilacChaserBallColor)}
          </span>
        </span>
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each lilacChaserColorOptions as option (option.id)}
            <Select.Item value={option.id}>
              <span class="flex min-w-0 items-center gap-2">
                <svg
                  viewBox="0 0 12 12"
                  class="size-3 shrink-0 rounded-full border border-border/60"
                  aria-hidden="true"
                >
                  <circle cx="6" cy="6" r="6" fill={option.id} />
                </svg>
                <span class="truncate">{option.name}</span>
              </span>
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </Field.Field>
  <Field.Field>
    {@render sliderRow("Scale", `${settings.lilacChaserScale.toFixed(2)}x`)}
    <Slider
      bind:value={lilacChaserScaleSliderValue, setLilacChaserScaleSliderValue}
      min={trainerSettingBounds.lilacChaserScale.min}
      max={trainerSettingBounds.lilacChaserScale.max}
      step={0.05}
      aria-label="Lilac Chaser scale"
    />
  </Field.Field>
{/if}

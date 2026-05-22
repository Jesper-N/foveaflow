<script lang="ts">
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";

  import TrainerControlSectionIcon from "$lib/components/trainer/TrainerControlSectionIcon.svelte";
  import TrainerDrillControls from "$lib/components/trainer/TrainerDrillControls.svelte";
  import TrainerMotionControls from "$lib/components/trainer/TrainerMotionControls.svelte";
  import TrainerScreenControls from "$lib/components/trainer/TrainerScreenControls.svelte";
  import TrainerSessionControls from "$lib/components/trainer/TrainerSessionControls.svelte";
  import TrainerSettingsSection from "$lib/components/trainer/TrainerSettingsSection.svelte";
  import TrainerTargetControls from "$lib/components/trainer/TrainerTargetControls.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import type {
    BehaviorId,
    ControlSection,
    ControlSectionId,
  } from "$lib/trainer/options";
  import type {
    CalibrationField,
    TrainerSliderValue,
  } from "$lib/trainer/settings";

  let {
    open = $bindable(false),
    settings = $bindable(),
    availableControlSections,
    currentControlSection,
    currentControlSectionLabel,
    onControlSectionChange,
    motionPaused,
    motionDirectionLabel,
    canToggleDirection,
    colorMode,
    isDarkMode,
    isMotMode,
    isLilacChaserMode,
    behaviorValue,
    patternSelectContentClass,
    handlePresetChange,
    handlePatternChange,
    handleBehaviorChange,
    handleLilacChaserColorChange,
    handleShapeChange,
    handleLetterWeightChange,
    handleThemeCheckedChange,
    handleSpeedUnitChange,
    handleColorInput,
    handleLetterColorInput,
    handleCalibrationInput,
    speedSliderValue,
    setSpeedSliderValue,
    sizeSliderValue,
    setSizeSliderValue,
    lilacChaserScaleSliderValue,
    setLilacChaserScaleSliderValue,
    opacitySliderValue,
    setOpacitySliderValue,
    targetCountSliderValue,
    setTargetCountSliderValue,
    distractorCountSliderValue,
    setDistractorCountSliderValue,
    distractorBrightnessSliderValue,
    setDistractorBrightnessSliderValue,
    letterScaleSliderValue,
    setLetterScaleSliderValue,
    toggleMotionPaused,
    toggleMotionDirection,
    resetSettings,
  }: {
    open: boolean;
    settings: TrainerSettings;
    availableControlSections: readonly ControlSection[];
    currentControlSection: ControlSectionId;
    currentControlSectionLabel: string;
    onControlSectionChange: (section: ControlSectionId) => void;
    motionPaused: boolean;
    motionDirectionLabel: string;
    canToggleDirection: boolean;
    colorMode: "light" | "dark";
    isDarkMode: boolean;
    isMotMode: boolean;
    isLilacChaserMode: boolean;
    behaviorValue: BehaviorId;
    patternSelectContentClass: string;
    handlePresetChange: (value: string) => void;
    handlePatternChange: (value: string) => void;
    handleBehaviorChange: (value: string) => void;
    handleLilacChaserColorChange: (value: string) => void;
    handleShapeChange: (value: string) => void;
    handleLetterWeightChange: (value: string) => void;
    handleThemeCheckedChange: (checked: boolean) => void;
    handleSpeedUnitChange: (value: string) => void;
    handleColorInput: (event: Event) => void;
    handleLetterColorInput: (event: Event) => void;
    handleCalibrationInput: (event: Event, field: CalibrationField) => void;
    speedSliderValue: () => number[];
    setSpeedSliderValue: (value: TrainerSliderValue) => void;
    sizeSliderValue: () => number[];
    setSizeSliderValue: (value: TrainerSliderValue) => void;
    lilacChaserScaleSliderValue: () => number[];
    setLilacChaserScaleSliderValue: (value: TrainerSliderValue) => void;
    opacitySliderValue: () => number[];
    setOpacitySliderValue: (value: TrainerSliderValue) => void;
    targetCountSliderValue: () => number[];
    setTargetCountSliderValue: (value: TrainerSliderValue) => void;
    distractorCountSliderValue: () => number[];
    setDistractorCountSliderValue: (value: TrainerSliderValue) => void;
    distractorBrightnessSliderValue: () => number[];
    setDistractorBrightnessSliderValue: (value: TrainerSliderValue) => void;
    letterScaleSliderValue: () => number[];
    setLetterScaleSliderValue: (value: TrainerSliderValue) => void;
    toggleMotionPaused: () => void;
    toggleMotionDirection: () => void;
    resetSettings: () => void;
  } = $props();
</script>

{#snippet sliderRow(label: string, valueLabel: string)}
  <span
    class="flex items-center justify-between gap-4 text-xs text-muted-foreground"
  >
    {label}
    <strong class="font-semibold tabular-nums text-foreground">
      {valueLabel}
    </strong>
  </span>
{/snippet}

<Dialog.Root bind:open>
  <Dialog.Content
    class="overflow-hidden p-0 md:max-h-125 md:max-w-175 lg:max-w-200"
    trapFocus={false}
  >
    <Dialog.Title class="sr-only">Controls</Dialog.Title>
    <Dialog.Description class="sr-only">
      Change your saved FoveaFlow settings.
    </Dialog.Description>
    <Sidebar.Provider class="items-start">
      <Sidebar.Root collapsible="none" class="hidden md:flex">
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {#each availableControlSections as section (section.id)}
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton
                      isActive={currentControlSection === section.id}
                      onclick={() => onControlSectionChange(section.id)}
                    >
                      <TrainerControlSectionIcon
                        icon={section.icon}
                        {colorMode}
                      />
                      <span>{section.label}</span>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                {/each}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>

      <div class="flex h-120 flex-1 flex-col overflow-hidden">
        <header
          class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
          <div class="flex min-w-0 items-center gap-2 px-4 text-base">
            <span class="shrink-0 text-muted-foreground"> Controls </span>
            <span class="shrink-0 text-muted-foreground" aria-hidden="true">
              ›
            </span>
            <h2 class="truncate font-medium">
              {currentControlSectionLabel}
            </h2>
          </div>
        </header>

        <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
          <div class="max-w-3xl rounded-xl bg-muted/50 p-4">
            {#if currentControlSection === "session"}
              <TrainerSettingsSection icon="theme" label="Session" {colorMode}>
                <TrainerSessionControls
                  {settings}
                  {motionPaused}
                  {motionDirectionLabel}
                  {canToggleDirection}
                  {isDarkMode}
                  {toggleMotionPaused}
                  {toggleMotionDirection}
                  {handleThemeCheckedChange}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "drill"}
              <TrainerSettingsSection icon="target" label="Drill" {colorMode}>
                <TrainerDrillControls
                  {settings}
                  {isLilacChaserMode}
                  {behaviorValue}
                  {patternSelectContentClass}
                  {handlePresetChange}
                  {handlePatternChange}
                  {handleBehaviorChange}
                  {handleLilacChaserColorChange}
                  {lilacChaserScaleSliderValue}
                  {setLilacChaserScaleSliderValue}
                  {sliderRow}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "targets"}
              <TrainerSettingsSection icon="eye" label="Targets" {colorMode}>
                <TrainerTargetControls
                  bind:settings
                  {isMotMode}
                  {handleColorInput}
                  {handleShapeChange}
                  {handleLetterColorInput}
                  {handleLetterWeightChange}
                  {sizeSliderValue}
                  {setSizeSliderValue}
                  {opacitySliderValue}
                  {setOpacitySliderValue}
                  {targetCountSliderValue}
                  {setTargetCountSliderValue}
                  {distractorCountSliderValue}
                  {setDistractorCountSliderValue}
                  {distractorBrightnessSliderValue}
                  {setDistractorBrightnessSliderValue}
                  {letterScaleSliderValue}
                  {setLetterScaleSliderValue}
                  {sliderRow}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "motion"}
              <TrainerSettingsSection icon="motion" label="Motion" {colorMode}>
                <TrainerMotionControls
                  {settings}
                  {speedSliderValue}
                  {setSpeedSliderValue}
                  {handleSpeedUnitChange}
                  {sliderRow}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "screen"}
              <TrainerSettingsSection
                icon="calibration"
                label="Screen scale"
                {colorMode}
              >
                <TrainerScreenControls bind:settings {handleCalibrationInput} />
              </TrainerSettingsSection>
            {:else}
              <TrainerSettingsSection icon="reset" label="Defaults" {colorMode}>
                <p class="text-sm leading-6 text-muted-foreground">
                  Restore the selected drill to its default behavior, visuals,
                  calibration, and saved local settings.
                </p>
                <Button
                  class="pressable-ui w-full justify-start"
                  variant="outline"
                  onclick={resetSettings}
                >
                  <RotateCcwIcon class="size-4" />
                  <span class="pl-1">Reset to defaults</span>
                </Button>
              </TrainerSettingsSection>
            {/if}
          </div>
        </div>
      </div>
    </Sidebar.Provider>
  </Dialog.Content>
</Dialog.Root>

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
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";

  let {
    open = $bindable(false),
    settings = $bindable(),
    availableControlSections,
    currentControlSection,
    currentControlSectionLabel,
    motionPaused,
    motionDirectionLabel,
    canToggleDirection,
    colorMode,
    isDarkMode,
    isMotMode,
    isLilacChaserMode,
    behaviorValue,
    patternSelectContentClass,
    actions,
  }: {
    open: boolean;
    settings: TrainerSettings;
    availableControlSections: readonly ControlSection[];
    currentControlSection: ControlSectionId;
    currentControlSectionLabel: string;
    motionPaused: boolean;
    motionDirectionLabel: string;
    canToggleDirection: boolean;
    colorMode: "light" | "dark";
    isDarkMode: boolean;
    isMotMode: boolean;
    isLilacChaserMode: boolean;
    behaviorValue: BehaviorId;
    patternSelectContentClass: string;
    actions: TrainerDialogActions;
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
                      onclick={() => actions.onControlSectionChange(section.id)}
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
                  toggleMotionPaused={actions.toggleMotionPaused}
                  toggleMotionDirection={actions.toggleMotionDirection}
                  handleThemeCheckedChange={actions.handleThemeCheckedChange}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "drill"}
              <TrainerSettingsSection icon="target" label="Drill" {colorMode}>
                <TrainerDrillControls
                  {settings}
                  {isLilacChaserMode}
                  {behaviorValue}
                  {patternSelectContentClass}
                  handlePresetChange={actions.handlePresetChange}
                  handlePatternChange={actions.handlePatternChange}
                  handleBehaviorChange={actions.handleBehaviorChange}
                  handleLilacChaserColorChange={actions.handleLilacChaserColorChange}
                  lilacChaserScaleSliderValue={actions.lilacChaserScaleSlider
                    .value}
                  setLilacChaserScaleSliderValue={actions.lilacChaserScaleSlider
                    .set}
                  {sliderRow}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "targets"}
              <TrainerSettingsSection icon="eye" label="Targets" {colorMode}>
                <TrainerTargetControls
                  bind:settings
                  {isMotMode}
                  handleColorInput={actions.handleColorInput}
                  handleShapeChange={actions.handleShapeChange}
                  handleLetterColorInput={actions.handleLetterColorInput}
                  handleLetterWeightChange={actions.handleLetterWeightChange}
                  sizeSliderValue={actions.sizeSlider.value}
                  setSizeSliderValue={actions.sizeSlider.set}
                  opacitySliderValue={actions.opacitySlider.value}
                  setOpacitySliderValue={actions.opacitySlider.set}
                  targetCountSliderValue={actions.targetCountSlider.value}
                  setTargetCountSliderValue={actions.targetCountSlider.set}
                  distractorCountSliderValue={actions.distractorCountSlider
                    .value}
                  setDistractorCountSliderValue={actions.distractorCountSlider
                    .set}
                  distractorBrightnessSliderValue={actions
                    .distractorBrightnessSlider.value}
                  setDistractorBrightnessSliderValue={actions
                    .distractorBrightnessSlider.set}
                  letterScaleSliderValue={actions.letterScaleSlider.value}
                  setLetterScaleSliderValue={actions.letterScaleSlider.set}
                  {sliderRow}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "motion"}
              <TrainerSettingsSection icon="motion" label="Motion" {colorMode}>
                <TrainerMotionControls
                  {settings}
                  speedSliderValue={actions.speedSlider.value}
                  setSpeedSliderValue={actions.speedSlider.set}
                  handleSpeedUnitChange={actions.handleSpeedUnitChange}
                  {sliderRow}
                />
              </TrainerSettingsSection>
            {:else if currentControlSection === "screen"}
              <TrainerSettingsSection
                icon="calibration"
                label="Screen scale"
                {colorMode}
              >
                <TrainerScreenControls
                  bind:settings
                  handleCalibrationInput={actions.handleCalibrationInput}
                />
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
                  onclick={actions.resetSettings}
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

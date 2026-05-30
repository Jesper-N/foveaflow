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
  import * as Tabs from "$lib/components/ui/tabs/index.js";
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

  const handleControlSectionValueChange = (sectionId: string) => {
    if (availableControlSections.some((section) => section.id === sectionId)) {
      actions.onControlSectionChange(sectionId as ControlSectionId);
    }
  };
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
    class="h-[calc(100dvh-1rem)] max-h-none max-w-[calc(100dvw-1rem)] overflow-hidden p-0 md:h-auto md:max-h-125 md:max-w-175 lg:max-w-200"
    trapFocus={false}
  >
    <Dialog.Title class="sr-only">Controls</Dialog.Title>
    <Dialog.Description class="sr-only">
      Change your saved FoveaFlow settings.
    </Dialog.Description>
    <Sidebar.Provider
      class="h-full min-h-0 min-w-0 items-start overflow-hidden"
    >
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

      <Tabs.Root
        value={currentControlSection}
        onValueChange={handleControlSectionValueChange}
        class="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden md:h-120"
      >
        <header
          class="flex h-16 shrink-0 items-center gap-2 px-4 pr-16 transition-[width,height] ease-linear md:px-4 md:pr-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
          <div class="flex min-w-0 items-center gap-2 text-base">
            <span class="shrink-0 text-muted-foreground"> Controls </span>
            <span class="shrink-0 text-muted-foreground" aria-hidden="true">
              ›
            </span>
            <h2 class="truncate font-medium">
              {currentControlSectionLabel}
            </h2>
          </div>
        </header>

        <nav class="px-3 py-2 md:hidden" aria-label="Control sections">
          <Tabs.List class="no-scrollbar w-full justify-start overflow-x-auto">
            {#each availableControlSections as section (section.id)}
              <Tabs.Trigger
                value={section.id}
                class="pressable-ui shrink-0 grow-0 basis-auto"
              >
                <TrainerControlSectionIcon icon={section.icon} {colorMode} />
                <span>{section.label}</span>
              </Tabs.Trigger>
            {/each}
          </Tabs.List>
        </nav>

        <div
          class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-3 md:p-4 md:pt-0"
        >
          <div
            class="t-resize w-full max-w-3xl rounded-3xl border border-border/60 bg-muted/55 p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.85)] md:rounded-xl md:border-0 md:bg-muted/50 md:shadow-none"
          >
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
                  {canToggleDirection}
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
      </Tabs.Root>
    </Sidebar.Provider>
  </Dialog.Content>
</Dialog.Root>

<script lang="ts">
  import TrainerControlSectionIcon from "$lib/components/trainer/trainer-control-section-icon.svelte";
  import TrainerDrillControls from "$lib/components/trainer/trainer-drill-controls.svelte";
  import TrainerMotionControls from "$lib/components/trainer/trainer-motion-controls.svelte";
  import TrainerScreenControls from "$lib/components/trainer/trainer-screen-controls.svelte";
  import TrainerSessionControls from "$lib/components/trainer/trainer-session-controls.svelte";
  import TrainerTargetControls from "$lib/components/trainer/trainer-target-controls.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { BehaviorId } from "$lib/trainer/behavior";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import type { ControlSection, ControlSectionId } from "$lib/trainer/options";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";

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

  let locale = $derived(languageState.locale);

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    requestAnimationFrame(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        `[data-control-section="${currentControlSection}"]`
      );
      [...buttons]
        .find((button) => button.getClientRects().length > 0)
        ?.focus();
    });
  };

  const handleSectionClick = (event: MouseEvent) => {
    const { currentTarget } = event;
    if (!(currentTarget instanceof HTMLButtonElement)) {
      return;
    }
    const { controlSection } = currentTarget.dataset;
    const section = availableControlSections.find(
      ({ id }) => id === controlSection
    );
    if (section) {
      actions.onControlSectionChange(section.id);
    }
  };
</script>

{#snippet sliderRow(label: string, valueLabel: string)}
  <span
    class="text-muted-foreground flex items-center justify-between gap-4 text-xs"
  >
    {label}
    <strong class="text-foreground font-semibold tabular-nums">
      {valueLabel}
    </strong>
  </span>
{/snippet}

{#snippet sectionButton(section: ControlSection, compact: boolean)}
  <Button
    type="button"
    variant={currentControlSection === section.id ? "secondary" : "ghost"}
    size={compact ? "sm" : "default"}
    class={compact ? "shrink-0" : "w-full justify-start"}
    data-control-section={section.id}
    aria-pressed={currentControlSection === section.id}
    onclick={handleSectionClick}
  >
    <span data-icon="inline-start" class="grid place-items-center">
      <TrainerControlSectionIcon icon={section.icon} {colorMode} />
    </span>
    <span>{section.label}</span>
  </Button>
{/snippet}

<Dialog.Root bind:open>
  <Dialog.Content
    class="h-[calc(100dvh-1rem)] max-h-none max-w-[calc(100dvw-1rem)] overflow-hidden p-0 md:h-auto md:max-h-125 md:max-w-175 lg:max-w-200"
    onOpenAutoFocus={handleOpenAutoFocus}
  >
    <Dialog.Title class="sr-only">{t(locale, "Controls")}</Dialog.Title>
    <Dialog.Description class="sr-only">
      {t(locale, "Change your saved FoveaFlow settings.")}
    </Dialog.Description>
    <div class="flex h-full min-h-0 min-w-0 items-start overflow-hidden">
      <aside
        class="border-sidebar-border bg-sidebar text-sidebar-foreground hidden h-full w-52 shrink-0 border-r p-3 md:block"
      >
        <nav aria-label={t(locale, "Control sections")}>
          <ul class="grid gap-1">
            {#each availableControlSections as section (section.id)}
              <li>{@render sectionButton(section, false)}</li>
            {/each}
          </ul>
        </nav>
      </aside>

      <div
        class="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden md:h-120"
      >
        <header
          class="flex h-16 shrink-0 items-center gap-2 px-4 pr-16 md:pr-4"
        >
          <div class="flex min-w-0 items-center gap-2 text-base">
            <span class="text-muted-foreground shrink-0">
              {t(locale, "Controls")}
            </span>
            <span class="text-muted-foreground shrink-0" aria-hidden="true">
              ›
            </span>
            <h2 class="truncate font-medium">
              {currentControlSectionLabel}
            </h2>
          </div>
        </header>

        <nav
          class="px-3 py-2 md:hidden"
          aria-label={t(locale, "Control sections")}
        >
          <div class="grid w-full grid-cols-2 gap-1 sm:grid-cols-3">
            {#each availableControlSections as section (section.id)}
              {@render sectionButton(section, true)}
            {/each}
          </div>
        </nav>

        <div
          class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-3 md:p-4 md:pt-0"
        >
          <div
            class="t-resize border-border/60 bg-muted/55 md:bg-muted/50 w-full max-w-3xl rounded-3xl border p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.85)] md:rounded-xl md:border-0 md:shadow-none"
          >
            <section class="grid gap-6">
              {#if currentControlSection === "session"}
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
              {:else if currentControlSection === "drill"}
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
              {:else if currentControlSection === "targets"}
                <TrainerTargetControls
                  bind:settings
                  {isMotMode}
                  handleColorInput={actions.handleColorInput}
                  handleTargetFormChange={actions.handleTargetFormChange}
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
              {:else if currentControlSection === "motion"}
                <TrainerMotionControls
                  {settings}
                  speedSliderValue={actions.speedSlider.value}
                  setSpeedSliderValue={actions.speedSlider.set}
                  handleSpeedUnitChange={actions.handleSpeedUnitChange}
                  {sliderRow}
                />
              {:else if currentControlSection === "screen"}
                <TrainerScreenControls
                  bind:settings
                  {canToggleDirection}
                  handleCalibrationInput={actions.handleCalibrationInput}
                />
              {:else}
                <p class="text-muted-foreground text-sm leading-6">
                  {t(
                    locale,
                    "Restore the selected drill to its default behavior, visuals, calibration, and saved local settings."
                  )}
                </p>
                <Button
                  class="w-full justify-start"
                  variant="outline"
                  onclick={actions.resetSettings}
                >
                  <RotateCcwIcon data-icon="inline-start" />
                  <span>{t(locale, "Reset to defaults")}</span>
                </Button>
              {/if}
            </section>
          </div>
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

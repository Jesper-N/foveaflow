import type { ControlSectionId } from "$lib/trainer/options";
import type { TrainerSliderValue } from "$lib/trainer/settings";

export interface SliderBinding {
  value: () => number[];
  set: (value: TrainerSliderValue) => void;
}

export interface TrainerHudActions {
  handlePresetChange: (value: string) => void;
  handleHeaderSelectOpenChange: (open: boolean) => void;
  handlePatternChange: (value: string) => void;
  handleLilacChaserColorChange: (value: string) => void;
  sizeSlider: SliderBinding;
  speedSlider: SliderBinding;
  lilacChaserScaleSlider: SliderBinding;
  toggleMotionPaused: () => void;
  toggleMotionDirection: () => void;
  revealHud: () => void;
  revealHudTemporarily: () => void;
  setHudInteractionActive: (active: boolean) => void;
  openControlsPanel: () => void;
  openGuide: () => void;
}

export interface TrainerDialogActions {
  onControlSectionChange: (section: ControlSectionId) => void;
  handlePresetChange: (value: string) => void;
  handlePatternChange: (value: string) => void;
  handleBehaviorChange: (value: string) => void;
  handleLilacChaserColorChange: (value: string) => void;
  handleTargetFormChange: (value: string) => void;
  handleLetterWeightChange: (value: string) => void;
  handleMotionDirectionChange: (value: string) => void;
  handleColorInput: (event: Event) => void;
  handleLetterColorInput: (event: Event) => void;
  speedSlider: SliderBinding;
  sizeSlider: SliderBinding;
  lilacChaserScaleSlider: SliderBinding;
  opacitySlider: SliderBinding;
  targetCountSlider: SliderBinding;
  distractorCountSlider: SliderBinding;
  distractorBrightnessSlider: SliderBinding;
  letterScaleSlider: SliderBinding;
  resetSettings: () => void;
}

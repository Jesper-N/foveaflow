import type { ControlSectionId } from "$lib/trainer/options";
import type {
  CalibrationField,
  TrainerSliderValue,
} from "$lib/trainer/settings";

interface SliderBinding {
  value: () => number[];
  set: (value: TrainerSliderValue) => void;
}

export interface TrainerHudActions {
  handlePresetChange: (value: string) => void;
  handleHeaderPresetOpenChange: (open: boolean) => void;
  handlePatternChange: (value: string) => void;
  handleHeaderPatternOpenChange: (open: boolean) => void;
  handleLilacChaserColorChange: (value: string) => void;
  handleHeaderLilacChaserColorOpenChange: (open: boolean) => void;
  handleHeaderLanguageOpenChange: (open: boolean) => void;
  sizeSlider: SliderBinding;
  speedSlider: SliderBinding;
  lilacChaserScaleSlider: SliderBinding;
  toggleMotionPaused: () => void;
  toggleMotionDirection: () => void;
  revealHud: () => void;
  revealHudTemporarily: () => void;
  setHudInteractionActive: (active: boolean) => void;
  openControlsPanel: () => void;
}

export interface TrainerDialogActions {
  onControlSectionChange: (section: ControlSectionId) => void;
  handlePresetChange: (value: string) => void;
  handlePatternChange: (value: string) => void;
  handleBehaviorChange: (value: string) => void;
  handleLilacChaserColorChange: (value: string) => void;
  handleTargetFormChange: (value: string) => void;
  handleLetterWeightChange: (value: string) => void;
  handleThemeCheckedChange: (checked: boolean) => void;
  handleSpeedUnitChange: (value: string) => void;
  handleColorInput: (event: Event) => void;
  handleLetterColorInput: (event: Event) => void;
  handleCalibrationInput: (event: Event, field: CalibrationField) => void;
  speedSlider: SliderBinding;
  sizeSlider: SliderBinding;
  lilacChaserScaleSlider: SliderBinding;
  opacitySlider: SliderBinding;
  targetCountSlider: SliderBinding;
  distractorCountSlider: SliderBinding;
  distractorBrightnessSlider: SliderBinding;
  letterScaleSlider: SliderBinding;
  toggleMotionPaused: () => void;
  toggleMotionDirection: () => void;
  resetSettings: () => void;
}

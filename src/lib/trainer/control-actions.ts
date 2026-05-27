import type { HudControlTransition } from "$lib/trainer/transitions";
import type { TrainerSettings } from "$lib/engine/presets";
import type { CanvasColorMode } from "$lib/trainer/rendering";
import type { BehaviorId, ControlSectionId } from "$lib/trainer/options";
import type {
  CalibrationField,
  TrainerSliderValue,
} from "$lib/trainer/settings";

type SliderBinding = {
  value: () => number[];
  set: (value: TrainerSliderValue) => void;
};

export type TrainerHudActions = {
  handlePresetChange: (value: string) => void;
  handleHeaderPresetOpenChange: (open: boolean) => void;
  handlePatternChange: (value: string) => void;
  handleHeaderPatternOpenChange: (open: boolean) => void;
  handleLilacChaserColorChange: (value: string) => void;
  handleHeaderLilacChaserColorOpenChange: (open: boolean) => void;
  sizeSlider: SliderBinding;
  speedSlider: SliderBinding;
  lilacChaserScaleSlider: SliderBinding;
  hudControlTransition: HudControlTransition;
  toggleMotionPaused: () => void;
  toggleMotionDirection: () => void;
  revealHud: () => void;
  openControlsPanel: () => void;
};

export type TrainerDialogActions = {
  onControlSectionChange: (section: ControlSectionId) => void;
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
};

export type TrainerDialogState = {
  settings: TrainerSettings;
  motionPaused: boolean;
  motionDirectionLabel: string;
  canToggleDirection: boolean;
  colorMode: CanvasColorMode;
  isDarkMode: boolean;
  isMotMode: boolean;
  isLilacChaserMode: boolean;
  behaviorValue: BehaviorId;
};

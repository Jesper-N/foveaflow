export type TrainerShortcutAction =
  | "toggleMotion"
  | "increaseTargetSize"
  | "decreaseTargetSize"
  | "decreaseSpeed"
  | "increaseSpeed"
  | "toggleTheme"
  | "openPatternSelect"
  | "openModeSelect"
  | "openSettingsDialog"
  | "openGuideDialog";

export type TrainerShortcutEvent = Pick<
  KeyboardEvent,
  | "altKey"
  | "ctrlKey"
  | "defaultPrevented"
  | "isComposing"
  | "key"
  | "metaKey"
  | "repeat"
>;

const shortcutActionsByKey: Readonly<Record<string, TrainerShortcutAction>> = {
  " ": "toggleMotion",
  Spacebar: "toggleMotion",
  ArrowUp: "increaseTargetSize",
  ArrowDown: "decreaseTargetSize",
  ArrowLeft: "decreaseSpeed",
  ArrowRight: "increaseSpeed",
  d: "toggleTheme",
  p: "openPatternSelect",
  m: "openModeSelect",
  s: "openSettingsDialog",
  g: "openGuideDialog",
};

const repeatableShortcutActions = new Set<TrainerShortcutAction>([
  "increaseTargetSize",
  "decreaseTargetSize",
  "decreaseSpeed",
  "increaseSpeed",
]);

const selectTriggerCapturedActions = new Set<TrainerShortcutAction>([
  "toggleMotion",
  "increaseTargetSize",
  "decreaseTargetSize",
  "decreaseSpeed",
  "increaseSpeed",
]);

const shortcutCaptureSelector = [
  "a[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "[contenteditable='']",
  "[contenteditable='true']",
  "[data-slot='dialog-content']",
  "[data-slot='select-content']",
  "[popover]:popover-open",
  "[role='button']",
  "[role='combobox']",
  "[role='listbox']",
  "[role='option']",
  "[role='slider']",
  "[role='spinbutton']",
  "[role='switch']",
  "[role='tab']",
  "[role='textbox']",
].join(",");

export const getTrainerShortcutAction = (
  event: TrainerShortcutEvent,
): TrainerShortcutAction | null => {
  if (
    event.defaultPrevented ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return null;
  }

  const shortcutKey =
    event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const action = shortcutActionsByKey[shortcutKey];
  if (!action) return null;
  if (event.repeat && !repeatableShortcutActions.has(action)) return null;

  return action;
};

export const isTrainerShortcutCapturedByTarget = (
  target: EventTarget | null,
  action?: TrainerShortcutAction,
) => {
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }

  if (target.closest("[data-slot='select-trigger']")) {
    return action === undefined || selectTriggerCapturedActions.has(action);
  }

  return Boolean(target.closest(shortcutCaptureSelector));
};

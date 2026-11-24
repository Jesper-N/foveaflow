export type ShortcutAction =
  | "togglePause"
  | "growTarget"
  | "shrinkTarget"
  | "slowDown"
  | "speedUp"
  | "toggleTheme"
  | "openPatternSelect"
  | "openDrillSelect"
  | "openControls"
  | "openGuide";

interface TrainerShortcut {
  action: ShortcutAction;
  /** Keys as ui-sdk's shortcuts name them. */
  keys: string;
  /** Holding the keys repeats the action. */
  repeat?: boolean;
}

export const trainerShortcuts = [
  { action: "togglePause", keys: "space" },
  { action: "growTarget", keys: "arrowup", repeat: true },
  { action: "shrinkTarget", keys: "arrowdown", repeat: true },
  { action: "slowDown", keys: "arrowleft", repeat: true },
  { action: "speedUp", keys: "arrowright", repeat: true },
  { action: "toggleTheme", keys: "d" },
  { action: "openGuide", keys: "g" },
  { action: "openDrillSelect", keys: "m" },
  { action: "openPatternSelect", keys: "p" },
  { action: "openControls", keys: "s" },
] as const satisfies readonly TrainerShortcut[];

/** Focused controls that keep every key for themselves. */
const keyCapturingSelector = [
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "[contenteditable='']",
  "[contenteditable='true']",
  "dialog[open]",
  "[role='combobox']",
  "[role='dialog']",
  "[role='listbox']",
  "[role='option']",
  "[role='slider']",
  "[role='spinbutton']",
  "[role='textbox']",
].join(",");

/** Focused controls that move between options with the arrow keys. */
const arrowCapturingSelector = "[role='radio'], [role='tab']";

/** Focused controls that Space presses. Letters still reach the shortcuts. */
const pressableSelector = [
  "a[href]",
  "button",
  "[role='button']",
  "[role='radio']",
  "[role='switch']",
  "[role='tab']",
].join(",");

const closingPanelSelector = "[role='dialog'][data-closed]";

/** Whether the focused element should get the keys instead of the shortcut. */
export const isKeyCapturedBy = (target: Element | null, keys: string) => {
  if (target === null || target.closest(closingPanelSelector)) {
    return false;
  }

  if (target.closest(keyCapturingSelector)) {
    return true;
  }

  if (keys.startsWith("arrow")) {
    return target.closest(arrowCapturingSelector) !== null;
  }

  return keys === "space" && target.closest(pressableSelector) !== null;
};

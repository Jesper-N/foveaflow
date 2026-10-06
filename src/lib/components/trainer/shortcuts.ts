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

/** The parts of a keyboard event that decide the shortcut. */
type ShortcutKeyEvent = Pick<
  KeyboardEvent,
  | "altKey"
  | "ctrlKey"
  | "defaultPrevented"
  | "isComposing"
  | "key"
  | "metaKey"
  | "repeat"
>;

const actionsByKey = new Map<string, ShortcutAction>([
  [" ", "togglePause"],
  ["ArrowUp", "growTarget"],
  ["ArrowDown", "shrinkTarget"],
  ["ArrowLeft", "slowDown"],
  ["ArrowRight", "speedUp"],
  ["d", "toggleTheme"],
  ["g", "openGuide"],
  ["m", "openDrillSelect"],
  ["p", "openPatternSelect"],
  ["s", "openControls"],
]);

/** Holding these keys repeats them. Holding the others does nothing. */
const repeatableActions = new Set<ShortcutAction>([
  "growTarget",
  "shrinkTarget",
  "slowDown",
  "speedUp",
]);

/** A focused select trigger already uses Space and the arrow keys. */
const selectTriggerActions = new Set<ShortcutAction>([
  "togglePause",
  "growTarget",
  "shrinkTarget",
  "slowDown",
  "speedUp",
]);

/** Focused controls that keep keys for themselves. */
const keyCapturingSelector = [
  "a[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "[contenteditable='']",
  "[contenteditable='true']",
  "[data-slot='dialog-content']",
  "[data-slot='select-content']",
  "dialog[open]",
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

/** Focus stays inside a dialog or menu until it finishes animating closed. */
const closingSurfaceSelector = [
  "[data-slot='dialog-content'][data-state='closed']",
  "[data-slot='select-content'][data-state='closed']",
].join(",");

export const getShortcutAction = (
  event: ShortcutKeyEvent
): ShortcutAction | null => {
  if (
    event.defaultPrevented ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return null;
  }

  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const action = actionsByKey.get(key);
  if (!action || (event.repeat && !repeatableActions.has(action))) {
    return null;
  }
  return action;
};

/** Whether the focused element should get the key instead of the shortcut. */
export const isKeyCapturedBy = (
  target: EventTarget | null,
  action: ShortcutAction
) => {
  if (!(target instanceof Element) || target.closest(closingSurfaceSelector)) {
    return false;
  }
  if (target.closest("[data-slot='select-trigger']")) {
    return selectTriggerActions.has(action);
  }
  return target.closest(keyCapturingSelector) !== null;
};

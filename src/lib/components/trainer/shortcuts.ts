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

/** Focused controls that Space and Enter press. Letters still reach the shortcuts. */
const pressableSelector = [
  "a[href]",
  "button",
  "[role='button']",
  "[role='radio']",
  "[role='switch']",
  "[role='tab']",
].join(",");

const arrowKeys = new Set(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"]);

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

const closingPanelSelector = "[role='dialog'][data-closed]";

/** Whether the focused element should get the key instead of the shortcut. */
export const isKeyCapturedBy = (target: EventTarget | null, key: string) => {
  if (!(target instanceof Element) || target.closest(closingPanelSelector)) {
    return false;
  }

  if (target.closest(keyCapturingSelector)) {
    return true;
  }

  if (arrowKeys.has(key)) {
    return target.closest(arrowCapturingSelector) !== null;
  }

  return (
    (key === " " || key === "Enter") &&
    target.closest(pressableSelector) !== null
  );
};

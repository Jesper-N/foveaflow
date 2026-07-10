import type { TrainerShortcutAction } from "$lib/trainer/keyboard";

export const shortcutPrioritySurfaceSelector =
  "[data-slot='dialog-content'], [data-slot='select-content'], [popover]:popover-open";

type TrainerShortcutHandlers = {
  hasPriorityKeyboardSurface: () => boolean;
  toggleMotionPaused: () => void;
  adjustTargetSize: (deltaPx: number) => void;
  adjustSpeed: (delta: number) => void;
};

export const runTrainerShortcutAction = (
  action: TrainerShortcutAction,
  handlers: TrainerShortcutHandlers,
): boolean => {
  if (handlers.hasPriorityKeyboardSurface()) return false;

  switch (action) {
    case "toggleMotion":
      handlers.toggleMotionPaused();
      return true;
    case "increaseTargetSize":
      handlers.adjustTargetSize(1);
      return true;
    case "decreaseTargetSize":
      handlers.adjustTargetSize(-1);
      return true;
    case "decreaseSpeed":
      handlers.adjustSpeed(-1);
      return true;
    case "increaseSpeed":
      handlers.adjustSpeed(1);
      return true;
  }
};

import type { TrainerShortcutAction } from "$lib/trainer/keyboard";

export type HeaderShortcutSelect = "mode" | "pattern";

export const desktopHeaderQuery = "(min-width: 48rem)";

export const shortcutPrioritySurfaceSelector =
  "[data-slot='dialog-content'], [data-slot='select-content'], [popover]:popover-open";

type TrainerShortcutHandlers = {
  hasPriorityKeyboardSurface: () => boolean;
  toggleMotionPaused: () => void;
  adjustTargetSize: (deltaPx: number) => void;
  adjustSpeed: (delta: number) => void;
  toggleTheme: () => void;
  canOpenPatternSelect: () => boolean;
  openHeaderSelect: (select: HeaderShortcutSelect) => void;
  openControlsPanel: () => void;
  openGuideDialog: () => boolean;
};

export const getHeaderSelectOpenState = (
  select: HeaderShortcutSelect,
  useDesktopSelect: boolean,
) => ({
  mobilePresetSelectOpen: select === "mode" && !useDesktopSelect,
  desktopPresetSelectOpen: select === "mode" && useDesktopSelect,
  mobilePatternSelectOpen: select === "pattern" && !useDesktopSelect,
  desktopPatternSelectOpen: select === "pattern" && useDesktopSelect,
  mobileLilacChaserColorSelectOpen: false,
  desktopLilacChaserColorSelectOpen: false,
});

export const focusHeaderSelectTriggerFromShortcut = async ({
  select,
  useDesktopSelect,
  flushSvelte,
}: {
  select: HeaderShortcutSelect;
  useDesktopSelect: boolean;
  flushSvelte: () => Promise<void>;
}) => {
  await flushSvelte();

  const viewport = useDesktopSelect ? "desktop" : "mobile";
  const trigger = document.querySelector<HTMLButtonElement>(
    `[data-trainer-shortcut-select="${viewport}-${select}"]`,
  );
  trigger?.focus({ preventScroll: true });
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
    case "toggleTheme":
      handlers.toggleTheme();
      return true;
    case "openPatternSelect":
      if (!handlers.canOpenPatternSelect()) return false;
      handlers.openHeaderSelect("pattern");
      return true;
    case "openModeSelect":
      handlers.openHeaderSelect("mode");
      return true;
    case "openSettingsDialog":
      handlers.openControlsPanel();
      return true;
    case "openGuideDialog":
      return handlers.openGuideDialog();
  }
};

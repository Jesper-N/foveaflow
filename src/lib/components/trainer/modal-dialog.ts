import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";

/**
 * Opens a native modal dialog whenever `isOpen` turns true. The dialog traps
 * focus, closes on Escape, and returns focus to the button that opened it.
 * Pair it with an `onclose` handler that sets the open state back to false.
 */
export const showModalWhen =
  (
    isOpen: () => boolean,
    onShow?: (dialog: HTMLDialogElement) => void
  ): Attachment<HTMLDialogElement> =>
  (dialog) => {
    if (isOpen() && !dialog.open) {
      dialog.showModal();
      onShow?.(dialog);
    }
  };

/**
 * Closes on a click that starts and ends on the backdrop, so selecting text
 * and releasing outside the panel keeps the dialog open.
 */
export const closeOnBackdropClick: Attachment<HTMLDialogElement> = (dialog) => {
  let pressedBackdrop = false;

  const offPointerDown = on(dialog, "pointerdown", (event) => {
    pressedBackdrop = event.target === dialog;
  });

  const offClick = on(dialog, "click", (event) => {
    if (pressedBackdrop && event.target === dialog) {
      dialog.close();
    }
  });

  return () => {
    offPointerDown();
    offClick();
  };
};

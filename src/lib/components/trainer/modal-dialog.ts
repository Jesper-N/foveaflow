import type { Attachment } from "svelte/attachments";

/**
 * Opens a native modal dialog whenever `isOpen` turns true. The dialog traps
 * focus, closes on Escape, and returns focus to the button that opened it.
 * Pair it with an `onclose` handler that sets the open state back to false.
 */
export const showModalWhen =
  (isOpen: () => boolean): Attachment<HTMLDialogElement> =>
  (dialog) => {
    if (isOpen() && !dialog.open) {
      dialog.showModal();
    }
  };

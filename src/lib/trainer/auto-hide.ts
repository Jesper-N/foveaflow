type TimeoutHandle = number | undefined;

export const createHudAutoHideTimer = ({
  delayMs,
  setReady,
  setVisible,
  isInteractionOpen,
}: {
  delayMs: number;
  setReady: (ready: boolean) => void;
  setVisible: (visible: boolean) => void;
  isInteractionOpen: () => boolean;
}) => {
  let timeout: TimeoutHandle;

  const clear = () => {
    if (timeout === undefined) return;
    window.clearTimeout(timeout);
    timeout = undefined;
  };

  const start = () => {
    clear();
    setReady(false);
    setVisible(true);
    timeout = window.setTimeout(() => {
      setReady(true);
      if (!isInteractionOpen()) setVisible(false);
    }, delayMs);
  };

  return { clear, start };
};

export const createCursorAutoHideTimer = ({
  delayMs,
  setHidden,
}: {
  delayMs: number;
  setHidden: (hidden: boolean) => void;
}) => {
  let timeout: TimeoutHandle;
  let deadline = 0;

  const clear = () => {
    if (timeout === undefined) return;
    window.clearTimeout(timeout);
    timeout = undefined;
    deadline = 0;
  };

  const start = () => {
    setHidden(false);
    deadline = performance.now() + delayMs;
    if (timeout !== undefined) return;

    const hideAfterIdle = () => {
      const remainingDelayMs = deadline - performance.now();
      if (remainingDelayMs > 0) {
        timeout = window.setTimeout(hideAfterIdle, remainingDelayMs);
        return;
      }

      timeout = undefined;
      setHidden(true);
    };

    timeout = window.setTimeout(hideAfterIdle, delayMs);
  };

  return { clear, start };
};

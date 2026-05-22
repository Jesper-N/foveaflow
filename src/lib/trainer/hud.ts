export type HudBounds = {
  left: number;
  right: number;
};

type HudPointerIntent = "none" | "reveal" | "hide";

export const getHudInteractionOpen = (
  panelOpen: boolean,
  guidePopoverOpen: boolean,
  headerPresetSelectOpen: boolean,
  headerPatternSelectOpen: boolean,
  headerLilacChaserColorSelectOpen: boolean,
) => {
  return (
    panelOpen ||
    guidePopoverOpen ||
    headerPresetSelectOpen ||
    headerPatternSelectOpen ||
    headerLilacChaserColorSelectOpen
  );
};

export const getHudHidden = (
  hudAutoHideReady: boolean,
  hudVisible: boolean,
  hudInteractionOpen: boolean,
) => {
  return hudAutoHideReady && !hudVisible && !hudInteractionOpen;
};

export const canAutoHideHud = (
  hudAutoHideReady: boolean,
  hudInteractionOpen: boolean,
) => {
  return hudAutoHideReady && !hudInteractionOpen;
};

export const getHudPointerIntent = (
  pointerType: string,
  hudAutoHideReady: boolean,
  clientX: number,
  clientY: number,
  hudBounds: HudBounds | null | undefined,
): HudPointerIntent => {
  if (!hudAutoHideReady || pointerType === "touch") return "none";

  const isOverHudWidth =
    hudBounds && clientX >= hudBounds.left && clientX <= hudBounds.right;

  if (clientY <= 96 && isOverHudWidth) return "reveal";
  if (clientY > 160) return "hide";
  return "none";
};

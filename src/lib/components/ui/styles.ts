export const pressable =
  "select-none transition-[background-color,color,opacity,scale] duration-160 ease-out active:duration-100 motion-safe:active:scale-96";

export const popupSurface =
  "rounded-2xl border-0 bg-popover p-2 text-foreground shadow-popover";

export const listItem =
  "list-deal relative z-1 flex min-h-10 cursor-default items-center gap-3 rounded-xl ps-3 pe-2.5 text-md outline-none select-none data-disabled:opacity-50 pointer-coarse:min-h-12";

export const listGroupLabel =
  "px-3 pt-2.5 pb-1 text-xs font-medium text-muted-foreground";

export const backdrop =
  "fixed inset-0 bg-black/24 transition-opacity duration-220 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/48";

export const sheetPresentation =
  "data-[presentation=sheet]:inset-x-0 data-[presentation=sheet]:bottom-0 data-[presentation=sheet]:top-auto data-[presentation=sheet]:h-[85dvh] data-[presentation=sheet]:before:mx-auto data-[presentation=sheet]:before:mt-2 data-[presentation=sheet]:before:block data-[presentation=sheet]:before:h-1 data-[presentation=sheet]:before:w-9 data-[presentation=sheet]:before:shrink-0 data-[presentation=sheet]:before:rounded-full data-[presentation=sheet]:before:bg-fill-active data-[presentation=sheet]:w-full data-[presentation=sheet]:max-w-none data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:rounded-t-4xl data-[presentation=sheet]:pb-[env(safe-area-inset-bottom)]";

export const dialogSurface =
  "m-0 flex flex-col overflow-hidden border-0 bg-popover p-0 text-foreground shadow-popover";

export const settingsGroup =
  "grid rounded-2xl bg-fill ps-3 pe-4 *:data-setting-row:relative *:data-setting-row:py-3 *:data-setting-row:not-first:before:absolute *:data-setting-row:not-first:before:inset-s-10 *:data-setting-row:not-first:before:-inset-e-4 *:data-setting-row:not-first:before:top-0 *:data-setting-row:not-first:before:h-px *:data-setting-row:not-first:before:bg-border";

export const segmentTrack =
  "relative grid auto-cols-fr grid-flow-col rounded-full bg-fill p-0.5";

export const segmentThumb =
  "stretch-indicator absolute rounded-full bg-thumb shadow-thumb";

export const setTravelDirection = (
  element: HTMLElement | undefined,
  from: number,
  to: number
) => {
  if (element) {
    element.dataset["direction"] =
      to >= from === (document.documentElement.dir === "rtl")
        ? "left"
        : "right";
  }
};

export const segmentItem =
  "relative z-1 inline-flex h-8 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors duration-160 ease-out outline-none select-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 pointer-coarse:h-10 [&_svg]:size-4 [&_svg]:shrink-0";

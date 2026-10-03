import { stageGrid } from "../page-styles";

export const guideSectionHeading = "text-foreground text-base font-semibold";

export const guideCopy = "text-muted-foreground leading-6 text-pretty";

// The stage echoes the trainer canvas: page background with a faint grid.
export const guideStage = `border-border/60 bg-background relative grid items-center gap-6 border-b px-6 pt-7 pb-6 sm:py-7 sm:pr-20 sm:pl-8 ${stageGrid}`;

export const guideTitle =
  "relative text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl";

export const guideLede =
  "text-muted-foreground relative max-w-[46ch] text-base leading-7 text-pretty";

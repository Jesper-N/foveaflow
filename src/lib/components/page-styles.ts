export const editorialTitle =
  "text-4xl leading-[1.08] font-semibold tracking-tight text-balance wrap-anywhere hyphens-auto sm:text-5xl";
export const editorialHeading =
  "text-2xl leading-tight font-semibold tracking-tight wrap-anywhere hyphens-auto sm:text-3xl";
export const editorialLede =
  "text-muted-foreground max-w-2xl text-base leading-7 text-pretty sm:text-lg sm:leading-8";
export const editorialCopy =
  "text-muted-foreground max-w-2xl text-base leading-7";
export const editorialSection =
  "border-border scroll-mt-8 border-t pt-12 sm:pt-16";
export const editorialSections = "flex min-w-0 flex-col gap-12 sm:gap-16";
// Table of contents on the left, article on the right.
export const contentReadingLayout =
  "grid items-start gap-10 pt-12 sm:pt-16 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16";
// Quiet navigation link (footer, dialog meta). Current page reads as foreground.
export const textLink =
  "text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground focus-visible:outline-ring rounded-sm text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

// Size and spacing for the primary action in a hero or closing panel.
export const heroButton = "h-11 gap-2 px-5";

export const editorialLink =
  "text-foreground hover:text-brand-foreground focus-visible:outline-ring inline-flex items-center gap-2 rounded-sm text-sm font-medium underline decoration-border underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

// Faint grid that echoes the trainer canvas. Put it on a relative element.
export const stageGrid =
  "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(var(--border)_1px,transparent_1px)] before:bg-size-[2.5rem_2.5rem] before:mask-[radial-gradient(ellipse_at_70%_50%,black,transparent_75%)] before:content-['']";

// Raised panel used for page heroes and closing calls to action.
export const contentStage = `bg-card ring-border/70 relative isolate overflow-hidden rounded-4xl ring-1 ${stageGrid}`;

// Drill card that floats on a stage.
export const drillCard =
  "bg-background/70 ring-border/60 hover:ring-primary/60 focus-visible:outline-ring rounded-xl ring-1 backdrop-blur-sm transition-shadow focus-visible:outline-2 motion-reduce:transition-none";

// Quiet fill for callouts, tiles, and highlighted cells. Light mode needs the
// full muted tone to stand off a white page; dark mode needs much less.
export const panelSurface = "bg-muted dark:bg-muted/40";

// Soft brand badge for section icons. Add a size utility at the call site.
export const iconBadge =
  "bg-primary/10 text-brand-foreground flex shrink-0 items-center justify-center rounded-full";

// Yellow marks the target and the next action: steps to follow count as both.
// Numbered steps share one layout on every page.
export const stepList = "grid gap-5";
export const stepItem =
  "grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-3";

export const stepNumber =
  "text-brand-foreground text-xl leading-none font-semibold tabular-nums";

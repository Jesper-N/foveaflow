// Class groups shared by the content pages and the trainer guide.

export const editorialTitle =
  "text-display font-bold wrap-anywhere hyphens-auto";
export const editorialHeading =
  "text-title font-semibold wrap-anywhere hyphens-auto";
export const editorialSubheading = "text-subtitle font-semibold text-balance";
export const editorialCopy = "text-muted-foreground max-w-2xl";

/** Quiet navigation link, as in a footer. The current page reads as foreground. */
export const textLink =
  "text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:font-semibold focus-visible:outline-ring rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

/** Inline link inside article copy. */
export const editorialLink =
  "text-foreground decoration-current/35 hover:decoration-current focus-visible:outline-ring inline-flex items-center gap-2 rounded-sm underline underline-offset-[0.2em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

/** Size and spacing for the main action in a hero or closing panel. */
export const heroButton = "h-11 gap-2 px-5";

/** Faint grid that echoes the trainer canvas. Put it on a `relative` element. */
export const stageGrid =
  "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(var(--border)_1px,transparent_1px)] before:bg-size-[2.5rem_2.5rem] before:mask-[radial-gradient(ellipse_at_70%_50%,black,transparent_75%)] before:content-['']";

/** Raised panel for page heroes and closing calls to action. */
export const contentStage = `bg-card ring-border/70 relative isolate overflow-hidden rounded-4xl ring-1 ${stageGrid}`;

/** Drill card that floats on a stage. */
export const drillCard =
  "bg-background/70 ring-border/60 hover:ring-primary/60 focus-visible:outline-ring rounded-xl ring-1 backdrop-blur-sm transition-shadow focus-visible:outline-2 motion-reduce:transition-none";

/**
 * Quiet fill for callouts, tiles, and highlighted cells. Light mode needs the
 * full muted tone to stand off a white page; dark mode needs much less.
 */
export const panelSurface = "bg-muted dark:bg-muted/40";

/** Soft brand badge for section icons. Add a size utility where it is used. */
export const iconBadge =
  "bg-primary/10 text-brand-foreground flex shrink-0 items-center justify-center rounded-full";

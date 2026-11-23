// Class groups shared by the content pages and the trainer guide.

export const editorialTitle =
  "text-4xl leading-[1.08] font-semibold text-balance wrap-anywhere hyphens-auto sm:text-5xl";

export const editorialHeading =
  "text-2xl leading-tight font-semibold wrap-anywhere hyphens-auto sm:text-3xl";

export const editorialLede =
  "max-w-2xl text-base leading-7 text-pretty sm:text-lg sm:leading-8";

export const editorialCopy = "max-w-2xl text-base leading-7";

/** Quiet navigation link, as in a footer. */
export const textLink =
  "rounded-sm text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

/** Inline link inside article copy. */
export const editorialLink =
  "inline-flex items-center gap-2 rounded-sm text-sm font-medium underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

/** A link that acts as a page action, with an icon beside its label. */
export const actionLink = "inline-flex min-h-11 items-center gap-2";

/** Raised panel for page heroes and closing calls to action. */
export const contentStage =
  "relative isolate overflow-hidden rounded-4xl ring-1";

/** Drill card that floats on a stage. */
export const drillCard =
  "rounded-xl ring-1 backdrop-blur-sm transition-shadow focus-visible:outline-2 motion-reduce:transition-none";

/** Round badge for section icons. Add a size utility where it is used. */
export const iconBadge =
  "flex shrink-0 items-center justify-center rounded-full";

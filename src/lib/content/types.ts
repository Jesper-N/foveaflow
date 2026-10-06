// All user-facing strings in `content/` are English source text. The UI
// passes them through `t()`, which looks them up in the dictionaries.

export interface FaqItem {
  question: string;
  answer: string;
}

/** Introduces the app or one drill in the trainer guide. */
export interface PageCopy {
  heading: string;
  hero: string;
  body: readonly string[];
}

/** A drill page also answers three common questions. */
export interface DrillPageCopy extends PageCopy {
  faq: readonly [FaqItem, FaqItem, FaqItem];
}

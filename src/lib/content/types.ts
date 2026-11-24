// All user-facing strings in `content/` are English source text. The UI
// passes them through `t()`, which looks them up in the dictionaries.

interface FaqItem {
  question: string;
  answer: string;
}

/** Introduces the app or one drill in the trainer guide. */
export interface PageCopy {
  heading: string;
  hero: string;
}

export interface DrillPageCopy extends PageCopy {
  faq: readonly FaqItem[];
}

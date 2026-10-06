import { getDictionary } from "./load-dictionary";
import { defaultLocale } from "./locales";
import { languageState } from "./state.svelte";

/**
 * Translates English source text into the current language. Reading the
 * locale here makes templates and deriveds that call `t` update when the
 * language changes. Text without a translation falls back to English.
 */
export const t = (message: string): string => {
  const { locale } = languageState;
  if (locale === defaultLocale) {
    return message;
  }
  return getDictionary(locale)?.get(message) ?? message;
};

/** Formats an ISO date like `2026-07-10` for the current language. */
export const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat(languageState.locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(isoDate));

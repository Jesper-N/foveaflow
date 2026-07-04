import {
  defaultLocale,
  getLanguageOption,
  getResolvedLocale,
  setResolvedLocale,
  type AppLocale,
} from "$lib/i18n/locales";
import { loadDictionary } from "$lib/i18n/translate";

class LanguageState {
  locale = $state<AppLocale>(defaultLocale);
  ready = $state(false);
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private requestId = 0;

  init() {
    if (this.initialized) return this.initPromise ?? Promise.resolve();
    this.initialized = true;
    this.initPromise = this.apply(getResolvedLocale(), false);
    return this.initPromise;
  }

  set(locale: AppLocale) {
    void this.apply(locale, true);
  }

  private async apply(locale: AppLocale, persist: boolean) {
    const requestId = ++this.requestId;

    try {
      await loadDictionary(locale);
    } catch {
      if (requestId === this.requestId) {
        this.locale = defaultLocale;
        this.ready = true;
        this.syncDocument();
      }
      return;
    }

    if (requestId !== this.requestId) return;

    this.locale = locale;
    this.ready = true;
    this.syncDocument();

    if (persist) {
      setResolvedLocale(locale);
    }
  }

  private syncDocument() {
    if (typeof document === "undefined") return;

    const option = getLanguageOption(this.locale);
    document.documentElement.lang = option.locale;
    document.documentElement.dir = option.direction;
    delete document.documentElement.dataset.i18nPending;
  }
}

export const languageState = new LanguageState();

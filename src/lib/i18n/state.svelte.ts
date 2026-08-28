import {
  defaultLocale,
  getLanguageOption,
  getResolvedLocale,
  setResolvedLocale,
} from "$lib/i18n/locales";
import type { AppLocale } from "$lib/i18n/locales";
import { loadDictionary } from "$lib/i18n/translate";

class LanguageState {
  locale = $state<AppLocale>(defaultLocale);
  ready = $state(false);
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private requestId = 0;

  init() {
    if (this.initialized) {
      return this.initPromise ?? Promise.resolve();
    }
    this.initialized = true;
    this.initPromise = this.initialize();
    return this.initPromise;
  }

  set(locale: AppLocale) {
    void this.apply(locale, true);
  }

  private async apply(locale: AppLocale, persist: boolean) {
    this.requestId += 1;
    const { requestId } = this;

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

    if (requestId !== this.requestId) {
      return;
    }

    this.locale = locale;
    this.ready = true;
    this.syncDocument();

    if (persist) {
      await setResolvedLocale(locale);
    }
  }

  private async initialize() {
    const locale = await getResolvedLocale();
    await this.apply(locale, false);
  }

  private syncDocument() {
    const browserDocument = globalThis.document;
    if (!browserDocument) {
      return;
    }

    const option = getLanguageOption(this.locale);
    browserDocument.documentElement.lang = option.locale;
    browserDocument.documentElement.dir = option.direction;
    delete browserDocument.documentElement.dataset.i18nPending;
  }
}

export const languageState = new LanguageState();

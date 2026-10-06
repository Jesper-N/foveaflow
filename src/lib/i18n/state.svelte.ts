import { loadDictionary } from "./load-dictionary";
import { defaultLocale, getResolvedLocale, setResolvedLocale } from "./locales";
import type { AppLocale } from "./locales";

/** The page language. Shared by every island, so changing it updates them all. */
class LanguageState {
  locale = $state<AppLocale>(defaultLocale);
  /** False until the visitor's language is resolved and loaded. */
  ready = $state(false);
  #initPromise: Promise<void> | null = null;
  #latestRequest = 0;

  /** Resolves the visitor's language once. Safe to call from every component. */
  init() {
    this.#initPromise ??= this.#initialize();
    return this.#initPromise;
  }

  set(locale: AppLocale) {
    void this.#apply(locale, true);
  }

  async #initialize() {
    await this.#apply(await getResolvedLocale(), false);
  }

  async #apply(locale: AppLocale, persist: boolean) {
    // A slow download must not override a language picked after it.
    this.#latestRequest += 1;
    const request = this.#latestRequest;

    try {
      await loadDictionary(locale);
    } catch {
      if (request === this.#latestRequest) {
        this.#show(defaultLocale);
      }
      return;
    }
    if (request !== this.#latestRequest) {
      return;
    }

    this.#show(locale);
    if (persist) {
      await setResolvedLocale(locale);
    }
  }

  #show(locale: AppLocale) {
    this.locale = locale;
    this.ready = true;

    const root = globalThis.document?.documentElement;
    if (!root) {
      return;
    }
    root.lang = locale;
    // Reveals the page that the boot script hid while the language loaded.
    delete root.dataset.i18nPending;
  }
}

export const languageState = new LanguageState();

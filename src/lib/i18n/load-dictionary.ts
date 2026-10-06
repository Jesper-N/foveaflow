import type { en } from "./dictionaries/en";
import { defaultLocale } from "./locales";
import type { AppLocale } from "./locales";

/** English source text mapped to its translation. */
type Dictionary = Record<keyof typeof en, string>;
type TranslatedLocale = Exclude<AppLocale, typeof defaultLocale>;

// English is the source language and needs no dictionary. The others load
// on demand, so each visitor downloads only their own language.
const dictionaryLoaders = {
  bn: async () => {
    const { bn } = await import("./dictionaries/bn");
    return bn;
  },
  de: async () => {
    const { de } = await import("./dictionaries/de");
    return de;
  },
  "es-419": async () => {
    const { es419 } = await import("./dictionaries/es-419");
    return es419;
  },
  fil: async () => {
    const { fil } = await import("./dictionaries/fil");
    return fil;
  },
  fr: async () => {
    const { fr } = await import("./dictionaries/fr");
    return fr;
  },
  hi: async () => {
    const { hi } = await import("./dictionaries/hi");
    return hi;
  },
  "pt-BR": async () => {
    const { ptBR } = await import("./dictionaries/pt-br");
    return ptBR;
  },
  "zh-CN": async () => {
    const { zhCN } = await import("./dictionaries/zh-cn");
    return zhCN;
  },
  "zh-HK": async () => {
    const { zhHK } = await import("./dictionaries/zh-hk");
    return zhHK;
  },
} satisfies Record<TranslatedLocale, () => Promise<Dictionary>>;

const loadedDictionaries = new Map<AppLocale, ReadonlyMap<string, string>>();
const pendingDictionaries = new Map<TranslatedLocale, Promise<Dictionary>>();

export const getDictionary = (locale: AppLocale) =>
  loadedDictionaries.get(locale);

export const loadDictionary = async (locale: AppLocale) => {
  if (locale === defaultLocale || loadedDictionaries.has(locale)) {
    return;
  }

  // Concurrent requests for one language share a single download.
  let pending = pendingDictionaries.get(locale);
  if (!pending) {
    pending = dictionaryLoaders[locale]();
    pendingDictionaries.set(locale, pending);
  }

  try {
    const dictionary = await pending;
    loadedDictionaries.set(locale, new Map(Object.entries(dictionary)));
  } finally {
    pendingDictionaries.delete(locale);
  }
};

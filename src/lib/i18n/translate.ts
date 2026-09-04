import type { en } from "$lib/i18n/dictionaries/en";
import type { AppLocale } from "$lib/i18n/locales";
import { defaultLocale } from "$lib/i18n/locales";

type Dictionary = Record<keyof typeof en, string>;
type TranslatedLocale = Exclude<AppLocale, typeof defaultLocale>;

const dictionaries = new Map<TranslatedLocale, ReadonlyMap<string, string>>();

const dictionaryLoaders = {
  bn: async () => {
    const { bn } = await import("$lib/i18n/dictionaries/bn");
    return bn;
  },
  de: async () => {
    const { de } = await import("$lib/i18n/dictionaries/de");
    return de;
  },
  "es-419": async () => {
    const { es419 } = await import("$lib/i18n/dictionaries/es-419");
    return es419;
  },
  fil: async () => {
    const { fil } = await import("$lib/i18n/dictionaries/fil");
    return fil;
  },
  fr: async () => {
    const { fr } = await import("$lib/i18n/dictionaries/fr");
    return fr;
  },
  hi: async () => {
    const { hi } = await import("$lib/i18n/dictionaries/hi");
    return hi;
  },
  "pt-BR": async () => {
    const { ptBR } = await import("$lib/i18n/dictionaries/pt-br");
    return ptBR;
  },
  "zh-CN": async () => {
    const { zhCN } = await import("$lib/i18n/dictionaries/zh-cn");
    return zhCN;
  },
  "zh-HK": async () => {
    const { zhHK } = await import("$lib/i18n/dictionaries/zh-hk");
    return zhHK;
  },
} satisfies Record<TranslatedLocale, () => Promise<Dictionary>>;

const dictionaryPromises = new Map<TranslatedLocale, Promise<Dictionary>>();

export const loadDictionary = async (locale: AppLocale) => {
  if (locale === defaultLocale) {
    return;
  }
  if (dictionaries.has(locale)) {
    return;
  }

  const pendingDictionary = dictionaryPromises.get(locale);
  if (pendingDictionary) {
    await pendingDictionary;
    return;
  }

  const dictionaryPromise = dictionaryLoaders[locale]();
  dictionaryPromises.set(locale, dictionaryPromise);

  try {
    const dictionary = await dictionaryPromise;
    dictionaries.set(locale, new Map(Object.entries(dictionary)));
  } finally {
    dictionaryPromises.delete(locale);
  }
};

export const t = (locale: AppLocale, text: string): string => {
  if (locale === defaultLocale) {
    return text;
  }
  return dictionaries.get(locale)?.get(text) ?? text;
};

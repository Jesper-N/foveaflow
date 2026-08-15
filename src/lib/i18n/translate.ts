import type { en } from "$lib/i18n/dictionaries/en";
import type { AppLocale } from "$lib/i18n/locales";
import { defaultLocale } from "$lib/i18n/locales";

type Dictionary = Record<keyof typeof en, string>;
type TranslatedLocale = Exclude<AppLocale, typeof defaultLocale>;

const dictionaries = new Map<TranslatedLocale, ReadonlyMap<string, string>>();

const loadBn = async () => {
  const module = await import("$lib/i18n/dictionaries/bn");
  return module.bn;
};

const loadDe = async () => {
  const module = await import("$lib/i18n/dictionaries/de");
  return module.de;
};

const loadEs419 = async () => {
  const module = await import("$lib/i18n/dictionaries/es-419");
  return module.es419;
};

const loadFil = async () => {
  const module = await import("$lib/i18n/dictionaries/fil");
  return module.fil;
};

const loadFr = async () => {
  const module = await import("$lib/i18n/dictionaries/fr");
  return module.fr;
};

const loadHi = async () => {
  const module = await import("$lib/i18n/dictionaries/hi");
  return module.hi;
};

const loadPtBr = async () => {
  const module = await import("$lib/i18n/dictionaries/pt-br");
  return module.ptBR;
};

const loadZhCn = async () => {
  const module = await import("$lib/i18n/dictionaries/zh-cn");
  return module.zhCN;
};

const loadZhHk = async () => {
  const module = await import("$lib/i18n/dictionaries/zh-hk");
  return module.zhHK;
};

const dictionaryLoaders = {
  bn: loadBn,
  de: loadDe,
  "es-419": loadEs419,
  fil: loadFil,
  fr: loadFr,
  hi: loadHi,
  "pt-BR": loadPtBr,
  "zh-CN": loadZhCn,
  "zh-HK": loadZhHk,
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

import type { AppLocale } from "$lib/i18n/locales";
import { defaultLocale } from "$lib/i18n/locales";
import type { en } from "$lib/i18n/dictionaries/en";

type Dictionary = Record<keyof typeof en, string>;
type TranslatedLocale = Exclude<AppLocale, typeof defaultLocale>;

const dictionaries: Partial<Record<TranslatedLocale, Dictionary>> = {};

const dictionaryLoaders = {
  "zh-CN": async () => (await import("$lib/i18n/dictionaries/zh-CN")).zhCN,
  "zh-HK": async () => (await import("$lib/i18n/dictionaries/zh-HK")).zhHK,
  "pt-BR": async () => (await import("$lib/i18n/dictionaries/pt-BR")).ptBR,
  "es-419": async () => (await import("$lib/i18n/dictionaries/es-419")).es419,
  fr: async () => (await import("$lib/i18n/dictionaries/fr")).fr,
  bn: async () => (await import("$lib/i18n/dictionaries/bn")).bn,
  hi: async () => (await import("$lib/i18n/dictionaries/hi")).hi,
  fil: async () => (await import("$lib/i18n/dictionaries/fil")).fil,
  de: async () => (await import("$lib/i18n/dictionaries/de")).de,
} satisfies Record<TranslatedLocale, () => Promise<Dictionary>>;

const dictionaryPromises: Partial<
  Record<TranslatedLocale, Promise<Dictionary>>
> = {};

export const loadDictionary = async (locale: AppLocale) => {
  if (locale === defaultLocale) return;
  if (dictionaries[locale]) return;

  dictionaryPromises[locale] ??= dictionaryLoaders[locale]()
    .then((dictionary) => {
      dictionaries[locale] = dictionary;
      return dictionary;
    })
    .catch((error: unknown) => {
      delete dictionaryPromises[locale];
      throw error;
    });

  await dictionaryPromises[locale];
};

export const t = (locale: AppLocale, text: string): string => {
  if (locale === defaultLocale) return text;
  return dictionaries[locale]?.[text as keyof typeof en] ?? text;
};

import type { AppLocale } from "$lib/i18n/locales";
import { en } from "$lib/i18n/dictionaries/en";

type Dictionary = Record<keyof typeof en, string>;

const dictionaries: Partial<Record<AppLocale, Dictionary>> = { en };

const dictionaryLoaders = {
  en: async () => en,
  "zh-CN": async () => (await import("$lib/i18n/dictionaries/zh-CN")).zhCN,
  "zh-HK": async () => (await import("$lib/i18n/dictionaries/zh-HK")).zhHK,
  "pt-BR": async () => (await import("$lib/i18n/dictionaries/pt-BR")).ptBR,
  "es-419": async () => (await import("$lib/i18n/dictionaries/es-419")).es419,
  fr: async () => (await import("$lib/i18n/dictionaries/fr")).fr,
  bn: async () => (await import("$lib/i18n/dictionaries/bn")).bn,
  hi: async () => (await import("$lib/i18n/dictionaries/hi")).hi,
  fil: async () => (await import("$lib/i18n/dictionaries/fil")).fil,
  de: async () => (await import("$lib/i18n/dictionaries/de")).de,
} satisfies Record<AppLocale, () => Promise<Dictionary>>;

const dictionaryPromises: Partial<Record<AppLocale, Promise<Dictionary>>> = {};

export const loadDictionary = async (locale: AppLocale) => {
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

export const t = (locale: AppLocale, text: string): string =>
  text in en ? (dictionaries[locale] ?? en)[text as keyof typeof en] : text;

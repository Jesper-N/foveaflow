import {
  baseLocale,
  cookieMaxAge,
  cookieName,
  getLocale,
  locales,
  localStorageKey,
  setLocale,
  type Locale as ParaglideLocale,
} from "../../paraglide/runtime.js";

export const defaultLocale = baseLocale;
export const localeCookieMaxAge = cookieMaxAge;
export const localeCookieName = cookieName;
export const localeLocalStorageKey = localStorageKey;

export const languageOptions = [
  {
    locale: "en",
    flag: "🇺🇸",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
  },
  {
    locale: "zh-CN",
    flag: "🇨🇳",
    label: "Chinese (Simplified)",
    nativeLabel: "简体中文",
    direction: "ltr",
  },
  {
    locale: "zh-HK",
    flag: "🇭🇰",
    label: "Chinese (Traditional)",
    nativeLabel: "繁體中文",
    direction: "ltr",
  },
  {
    locale: "pt-BR",
    flag: "🇧🇷",
    label: "Portuguese (Brazil)",
    nativeLabel: "Português do Brasil",
    direction: "ltr",
  },
  {
    locale: "es-419",
    flag: "🇦🇷",
    label: "Spanish",
    nativeLabel: "Español",
    direction: "ltr",
  },
  {
    locale: "fr",
    flag: "🇫🇷",
    label: "French",
    nativeLabel: "Français",
    direction: "ltr",
  },
  {
    locale: "bn",
    flag: "🇧🇩",
    label: "Bengali",
    nativeLabel: "বাংলা",
    direction: "ltr",
  },
  {
    locale: "hi",
    flag: "🇮🇳",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    direction: "ltr",
  },
  {
    locale: "fil",
    flag: "🇵🇭",
    label: "Filipino",
    nativeLabel: "Filipino",
    direction: "ltr",
  },
  {
    locale: "de",
    flag: "🇩🇪",
    label: "German",
    nativeLabel: "Deutsch",
    direction: "ltr",
  },
] as const satisfies readonly {
  locale: ParaglideLocale;
  flag: string;
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
}[];

export type AppLocale = ParaglideLocale;

export type LanguageOption = (typeof languageOptions)[number];

const supportedLocaleSet: ReadonlySet<string> = new Set(locales);

export const isAppLocale = (value: string): value is AppLocale =>
  supportedLocaleSet.has(value);

export const getLanguageOption = (locale: AppLocale): LanguageOption =>
  languageOptions.find((option) => option.locale === locale) ??
  languageOptions[0];

export const localeAliases: Readonly<Record<string, AppLocale>> = {
  en: "en",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-hk": "zh-HK",
  "zh-mo": "zh-HK",
  "zh-tw": "zh-HK",
  "zh-hant": "zh-HK",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  es: "es-419",
  fr: "fr",
  bn: "bn",
  hi: "hi",
  fil: "fil",
  tl: "fil",
  de: "de",
};

export const localePrefixAliases = [
  ["en-", "en"],
  ["zh-hans-", "zh-CN"],
  ["zh-hant-", "zh-HK"],
  ["zh-", "zh-CN"],
  ["pt-", "pt-BR"],
  ["es-", "es-419"],
  ["fr-", "fr"],
  ["bn-", "bn"],
  ["hi-", "hi"],
  ["fil-", "fil"],
  ["tl-", "fil"],
  ["de-", "de"],
] as const satisfies readonly (readonly [string, AppLocale])[];

export const resolveSupportedLocale = (
  value: string | null | undefined,
): AppLocale | null => {
  if (!value) return null;

  const locale = value.replace(/_/g, "-");
  if (isAppLocale(locale)) return locale;

  const lower = locale.toLowerCase();
  const alias = localeAliases[lower];
  if (alias) return alias;

  return (
    localePrefixAliases.find(([prefix]) => lower.startsWith(prefix))?.[1] ??
    null
  );
};

export const normalizeLocale = (
  value: string | null | undefined,
): AppLocale => {
  return resolveSupportedLocale(value) ?? defaultLocale;
};

export const getResolvedLocale = (): AppLocale => normalizeLocale(getLocale());

export const setResolvedLocale = (locale: AppLocale) => {
  setLocale(locale, { reload: false });
};

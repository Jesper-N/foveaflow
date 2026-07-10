export const defaultLocale = "en";
export const localeCookieMaxAge = 34_560_000;
export const localeCookieName = "PARAGLIDE_LOCALE";

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
  locale: string;
  flag: string;
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
}[];

export type LanguageOption = (typeof languageOptions)[number];
export type AppLocale = LanguageOption["locale"];

const supportedLocaleSet: ReadonlySet<string> = new Set(
  languageOptions.map(({ locale }) => locale),
);

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

const resolveSupportedLocale = (
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

const readCookieLocale = () => {
  if (typeof document === "undefined") return null;

  const prefix = `${localeCookieName}=`;
  const value = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);

  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

const readLocalStorageLocale = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(localeCookieName);
  } catch {
    return null;
  }
};

const readPreferredLocale = (): AppLocale | null => {
  if (typeof navigator === "undefined") return null;

  const preferredLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ];
  for (const language of preferredLanguages) {
    const locale = resolveSupportedLocale(language);
    if (locale) return locale;
  }

  return null;
};

export const getResolvedLocale = (): AppLocale =>
  resolveSupportedLocale(readCookieLocale()) ??
  resolveSupportedLocale(readLocalStorageLocale()) ??
  readPreferredLocale() ??
  defaultLocale;

export const setResolvedLocale = (locale: AppLocale) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(localeCookieName, locale);
  } catch {
    // Storage can be blocked by browser privacy settings.
  }

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${localeCookieName}=${encodeURIComponent(locale)}; Path=/; Max-Age=${localeCookieMaxAge}; SameSite=Lax${secure}`;
  } catch {
    // Cookie writes can be blocked independently of local storage.
  }
};

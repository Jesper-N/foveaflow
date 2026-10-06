export const defaultLocale = "en";
/** 400 days, the longest cookie lifetime browsers allow. */
export const localeCookieMaxAge = 34_560_000;
/** Also the local storage key. Kept from an earlier i18n library so saved choices survive. */
export const localeCookieName = "PARAGLIDE_LOCALE";

export const languageOptions = [
  {
    label: "English",
    locale: "en",
    nativeLabel: "English",
  },
  {
    label: "Chinese (Simplified)",
    locale: "zh-CN",
    nativeLabel: "简体中文",
  },
  {
    label: "Chinese (Traditional)",
    locale: "zh-HK",
    nativeLabel: "繁體中文",
  },
  {
    label: "Portuguese (Brazil)",
    locale: "pt-BR",
    nativeLabel: "Português do Brasil",
  },
  {
    label: "Spanish",
    locale: "es-419",
    nativeLabel: "Español",
  },
  {
    label: "French",
    locale: "fr",
    nativeLabel: "Français",
  },
  {
    label: "Bengali",
    locale: "bn",
    nativeLabel: "বাংলা",
  },
  {
    label: "Hindi",
    locale: "hi",
    nativeLabel: "हिन्दी",
  },
  {
    label: "Filipino",
    locale: "fil",
    nativeLabel: "Filipino",
  },
  {
    label: "German",
    locale: "de",
    nativeLabel: "Deutsch",
  },
] as const satisfies readonly {
  locale: string;
  label: string;
  nativeLabel: string;
}[];

export type LanguageOption = (typeof languageOptions)[number];
export type AppLocale = LanguageOption["locale"];

const supportedLocaleSet: ReadonlySet<string> = new Set(
  languageOptions.map(({ locale }) => locale)
);

export const isAppLocale = (value: string): value is AppLocale =>
  supportedLocaleSet.has(value);

export const getLanguageOption = (locale: AppLocale): LanguageOption =>
  languageOptions.find((option) => option.locale === locale) ??
  languageOptions[0];

export const localeAliases = {
  bn: "bn",
  de: "de",
  en: "en",
  es: "es-419",
  fil: "fil",
  fr: "fr",
  hi: "hi",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  tl: "fil",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-hant": "zh-HK",
  "zh-hk": "zh-HK",
  "zh-mo": "zh-HK",
  "zh-tw": "zh-HK",
} as const satisfies Readonly<Record<string, AppLocale>>;

const localeAliasMap = new Map<string, AppLocale>(
  Object.entries(localeAliases)
);

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

/** Maps a browser or saved language tag to a supported locale. */
const resolveSupportedLocale = (
  value: string | null | undefined
): AppLocale | null => {
  if (!value) {
    return null;
  }

  const locale = value.replaceAll("_", "-");
  if (isAppLocale(locale)) {
    return locale;
  }

  const lower = locale.toLowerCase();
  const alias = localeAliasMap.get(lower);
  if (alias) {
    return alias;
  }

  return (
    localePrefixAliases.find(([prefix]) => lower.startsWith(prefix))?.[1] ??
    null
  );
};

const readCookieLocale = async () => {
  const browserCookieStore = globalThis.cookieStore;
  if (!browserCookieStore) {
    return null;
  }

  try {
    const cookie = await browserCookieStore.get(localeCookieName);
    return cookie?.value ?? null;
  } catch {
    return null;
  }
};

const readLocalStorageLocale = () => {
  try {
    return globalThis.localStorage?.getItem(localeCookieName) ?? null;
  } catch {
    return null;
  }
};

const readPreferredLocale = (): AppLocale | null => {
  const browserNavigator = globalThis.navigator;
  if (!browserNavigator) {
    return null;
  }

  const preferredLanguages = [
    ...(browserNavigator.languages ?? []),
    browserNavigator.language,
  ];
  for (const language of preferredLanguages) {
    const locale = resolveSupportedLocale(language);
    if (locale) {
      return locale;
    }
  }

  return null;
};

/** The saved language, then the browser's, then English. */
export const getResolvedLocale = async (): Promise<AppLocale> =>
  resolveSupportedLocale(await readCookieLocale()) ??
  resolveSupportedLocale(readLocalStorageLocale()) ??
  readPreferredLocale() ??
  defaultLocale;

/** Remembers the language in local storage and a cookie the boot script can read. */
export const setResolvedLocale = async (locale: AppLocale) => {
  const browserWindow = globalThis.window;
  if (!browserWindow) {
    return;
  }

  try {
    browserWindow.localStorage.setItem(localeCookieName, locale);
  } catch {
    // Storage can be blocked by browser privacy settings.
  }

  const browserCookieStore = globalThis.cookieStore;
  if (!browserCookieStore) {
    return;
  }

  try {
    await browserCookieStore.set({
      expires: Date.now() + localeCookieMaxAge * 1000,
      name: localeCookieName,
      path: "/",
      sameSite: "lax",
      value: locale,
    });
  } catch {
    // Cookie writes can be blocked independently of local storage.
  }
};

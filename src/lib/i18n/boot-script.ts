import {
  defaultLocale,
  languageOptions,
  localeAliases,
  localeCookieMaxAge,
  localeCookieName,
  localePrefixAliases,
} from "./locales";

const config = {
  cookieMaxAge: localeCookieMaxAge,
  cookieName: localeCookieName,
  defaultLocale,
  localeAliases,
  localePrefixAliases,
  locales: languageOptions.map((option) => option.locale),
};

/**
 * Inline script that runs before first paint. It sets `<html lang>` from the
 * saved or browser language and hides the page until that language's text
 * loads, so visitors never see English flash first. The lookup mirrors
 * `resolveSupportedLocale` in `locales.ts`.
 */
export const localeBootScript = `
(() => {
  const config = ${JSON.stringify(config)};
  const resolveSupportedLocale = (value) => {
    if (!value) return null;

    const locale = String(value).replace(/_/g, "-");
    if (config.locales.includes(locale)) return locale;

    const lower = locale.toLowerCase();
    if (config.localeAliases[lower]) return config.localeAliases[lower];

    const prefixAlias = config.localePrefixAliases.find(([prefix]) => lower.startsWith(prefix));
    return prefixAlias ? prefixAlias[1] : null;
  };
  const readStoredLocale = () => {
    try {
      return window.localStorage.getItem(config.cookieName);
    } catch {
      return null;
    }
  };
  const readCookieLocale = () => {
    const cookiePrefix = config.cookieName + "=";
    const cookie = document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(cookiePrefix));
    if (!cookie) return null;

    try {
      return decodeURIComponent(cookie.slice(cookiePrefix.length));
    } catch {
      return null;
    }
  };
  const readBrowserLocale = () => {
    const languages = Array.isArray(navigator.languages) ? navigator.languages : [];
    for (const language of [...languages, navigator.language]) {
      const locale = resolveSupportedLocale(language);
      if (locale) return locale;
    }
    return null;
  };

  const cookieLocale = resolveSupportedLocale(readCookieLocale());
  const storedLocale = resolveSupportedLocale(readStoredLocale());
  const locale = cookieLocale || storedLocale || readBrowserLocale() || config.defaultLocale;
  document.documentElement.lang = locale;

  if (locale !== config.defaultLocale) {
    // Never keep the page hidden if the app fails to load.
    document.documentElement.dataset.i18nPending = "true";
    window.setTimeout(() => {
      delete document.documentElement.dataset.i18nPending;
    }, 2500);
  }

  if (storedLocale || locale !== config.defaultLocale) {
    try {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = config.cookieName + "=" + encodeURIComponent(locale) + "; Path=/; Max-Age=" + config.cookieMaxAge + "; SameSite=Lax" + secure;
    } catch {
      // Cookie writes can be blocked.
    }
  }
})();
`;

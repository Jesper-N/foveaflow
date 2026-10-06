/** The site origin from Astro's `site` config, which every absolute URL needs. */
export const getSiteOrigin = (site: URL | undefined) => {
  if (!site) {
    throw new Error("Set `site` in astro.config.mjs.");
  }
  return new URL(site.origin);
};

export const absoluteUrl = (path: string, site: URL) =>
  new URL(path, site).toString();

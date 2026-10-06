import { articles } from "$lib/content/articles";
import { indexableDrillRoutes } from "$lib/content/drill-routes";
import { guideMetadata } from "$lib/content/guide";
import { legalPages } from "$lib/content/legal";
import { siteMetadata } from "$lib/content/site";

import { absoluteUrl } from "./site-url";

const sitemapEntries = [
  { lastModified: siteMetadata.homepageLastModified, path: "/" },
  { lastModified: guideMetadata.lastModified, path: "/guide/" },
  ...articles.map(({ path, lastModified }) => ({ lastModified, path })),
  ...Object.values(legalPages).map(({ path, lastModified }) => ({
    lastModified,
    path,
  })),
  ...indexableDrillRoutes.map(({ path, lastModified }) => ({
    lastModified,
    path,
  })),
] as const;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const sitemapXml = (site: URL) => {
  const urls = sitemapEntries
    .map(({ path, lastModified }) =>
      [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(path, site))}</loc>`,
        `    <lastmod>${escapeXml(lastModified)}</lastmod>`,
        "  </url>",
      ].join("\n")
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
};

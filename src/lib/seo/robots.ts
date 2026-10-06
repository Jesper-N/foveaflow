import { absoluteUrl } from "./site-url";

/** Values for the robots meta tag. */
export const robotsMeta = {
  index: "index,follow,max-image-preview:large",
  noindex: "noindex,follow",
} as const;

export const robotsText = (site: URL) =>
  [
    "# FoveaFlow allows search engines and AI tools to crawl public pages.",
    "User-agent: *",
    "Allow: /",
    "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml", site)}`,
    "",
  ].join("\n");

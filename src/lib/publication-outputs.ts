import { legalPageLinks, legalPages } from "./content/legal";
import { guideMetadata } from "./content/page-copy";
import { siteMetadata } from "./content/site";
import { supportPages } from "./content/support-pages";
import { indexableTrainerRoutes } from "./content/trainer-routes";
import {
  referenceLinks,
  safetyNote,
  trainingModeNotes,
} from "./content/training";
import { absoluteUrl } from "./seo";

const sitemapEntries = [
  { lastModified: siteMetadata.homepageLastModified, path: "/" },
  { lastModified: guideMetadata.lastModified, path: "/guide/" },
  ...supportPages.map(({ path, lastModified }) => ({ lastModified, path })),
  {
    lastModified: legalPages.privacy.lastModified,
    path: legalPageLinks.privacy.path,
  },
  {
    lastModified: legalPages.terms.lastModified,
    path: legalPageLinks.terms.path,
  },
  ...indexableTrainerRoutes.map(({ path, lastModified }) => ({
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

export const buildSitemapXml = (site: URL) => {
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

export const buildRobotsText = (site: URL) =>
  [
    "# FoveaFlow allows search engines and AI tools to crawl public pages.",
    "User-agent: *",
    "Allow: /",
    "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml", site)}`,
    "",
  ].join("\n");

export const buildLlmsText = (site: URL) =>
  [
    "# FoveaFlow",
    "",
    `> ${siteMetadata.shortDescription}`,
    "",
    "Key facts:",
    "",
    "- Price: free",
    "- Account required: no",
    "- Install required: no",
    "- Settings storage: local browser storage on the current device",
    "- Safety status: practice software, not medical advice, diagnosis, treatment, vision therapy, or a medical device",
    "",
    "Training modes:",
    "",
    ...trainingModeNotes.map((mode) => `- ${mode.title}: ${mode.body}`),
    "",
    "Controls: Speed, target size, shape, color, opacity, trail, motion path, behavior, distractor count, viewing distance, screen scale, and Lilac Chaser color and scale.",
    "",
    `Safety: ${safetyNote}`,
    "",
    "## Main resources",
    "",
    `- [App](${absoluteUrl("/", site)}): Open the FoveaFlow trainer.`,
    `- [Guide](${absoluteUrl("/guide/", site)}): Read the complete usage and safety guide.`,
    ...supportPages.map(
      (page) =>
        `- [${page.heading}](${absoluteUrl(page.path, site)}): ${page.description}`
    ),
    `- [Pricing](${absoluteUrl("/pricing.md", site)}): Pricing and plan details.`,
    `- [Privacy](${absoluteUrl(legalPageLinks.privacy.path, site)}): Privacy policy.`,
    `- [Terms](${absoluteUrl(legalPageLinks.terms.path, site)}): Terms of use.`,
    `- [Source code](${siteMetadata.repositoryUrl}): Project repository.`,
    "",
    "## Direct drill routes",
    "",
    ...indexableTrainerRoutes.map(
      (route) =>
        `- [${route.label}](${absoluteUrl(route.path, site)}): ${route.description}`
    ),
    "",
    "## Background reading",
    "",
    ...referenceLinks.map(
      (reference) => `- [${reference.label}](${reference.url})`
    ),
    "",
  ].join("\n");

export const buildPricingText = (site: URL) =>
  [
    "# Pricing",
    "",
    "FoveaFlow is free online eye training for visual tracking and focus.",
    "",
    "## Free",
    "- Price: $0",
    "- Account required: no",
    "- Install required: no",
    "- Included: Smooth Pursuit, Reaction Jumps, Multiple Distractions, Lilac Chaser, motion patterns, visual settings, calibration controls, and settings stored locally in your browser",
    "- Best fit: gamers, IT professionals, developers, sysadmins, support engineers, and people on screens all day",
    "- Paid plan: none",
    "",
    `Use the app: ${absoluteUrl("/", site)}`,
    "",
  ].join("\n");

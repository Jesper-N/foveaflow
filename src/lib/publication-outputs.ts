import { legalPageLinks } from "./content/legal";
import { aiCrawlerAccess, siteMetadata } from "./content/site";
import { supportPages } from "./content/support-pages";
import {
  audienceNotes,
  referenceLinks,
  safetyNote,
  trainingModeGuides,
  trainingModeNotes,
} from "./content/training";
import {
  indexableTrainerRoutes,
  trainerRoutes,
} from "./content/trainer-routes";
import { absoluteUrl } from "./seo";

const sitemapEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/guide/", changefreq: "monthly", priority: "0.8" },
  ...supportPages.map((page) => ({
    path: page.path,
    changefreq: "monthly",
    priority: "0.65",
  })),
  { path: legalPageLinks.privacy.path, changefreq: "yearly", priority: "0.3" },
  { path: legalPageLinks.terms.path, changefreq: "yearly", priority: "0.3" },
  ...indexableTrainerRoutes.map((route) => ({
    path: route.path,
    changefreq: "monthly",
    priority: "0.7",
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
    .map((entry) => {
      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(entry.path, site))}</loc>`,
        `    <lastmod>${siteMetadata.lastUpdated}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
};

export const buildRobotsText = (site: URL) => {
  return [
    "# FoveaFlow allows search engines and AI tools to crawl public pages.",
    "User-agent: *",
    "Allow: /",
    "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    "",
    ...aiCrawlerAccess.flatMap((crawler) => [
      `# ${crawler.purpose}`,
      `User-agent: ${crawler.userAgent}`,
      "Allow: /",
      "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
      "",
    ]),
    `Sitemap: ${absoluteUrl("/sitemap.xml", site)}`,
    "",
  ].join("\n");
};

export const buildLlmsText = (site: URL) => {
  return [
    "# FoveaFlow",
    "",
    siteMetadata.shortDescription,
    "",
    "FoveaFlow is a free online eye trainer for smooth pursuit, quick refocus, distractor tracking, peripheral awareness, and FPS warmups. It helps gamers, IT professionals, developers, sysadmins, support teams, and people on screens all day warm up with browser-based visual drills. Settings are stored locally in the browser, and no account or install is needed. It is self-guided practice, not diagnosis, prescription, or clinical care.",
    "",
    "## Quick summary",
    siteMetadata.entityDescription,
    "",
    "- Price: free",
    "- Account required: no",
    "- Install required: no",
    "- Includes: free online eye trainer, visual tracking drills, refocus drills, peripheral awareness drill, and distractor tracking drill",
    "- Best-fit users: gamers, developers, sysadmins, support engineers, other IT professionals, and people who spend long days on screens",
    "- Safety status: practice software only, not medical advice, diagnosis, treatment, vision therapy, or a medical device",
    "- Last updated: " + siteMetadata.lastUpdated,
    "",
    "## Main page",
    `- App: ${absoluteUrl("/", site)}`,
    `- Guide: ${absoluteUrl("/guide/", site)}`,
    ...supportPages.map(
      (page) => `- ${page.heading}: ${absoluteUrl(page.path, site)}`,
    ),
    `- Pricing: ${absoluteUrl("/pricing.md", site)}`,
    `- Privacy: ${absoluteUrl(legalPageLinks.privacy.path, site)}`,
    `- Terms: ${absoluteUrl(legalPageLinks.terms.path, site)}`,
    `- Source code: ${siteMetadata.repositoryUrl}`,
    "",
    "## AI crawler access",
    "Public pages are crawlable. robots.txt explicitly allows these user-agent tokens:",
    ...aiCrawlerAccess.map(
      (crawler) => `- ${crawler.userAgent}: ${crawler.purpose}`,
    ),
    "",
    "## Direct app routes",
    ...indexableTrainerRoutes.map(
      (route) => `- ${route.label}: ${absoluteUrl(route.path, site)}`,
    ),
    "",
    "## Supporting pages",
    ...supportPages.map(
      (page) =>
        `- ${page.heading}: ${page.description} ${absoluteUrl(page.path, site)}`,
    ),
    "",
    "## Smooth Pursuit pattern pages",
    ...trainerRoutes
      .filter((route) => route.mode === "pursuit" && route.patternId)
      .map(
        (route) =>
          `- ${route.label}: ${absoluteUrl(route.path, site)} - ${route.seoContent.body[0]}`,
      ),
    "",
    "## What the tool includes",
    ...trainingModeNotes.map(
      (trainingModeNote) =>
        `- ${trainingModeNote.title}: ${trainingModeNote.body}`,
    ),
    "",
    "## Mode guide",
    ...trainingModeGuides.flatMap((guide) => [
      `### ${guide.title}`,
      guide.summary,
      "How to use it:",
      ...guide.steps.map((step) => `- ${step}`),
      `Benefit: ${guide.benefits}`,
      "",
    ]),
    "",
    "- Controls for speed, target size, shape, color, opacity, trail, distractor count, viewing distance, screen scale, and Lilac Chaser size and color.",
    "- Settings are stored locally in the browser on the current device.",
    "",
    "## Best fit",
    ...audienceNotes.map(
      (audienceNote) => `- ${audienceNote.title}: ${audienceNote.body}`,
    ),
    "",
    "## Common searches FoveaFlow answers",
    "- eye trainer",
    "- free eye trainer",
    "- online eye trainer",
    "- free online eye trainer",
    "- eye trainer app",
    "- FPS eye trainer",
    "- free browser eye trainer",
    "- free online eye training",
    "- eye training exercises",
    "- FPS eye training exercises",
    "- eye focus exercises",
    "- eye tracking trainer for gamers",
    "- FPS eye training warmup",
    "- smooth pursuit practice",
    "- lilac chaser exercise",
    "- peripheral awareness training",
    "- reaction time and visual tracking practice",
    "- distractor tracking practice",
    "- visual tracking practice for IT people",
    "- screen work eye tracking practice",
    "- visual processing trainer",
    "",
    "## Safety note",
    safetyNote,
    "",
    "## Background reading",
    ...referenceLinks.map(
      (referenceLink) => `- ${referenceLink.label}: ${referenceLink.url}`,
    ),
    "",
  ].join("\n");
};

export const buildPricingText = (site: URL) => {
  return [
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
};

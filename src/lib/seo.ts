import { legalPageLinks } from "./content/legal";
import { guideFaqItems, guideMetadata } from "./content/page-copy";
import { aiCrawlerAccess, siteMetadata } from "./content/site";
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
  type TrainerRoute,
} from "./content/trainer-routes";
import type { LegalPageContent } from "./content/legal";

export const defaultSiteUrl = "https://foveaflow.com";

const sitemapEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/guide/", changefreq: "monthly", priority: "0.8" },
  { path: legalPageLinks.privacy.path, changefreq: "yearly", priority: "0.3" },
  { path: legalPageLinks.terms.path, changefreq: "yearly", priority: "0.3" },
  ...indexableTrainerRoutes.map((route) => ({
    path: route.path,
    changefreq: "monthly",
    priority: "0.7",
  })),
] as const;

export const getSiteOrigin = (site: URL | undefined) => {
  const siteUrl = site ?? new URL(defaultSiteUrl);
  return new URL(siteUrl.origin);
};

export const absoluteUrl = (path: string, site: URL) =>
  new URL(path, site).toString();

const getOrganizationId = (site: URL) =>
  `${absoluteUrl("/", site)}#organization`;

const buildOrganizationStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);
  const logoUrl = absoluteUrl("/metadata/favicon-96x96.png", site);

  return {
    "@type": "Organization",
    "@id": getOrganizationId(site),
    name: siteMetadata.name,
    alternateName: siteMetadata.alternateName,
    url: appUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 96,
      height: 96,
    },
    image: imageUrl,
    description: siteMetadata.entityDescription,
    sameAs: siteMetadata.sameAs,
    knowsAbout: siteMetadata.keywords,
  };
};

const buildWebsiteStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);

  return {
    "@type": "WebSite",
    "@id": `${appUrl}#website`,
    name: siteMetadata.name,
    alternateName: siteMetadata.alternateName,
    url: appUrl,
    description: siteMetadata.shortDescription,
    inLanguage: "en",
    keywords: siteMetadata.keywords.join(", "),
    publisher: {
      "@id": getOrganizationId(site),
    },
  };
};

const buildAppStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@type": "WebApplication",
    "@id": `${appUrl}#app`,
    name: siteMetadata.name,
    url: appUrl,
    image: imageUrl,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Eye training and visual tracking practice",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern browser.",
    isAccessibleForFree: true,
    publisher: {
      "@id": getOrganizationId(site),
    },
    creator: {
      "@id": getOrganizationId(site),
    },
    license: siteMetadata.licenseUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing.md", site),
    },
    description: siteMetadata.description,
    keywords: siteMetadata.keywords.join(", "),
    audience: audienceNotes.map((audienceNote) => ({
      "@type": "Audience",
      audienceType: audienceNote.title,
    })),
    featureList: [
      "Smooth Pursuit eye tracking drills",
      "Reaction Jumps quick refocus drills",
      "Lilac Chaser peripheral vision drill",
      "Multiple Distractions focus training",
      "Adjustable speed, size, shape, color, opacity, and trail",
      "Viewing distance, screen scale, and Lilac Chaser scale controls",
    ],
    dateModified: siteMetadata.lastUpdated,
    sameAs: siteMetadata.sameAs,
    citation: referenceLinks.map((referenceLink) => referenceLink.url),
  };
};

export const buildStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebsiteStructuredData(site),
      buildOrganizationStructuredData(site),
      buildAppStructuredData(site),
      {
        "@type": "WebPage",
        "@id": `${appUrl}#webpage`,
        name: siteMetadata.title,
        headline: siteMetadata.title,
        url: appUrl,
        description: siteMetadata.description,
        image: imageUrl,
        inLanguage: "en",
        keywords: siteMetadata.keywords.join(", "),
        dateModified: siteMetadata.lastUpdated,
        publisher: {
          "@id": getOrganizationId(site),
        },
        isPartOf: {
          "@id": `${appUrl}#website`,
        },
        mainEntity: {
          "@id": `${appUrl}#app`,
        },
      },
    ],
  };
};

export const buildGuideStructuredData = (site: URL) => {
  const guideUrl = absoluteUrl("/guide/", site);
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebsiteStructuredData(site),
      buildOrganizationStructuredData(site),
      buildAppStructuredData(site),
      {
        "@type": "WebPage",
        "@id": `${guideUrl}#webpage`,
        name: guideMetadata.title,
        headline: guideMetadata.title,
        url: guideUrl,
        description: guideMetadata.description,
        image: imageUrl,
        inLanguage: "en",
        keywords: siteMetadata.keywords.join(", "),
        dateModified: siteMetadata.lastUpdated,
        publisher: {
          "@id": getOrganizationId(site),
        },
        citation: referenceLinks.map((referenceLink) => referenceLink.url),
        isPartOf: {
          "@id": `${appUrl}#website`,
        },
        about: {
          "@id": `${appUrl}#app`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${guideUrl}#faq`,
        isPartOf: {
          "@id": `${guideUrl}#webpage`,
        },
        mainEntity: guideFaqItems.map((faqItem) => ({
          "@type": "Question",
          name: faqItem.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faqItem.answer,
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${guideUrl}#routes`,
        name: "FoveaFlow practice routes",
        itemListElement: indexableTrainerRoutes.map((route, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: route.label,
          url: absoluteUrl(route.path, site),
          description: route.description,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${guideUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteMetadata.name,
            item: appUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guide",
            item: guideUrl,
          },
        ],
      },
    ],
  };
};

export const buildTrainerRouteStructuredData = (
  route: TrainerRoute,
  site: URL,
) => {
  const appUrl = absoluteUrl("/", site);
  const routeUrl = absoluteUrl(route.path, site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebsiteStructuredData(site),
      buildOrganizationStructuredData(site),
      buildAppStructuredData(site),
      {
        "@type": "WebPage",
        "@id": `${routeUrl}#webpage`,
        name: route.title,
        headline: route.title,
        url: routeUrl,
        description: route.description,
        image: imageUrl,
        inLanguage: "en",
        keywords: siteMetadata.keywords.join(", "),
        dateModified: siteMetadata.lastUpdated,
        publisher: {
          "@id": getOrganizationId(site),
        },
        citation: referenceLinks.map((referenceLink) => referenceLink.url),
        isPartOf: {
          "@id": `${appUrl}#website`,
        },
        about: {
          "@id": `${appUrl}#app`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${routeUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteMetadata.name,
            item: appUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: route.label,
            item: routeUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${routeUrl}#faq`,
        isPartOf: {
          "@id": `${routeUrl}#webpage`,
        },
        mainEntity: route.seoContent.faq.map((faqItem) => ({
          "@type": "Question",
          name: faqItem.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faqItem.answer,
          },
        })),
      },
    ],
  };
};

export const buildLegalStructuredData = (page: LegalPageContent, site: URL) => {
  const pageUrl = absoluteUrl(page.path, site);
  const appUrl = absoluteUrl("/", site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebsiteStructuredData(site),
      buildOrganizationStructuredData(site),
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: page.metaTitle,
        headline: page.title,
        url: pageUrl,
        description: page.description,
        inLanguage: "en",
        dateModified: siteMetadata.lastUpdated,
        publisher: {
          "@id": getOrganizationId(site),
        },
        isPartOf: {
          "@id": `${appUrl}#website`,
        },
        about: {
          "@id": `${appUrl}#app`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteMetadata.name,
            item: appUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.label,
            item: pageUrl,
          },
        ],
      },
    ],
  };
};

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
    "",
    ...aiCrawlerAccess.flatMap((crawler) => [
      `# ${crawler.purpose}`,
      `User-agent: ${crawler.userAgent}`,
      "Allow: /",
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
    "FoveaFlow is a free online eye training app for smooth pursuit, quick refocus, distractor tracking, and peripheral awareness. It helps gamers, IT professionals, developers, sysadmins, support teams, and people on screens all day warm up with browser-based visual drills. Settings are stored locally in the browser, and no account or install is needed. It is self-guided practice, not diagnosis, prescription, or clinical care.",
    "",
    "## Quick summary",
    siteMetadata.entityDescription,
    "",
    "- Price: free",
    "- Account required: no",
    "- Install required: no",
    "- Includes: browser app, visual tracking drills, refocus drills, peripheral awareness drill, and distractor tracking drill",
    "- Best-fit users: gamers, developers, sysadmins, support engineers, other IT professionals, and people who spend long days on screens",
    "- Safety status: practice software only, not medical advice, diagnosis, treatment, vision therapy, or a medical device",
    "- Last updated: " + siteMetadata.lastUpdated,
    "",
    "## Main page",
    `- App: ${absoluteUrl("/", site)}`,
    `- Guide: ${absoluteUrl("/guide/", site)}`,
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

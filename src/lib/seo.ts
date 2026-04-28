import { patternOptions } from "./engine/presets";
import type { TrainingMode } from "./engine/presets";
import type { PatternId } from "./engine/types";

export const defaultSiteUrl = "https://eye-trainer.app";

export const siteMetadata = {
  name: "Eye Trainer",
  title: "Free eye tracking trainer for smooth pursuit practice",
  description:
    "Use a free browser eye tracking trainer for smooth pursuit, reaction jumps, peripheral awareness, and Multiple Distractions. No account.",
  shortDescription:
    "A free browser tool for visual tracking practice. No account, no install, no paid plan.",
  imagePath: "/metadata/og.png",
  repositoryUrl: "https://github.com/Jesper-N/eye-trainer",
  lastUpdated: "2026-04-28",
  keywords: [
    "free eye tracking trainer",
    "smooth pursuit practice",
    "visual tracking exercise",
    "reaction time trainer",
    "multiple object tracking trainer",
    "peripheral vision practice",
    "browser eye trainer",
  ],
} as const;

export const trainingModeNotes = [
  {
    title: "Smooth Pursuit",
    body: "Follow one moving marker with your eyes while keeping your head still.",
  },
  {
    title: "Reaction jumps",
    body: "Watch for a marker that changes position, then refocus on it cleanly.",
  },
  {
    title: "Multiple Distractions",
    body: "Keep attention on the target while distractors cross the same space.",
  },
] as const;

export const safetyNote =
  "This is practice software, not medical care. Stop if you feel eye strain, dizziness, headache, nausea, or any other discomfort.";

export const faqItems = [
  {
    question: "What is Eye Trainer?",
    answer:
      "Eye Trainer is a free browser tool for visual tracking practice. It includes Smooth Pursuit paths, Reaction jumps, and Multiple Distractions.",
  },
  {
    question: "Is Eye Trainer free?",
    answer:
      "Yes. Eye Trainer is free to use, does not ask for an account, and does not have a paid plan.",
  },
  {
    question: "What is Smooth Pursuit mode?",
    answer:
      "Smooth Pursuit mode shows one moving target on the screen. You choose the motion path, then follow the target with your eyes.",
  },
  {
    question: "What are Reaction jumps and Multiple Distractions?",
    answer:
      "Reaction jumps moves the target to new positions for refocus practice. Multiple Distractions keeps one target on screen while distractors move through the same area.",
  },
  {
    question: "Can Eye Trainer improve eyesight?",
    answer:
      "Eye Trainer does not claim to improve eyesight, treat eye conditions, or replace vision therapy. It is a simple practice tool for looking at moving targets on a screen.",
  },
  {
    question: "Do I need an account or app install?",
    answer:
      "No. The tool runs in a modern browser and stores settings on the current device with localStorage.",
  },
  {
    question: "What settings can I change?",
    answer:
      "You can change the mode, motion pattern, target size, speed, shape, color, opacity, trail, distractor count, viewing distance, and screen scale.",
  },
  {
    question: "Can I use Eye Trainer on a phone?",
    answer:
      "Yes, but a larger screen gives the moving target more room. A desktop, laptop, or tablet usually feels better for longer paths.",
  },
] as const;

export const guideMetadata = {
  title: "Eye Trainer Guide: Visual Tracking Practice Tool",
  description:
    "Learn how to use Eye Trainer, a free browser tool for Smooth Pursuit, Reaction jumps, peripheral awareness, and Multiple Distractions.",
  summary:
    "Eye Trainer is a free browser tool for visual tracking practice. Use the guide to choose a mode, open a pattern URL, adjust the target, and keep the safety limits clear.",
} as const;

export const referenceLinks = [
  {
    label: "Visual guidance of smooth pursuit eye movements",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2887486/",
  },
  {
    label: "Visual learning in multiple-object tracking",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2375111/",
  },
] as const;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export type TrainerRoute = {
  slug: string;
  path: `/${string}/`;
  mode: TrainingMode;
  patternId?: PatternId;
  label: string;
  title: string;
  description: string;
};

export const trainerRoutes = [
  ...patternOptions
    .filter((option) => option.id !== "multipleObjectTracking")
    .map((option) => ({
      slug: toSlug(option.name),
      path: `/${toSlug(option.name)}/` as const,
      mode: "pursuit" as const,
      patternId: option.id,
      label: option.name,
      title: `${siteMetadata.name}: ${option.name} pattern`,
      description: `Load Smooth Pursuit with the ${option.name} motion path ready to use.`,
    })),
  {
    slug: "reaction-jumps",
    path: "/reaction-jumps/",
    mode: "reactionTime",
    label: "Reaction jumps",
    title: `${siteMetadata.name}: Reaction jumps`,
    description:
      "Load Reaction jumps directly, without changing the mode first.",
  },
  {
    slug: "multiple-distractions",
    path: "/multiple-distractions/",
    mode: "mot",
    label: "Multiple Distractions",
    title: `${siteMetadata.name}: Multiple Distractions`,
    description:
      "Load Multiple Distractions directly, without changing the mode first.",
  },
] satisfies TrainerRoute[];

export const findTrainerRoute = (slug: string | undefined) => {
  if (!slug) return null;
  return trainerRoutes.find((route) => route.slug === slug) ?? null;
};

export const getTrainerRoute = (mode: TrainingMode, patternId: PatternId) => {
  if (mode === "reactionTime") return findTrainerRoute("reaction-jumps");
  if (mode === "mot") return findTrainerRoute("multiple-distractions");

  return (
    trainerRoutes.find(
      (route) => route.mode === "pursuit" && route.patternId === patternId,
    ) ?? null
  );
};

const sitemapEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/guide/", changefreq: "monthly", priority: "0.8" },
  ...trainerRoutes.map((route) => ({
    path: route.path,
    changefreq: "monthly",
    priority: "0.7",
  })),
  { path: "/llms.txt", changefreq: "monthly", priority: "0.7" },
  { path: "/pricing.md", changefreq: "monthly", priority: "0.6" },
] as const;

export const getSiteOrigin = (site: URL | undefined) => {
  const siteUrl = site ?? new URL(defaultSiteUrl);
  return new URL(siteUrl.origin);
};

export const absoluteUrl = (path: string, site: URL) =>
  new URL(path, site).toString();

export const buildStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appUrl}#website`,
        name: siteMetadata.name,
        url: appUrl,
        description: siteMetadata.shortDescription,
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${appUrl}#app`,
        name: siteMetadata.name,
        url: appUrl,
        image: imageUrl,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern browser.",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl("/pricing.md", site),
        },
        description: siteMetadata.description,
        featureList: [
          "Smooth pursuit tracking practice",
          "Reaction jump practice",
          "Multiple distractions practice",
          "Adjustable speed, size, shape, color, opacity, and trail",
          "Viewing distance and screen scale calibration",
        ],
        dateModified: siteMetadata.lastUpdated,
        sameAs: [siteMetadata.repositoryUrl],
        citation: referenceLinks.map((referenceLink) => referenceLink.url),
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
      {
        "@type": "WebSite",
        "@id": `${appUrl}#website`,
        name: siteMetadata.name,
        url: appUrl,
        description: siteMetadata.shortDescription,
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${appUrl}#app`,
        name: siteMetadata.name,
        url: appUrl,
        image: imageUrl,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        description: siteMetadata.description,
        dateModified: siteMetadata.lastUpdated,
      },
      {
        "@type": "WebPage",
        "@id": `${guideUrl}#webpage`,
        name: guideMetadata.title,
        headline: guideMetadata.title,
        url: guideUrl,
        description: guideMetadata.description,
        image: imageUrl,
        inLanguage: "en",
        dateModified: siteMetadata.lastUpdated,
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
        mainEntity: faqItems.map((faqItem) => ({
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
        name: "Eye Trainer practice routes",
        itemListElement: trainerRoutes.map((route, index) => ({
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
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "anthropic-ai",
    "Google-Extended",
    "Bingbot",
  ];

  return [
    "User-agent: *",
    "Allow: /",
    "",
    ...aiBots.flatMap((bot) => ["User-agent: " + bot, "Allow: /", ""]),
    `Sitemap: ${absoluteUrl("/sitemap.xml", site)}`,
    "",
  ].join("\n");
};

export const buildLlmsText = (site: URL) => {
  return [
    "# Eye Trainer",
    "",
    siteMetadata.shortDescription,
    "",
    "Eye Trainer is useful for people who want a simple place to practice visual tracking in the browser. It is not a medical device and does not claim to treat or diagnose vision problems.",
    "",
    "## Main page",
    `- App: ${absoluteUrl("/", site)}`,
    `- Guide: ${absoluteUrl("/guide/", site)}`,
    `- Pricing: ${absoluteUrl("/pricing.md", site)}`,
    `- Source code: ${siteMetadata.repositoryUrl}`,
    "",
    "## Direct app routes",
    ...trainerRoutes.map(
      (route) => `- ${route.label}: ${absoluteUrl(route.path, site)}`,
    ),
    "",
    "## What the tool includes",
    ...trainingModeNotes.map(
      (trainingModeNote) =>
        `- ${trainingModeNote.title}: ${trainingModeNote.body}`,
    ),
    "- Controls for speed, target size, target shape, color, opacity, trail, distractor count, viewing distance, and screen scale.",
    "- Settings stay on the current device with localStorage.",
    "",
    "## Good query matches",
    ...siteMetadata.keywords.map((keyword) => `- ${keyword}`),
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
    "Eye Trainer is free.",
    "",
    "## Free",
    "- Price: $0",
    "- Account required: no",
    "- Install required: no",
    "- Included: all current drills, motion patterns, visual settings, calibration controls, and local settings storage",
    "- Paid plan: none",
    "",
    `Use the app: ${absoluteUrl("/", site)}`,
    "",
  ].join("\n");
};

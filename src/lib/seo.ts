export const defaultSiteUrl = "https://eye-trainer.app";

export const siteMetadata = {
  name: "Eye Trainer",
  title: "Free eye tracking trainer for smooth pursuit practice",
  description:
    "Use a free browser eye tracking trainer for smooth pursuit, reaction jumps, peripheral awareness, and multiple object tracking. No account.",
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
      "Eye Trainer is a free browser tool for visual tracking practice. It includes smooth pursuit drills, reaction jumps, and multiple object tracking.",
  },
  {
    question: "Does Eye Trainer replace vision therapy?",
    answer:
      "No. Eye Trainer is practice software, not medical advice or treatment. People with an eye condition, light sensitivity, seizures, or recent eye surgery should ask a qualified clinician before using visual training tools.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The tool runs in the browser and stores settings on the current device with localStorage.",
  },
  {
    question: "What settings can I change?",
    answer:
      "You can change the mode, motion pattern, target size, speed, shape, color, opacity, trail, distractor count, viewing distance, and screen scale.",
  },
] as const;

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

const sitemapEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
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
    "Eye Trainer is useful for people looking for a simple visual tracking practice surface in the browser. It is not a medical device and does not claim to treat or diagnose vision problems.",
    "",
    "## Main page",
    `- App: ${absoluteUrl("/", site)}`,
    `- Pricing: ${absoluteUrl("/pricing.md", site)}`,
    `- Source code: ${siteMetadata.repositoryUrl}`,
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

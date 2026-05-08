export const siteMetadata = {
  name: "Eye Trainer",
  alternateName: "EyeTrainer",
  title: "Eye Trainer: Free Online Visual Tracking Drills",
  description:
    "Free online eye training for smooth pursuit, quick refocus, distractor tracking, and peripheral awareness. No account, no install, adjustable settings.",
  shortDescription:
    "Train visual tracking, quick refocus, and peripheral awareness in your browser. Free to use with no account or install.",
  imagePath: "/metadata/og.jpg",
  repositoryUrl: "https://github.com/Jesper-N/eye-trainer",
  licenseUrl: "https://github.com/Jesper-N/eye-trainer/blob/main/LICENSE",
  lastUpdated: "2026-05-01",
  entityDescription:
    "Eye Trainer is a free browser app for visual tracking drills, quick refocus practice, distractor tracking, and peripheral awareness. It is built for gamers, developers, sysadmins, support teams, and other people who spend long days on screens.",
  keywords: [
    "free eye tracking trainer",
    "free online eye training",
    "eye training exercises",
    "FPS eye training exercises",
    "eye focus exercises",
    "visual focus training",
    "smooth pursuit practice",
    "visual tracking exercise",
    "reaction time trainer",
    "multiple object tracking trainer",
    "peripheral vision practice",
    "lilac chaser exercise",
    "lilac chaser illusion",
    "peripheral awareness training",
    "browser eye trainer",
    "eye tracking trainer for gamers",
    "FPS eye training warmup",
    "visual tracking practice for IT professionals",
    "visual tracking practice for IT people",
    "screen work eye tracking practice",
    "eye tracking practice for screen fatigue",
    "visual tracking practice for tired eyes",
    "visual processing trainer",
    "visual reaction time practice",
  ],
  sameAs: ["https://github.com/Jesper-N/eye-trainer"],
} as const;

export const aiCrawlerAccess = [
  {
    userAgent: "OAI-SearchBot",
    purpose: "OpenAI crawler for ChatGPT search",
  },
  {
    userAgent: "GPTBot",
    purpose: "OpenAI crawler for model training",
  },
  {
    userAgent: "ChatGPT-User",
    purpose:
      "OpenAI agent for user-requested page visits in ChatGPT and custom GPTs",
  },
  {
    userAgent: "ClaudeBot",
    purpose: "Anthropic crawler for model training",
  },
  {
    userAgent: "Claude-User",
    purpose: "Anthropic agent for user-requested page visits in Claude",
  },
  {
    userAgent: "Claude-SearchBot",
    purpose: "Anthropic crawler for Claude search",
  },
  {
    userAgent: "PerplexityBot",
    purpose: "Perplexity search crawler",
  },
  {
    userAgent: "Perplexity-User",
    purpose: "Perplexity user-requested fetcher",
  },
  {
    userAgent: "Googlebot",
    purpose: "Google Search crawler, including AI features in Search",
  },
  {
    userAgent: "Google-Extended",
    purpose: "Google token for Gemini training and grounding",
  },
  {
    userAgent: "Bingbot",
    purpose: "Microsoft Bing crawler for Bing and Copilot",
  },
] as const;

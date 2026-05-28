export const siteMetadata = {
  name: "FoveaFlow",
  alternateName: "Fovea Flow",
  title: "FoveaFlow - Free Online Eye Trainer & FPS Warmup",
  description:
    "Free online eye trainer for visual tracking, quick refocus, peripheral awareness, and focus under distraction. Browser-based with no account or install.",
  shortDescription:
    "Free online eye trainer for visual tracking, quick refocus, peripheral awareness, and focus under distraction.",
  imagePath: "/metadata/og.jpg",
  repositoryUrl: "https://github.com/Jesper-N/foveaflow",
  licenseUrl: "https://github.com/Jesper-N/foveaflow/blob/main/LICENSE",
  lastUpdated: "2026-05-28",
  entityDescription:
    "FoveaFlow is a free online eye trainer for visual tracking, quick refocus, distractor tracking, and peripheral awareness. It is built for gamers, developers, sysadmins, support teams, and other people who spend long days on screens.",
  keywords: [
    "eye trainer",
    "free eye trainer",
    "online eye trainer",
    "free online eye trainer",
    "eye trainer app",
    "FPS eye trainer",
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
  sameAs: ["https://github.com/Jesper-N/foveaflow"],
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
    userAgent: "Google-CloudVertexBot",
    purpose: "Google crawler for Vertex AI and Gemini grounding",
  },
  {
    userAgent: "bingbot",
    purpose: "Microsoft Bing crawler for Bing and Copilot",
  },
  {
    userAgent: "Bytespider",
    purpose: "ByteDance crawler for AI search and model training",
  },
  {
    userAgent: "CCBot",
    purpose: "Common Crawl crawler used by AI labs and search systems",
  },
  {
    userAgent: "Meta-ExternalAgent",
    purpose: "Meta crawler for AI model training",
  },
  {
    userAgent: "Meta-ExternalFetcher",
    purpose: "Meta agent for user-requested page visits",
  },
  {
    userAgent: "FacebookBot",
    purpose: "Meta crawler for AI and link preview systems",
  },
  {
    userAgent: "Applebot",
    purpose: "Apple crawler for search and Apple Intelligence features",
  },
  {
    userAgent: "Amazonbot",
    purpose: "Amazon crawler for AI and Alexa systems",
  },
  {
    userAgent: "DuckAssistBot",
    purpose: "DuckDuckGo crawler for DuckAssist AI answers",
  },
  {
    userAgent: "MistralAI-User",
    purpose: "Mistral agent for user-requested page visits",
  },
] as const;

import { patternOptions } from "./engine/presets";
import type { TrainingMode } from "./engine/presets";
import type { PatternId } from "./engine/types";

export const defaultSiteUrl = "https://eye-trainer.app";

export const siteMetadata = {
  name: "Eye Trainer",
  title: "Free eye trainer for gamers and IT professionals",
  description:
    "Practice smooth pursuit, reaction jumps, Lilac Chaser, and distractor tracking. Built for gamers, IT professionals, and people who spend long hours on screens.",
  shortDescription:
    "Free visual tracking practice with smooth pursuit, reaction jumps, Lilac Chaser, and distractor tracking. No account or install required.",
  imagePath: "/metadata/og.jpg",
  repositoryUrl: "https://github.com/Jesper-N/eye-trainer",
  lastUpdated: "2026-04-30",
  keywords: [
    "free eye tracking trainer",
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
} as const;

export const audienceNotes = [
  {
    title: "Gamers",
    body: "Warm up before FPS games or aim training with short tracking and refocus drills.",
  },
  {
    title: "IT professionals",
    body: "Break up long sessions spent scanning code, logs, dashboards, terminals, and tickets.",
  },
  {
    title: "People on screens all day",
    body: "Use a quick tracking break when your eyes feel tired after reading, meetings, or too many tabs.",
  },
] as const;

export const trainingModeGuides = [
  {
    mode: "pursuit",
    title: "Smooth Pursuit",
    summary:
      "Follow one moving ball with your eyes while keeping your head still.",
    steps: [
      "Keep your head still and let your eyes do the work.",
      "Track the ball as smoothly as you can instead of jumping ahead of it.",
      "Use predictable paths for steady tracking. Use random paths or hard turns when you want more target-search work.",
    ],
    benefits:
      "Smooth pursuit practice trains steady visual tracking, attention on a moving target, and controlled eye movement across more of your usable range. Predictable paths are good for rhythm and control. Less predictable paths add more visual search and reaction demand.",
  },
  {
    mode: "reactionTime",
    title: "Reaction jumps",
    summary:
      "Find the ball after each jump and focus on the new position as quickly as you can.",
    steps: [
      "Keep your head still and start with your eyes on the ball.",
      "When it jumps, find the new location and actually focus on it before the next jump.",
      "Use slower speeds for clean refocusing. Raise the speed when you want a sharper reaction drill.",
    ],
    benefits:
      "Reaction jumps practice quick target acquisition, saccadic eye movement, peripheral detection, and fast refocusing. It is useful when you want to react to a new visual target without moving your head first.",
  },
  {
    mode: "mot",
    title: "Multiple Distractions",
    summary:
      "Track the brightest ball while darker balls move through the same space.",
    steps: [
      "Keep your head still and lock onto the main, brightest ball.",
      "Follow it like Smooth Pursuit, but do not let the darker balls pull your eyes away.",
      "Start with fewer distractors, then add more when you can keep the target cleanly.",
    ],
    benefits:
      "Multiple Distractions practice selective attention, visual tracking under clutter, and target identity. The job is not just following motion. You also have to keep choosing the right object when similar objects compete for attention.",
  },
  {
    mode: "lilacChaser",
    title: "Lilac Chaser",
    summary:
      "Keep your eyes on the center cross while fixed colored balls disappear one at a time around the circle.",
    steps: [
      "Look only at the black cross in the middle.",
      "Do not follow the balls with your eyes.",
      "Let the disappearing gap move around the fixed circle. With steady focus, the colored balls may fade and the missing spot can look like a moving green afterimage.",
    ],
    benefits:
      "Lilac Chaser practice trains fixation, peripheral awareness, visual attention, and noticing change away from the point you are looking at. For gaming, it can be a short warmup for catching movement near the edge of your vision without constantly shifting your gaze.",
  },
] as const;

export const trainingModeNotes = trainingModeGuides.map((guide) => ({
  title: guide.title,
  body: guide.summary,
}));

export const getTrainingModeGuide = (mode: TrainingMode) =>
  trainingModeGuides.find((guide) => guide.mode === mode) ??
  trainingModeGuides[0];

export const safetyNote =
  "Practice software, not medical care. Stop if you feel eye strain, dizziness, headache, nausea, or any other discomfort.";

export const faqItems = [
  {
    question: "What is Eye Trainer?",
    answer:
      "Eye Trainer is a free browser tool for visual tracking practice. It includes smooth pursuit paths, reaction jumps, Lilac Chaser, and distractor tracking.",
  },
  {
    question: "Is Eye Trainer free?",
    answer:
      "Yes. Eye Trainer is free, has no paid plan, and does not require an account.",
  },
  {
    question: "What is Smooth Pursuit mode?",
    answer:
      "Smooth Pursuit shows one moving ball. Keep your head still and track the ball with your eyes. Predictable paths are good for steady control; random paths and hard turns add more target-search work.",
  },
  {
    question: "What is Reaction jumps mode?",
    answer:
      "Reaction jumps keeps the ball still, then moves it to a new spot. Find the new location and focus on it before the next jump.",
  },
  {
    question: "What is Multiple Distractions mode?",
    answer:
      "Multiple Distractions is selective tracking practice. Follow the brightest ball while darker balls move through the same space and try to pull your attention away.",
  },
  {
    question: "What is Lilac Chaser mode?",
    answer:
      "Lilac Chaser is a peripheral focus drill. Keep your eyes on the center cross while one ball disappears at a time around a fixed circle. With steady fixation, many people perceive a moving green afterimage where the missing ball is.",
  },
  {
    question: "Can Eye Trainer improve eyesight or reaction time?",
    answer:
      "Eye Trainer may help you train visual skills like tracking, refocusing, peripheral awareness, processing speed, and reaction timing. Results vary. If you have an eye condition or ongoing symptoms, get professional advice too.",
  },
  {
    question: "Is Eye Trainer good for gamers?",
    answer:
      "It can work as a quick visual warmup before FPS games, aim training, or other fast games with moving targets.",
  },
  {
    question: "Is Eye Trainer useful for IT professionals?",
    answer:
      "It is a simple break for people who spend long sessions scanning code, logs, dashboards, tickets, terminals, and multiple windows.",
  },
  {
    question: "Can Eye Trainer help with tired eyes from screen work?",
    answer:
      "Eye Trainer can give you a short tracking break during long screen sessions. If screen use causes pain, dizziness, headaches, or ongoing symptoms, stop and get professional advice.",
  },
  {
    question: "Do I need an account or app install?",
    answer:
      "No. The tool runs in a modern browser and stores settings locally in your browser.",
  },
  {
    question: "What settings can I change?",
    answer:
      "You can adjust the mode, motion path, target size, speed, shape, color, opacity, trail, distractor count, viewing distance, screen scale, and Lilac Chaser size and color.",
  },
  {
    question: "Can I use Eye Trainer on a phone?",
    answer:
      "Yes, but a larger screen gives the moving target more room. A desktop, laptop, or tablet usually feels better for longer paths.",
  },
] as const;

export const guideMetadata = {
  title: "Eye Trainer Guide: Visual Tracking Practice",
  description:
    "Use Eye Trainer for smooth pursuit, reaction jumps, Lilac Chaser, and distractor tracking. For gamers, IT professionals, and people on screens all day.",
  summary:
    "Use the guide to pick a drill, open a direct URL, adjust the settings, and keep the safety limits clear.",
} as const;

export const legalPages = {
  privacy: {
    path: "/privacy/",
    metaTitle: "Privacy Policy | Eye Trainer",
    title: "Privacy Policy",
    label: "Privacy",
    description:
      "How Eye Trainer handles locally stored browser settings, Cloudflare hosting, and basic analytics.",
    summary:
      "Eye Trainer is built to work without an account. The app keeps your settings in your browser and uses Cloudflare to serve the site.",
    sections: [
      {
        id: "data-we-do-not-collect",
        heading: "Data we do not collect",
        body: [
          "You do not need to create an account to use Eye Trainer. The app does not ask for your name, email address, payment details, or health records.",
          "Your practice choices are not uploaded to an Eye Trainer account because there are no accounts.",
        ],
      },
      {
        id: "browser-settings",
        heading: "Settings saved in your browser",
        body: [
          "Eye Trainer stores settings locally in your browser so the app can remember them on the current device. That can include the selected mode, motion pattern, speed, target size, color, opacity, trail setting, viewing distance, screen scale, and theme.",
          "Those settings stay in your browser unless your browser syncs, backs up, or exports its site data. You can remove them by clearing site data for eye-trainer.app.",
        ],
      },
      {
        id: "cloudflare",
        heading: "Cloudflare hosting and analytics",
        body: [
          "The site runs on Cloudflare. Cloudflare may process request data such as IP address, user agent, requested URL, and timing data to deliver the site, protect it from abuse, and show basic traffic and performance metrics.",
          "Cloudflare Web Analytics may load a small beacon script. Cloudflare says Web Analytics measures page views and performance without collecting or using visitor personal data.",
        ],
        links: [
          {
            label: "Cloudflare Web Analytics",
            url: "https://www.cloudflare.com/web-analytics/",
          },
          {
            label: "Cloudflare data collection docs",
            url: "https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/",
          },
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        body: [
          "Eye Trainer does not set advertising cookies. Cloudflare may set security cookies when it needs them to keep the site available and safe.",
        ],
        links: [
          {
            label: "Cloudflare cookie reference",
            url: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/",
          },
        ],
      },
      {
        id: "how-data-is-used",
        heading: "How data is used",
        body: [
          "Data is used to run the site, keep it secure, understand whether pages load correctly, and see which public pages people use. Eye Trainer does not sell visitor data.",
        ],
      },
      {
        id: "your-choices",
        heading: "Your choices",
        body: [
          "You can clear saved Eye Trainer settings from your browser's site data controls. You can also use browser or extension settings to block optional analytics scripts.",
          "If JavaScript is turned off, the moving target app will not run. The guide and policy pages still work as normal pages.",
        ],
      },
      {
        id: "children",
        heading: "Children",
        body: [
          "Eye Trainer can be used without sending personal details. It is not built to collect personal information from children.",
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        body: [
          "For project questions, use the GitHub repository. Do not post private information in a public issue.",
        ],
        links: [
          {
            label: "Eye Trainer on GitHub",
            url: siteMetadata.repositoryUrl,
          },
        ],
      },
    ],
  },
  terms: {
    path: "/terms/",
    metaTitle: "Terms of Use | Eye Trainer",
    title: "Terms of Use",
    label: "Terms",
    description:
      "The terms for using Eye Trainer, including safety limits, medical disclaimers, free access, and acceptable use.",
    summary:
      "Eye Trainer is a free browser tool. Use it safely, stop if it feels bad, and do not treat it as medical care.",
    sections: [
      {
        id: "agreement",
        heading: "Agreement",
        body: [
          "By using Eye Trainer, you agree to these terms. If you do not agree, do not use the site.",
        ],
      },
      {
        id: "what-the-app-is",
        heading: "What the app is",
        body: [
          "Eye Trainer is a free browser tool for visual tracking practice. It shows moving targets, reaction jumps, Lilac Chaser fixation practice, and distractor tracking patterns on a screen.",
          "The patterns are simple screen paths and timing drills. They are not a clinical program, and results will vary from person to person.",
        ],
      },
      {
        id: "not-medical-care",
        heading: "Not medical care",
        body: [
          "Eye Trainer is not medical advice, diagnosis, treatment, vision therapy, or a medical device. It does not replace an optometrist, ophthalmologist, doctor, therapist, or other qualified professional.",
          safetyNote,
          "If you have a vision condition, recent eye injury, surgery, neurological symptoms, or any concern about using moving visual targets, ask a qualified professional before using the app.",
        ],
      },
      {
        id: "use-safely",
        heading: "Use safely",
        body: [
          "Use the app in a safe place where you can stop easily. Do not use it while driving, walking around, operating equipment, or doing anything that needs your full attention.",
          "You choose the settings and session length. Keep sessions short if you are unsure, and take breaks.",
        ],
      },
      {
        id: "free-access",
        heading: "Free access",
        body: [
          "Eye Trainer is free to use. There is no account, paid plan, subscription, or in-app purchase.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        body: [
          "Do not attack, overload, scrape aggressively, or try to gain unauthorized access to the site or its infrastructure.",
        ],
      },
      {
        id: "open-source",
        heading: "Source code",
        body: [
          "The source code is public on GitHub under the license in the repository. These terms cover use of the hosted Eye Trainer site.",
        ],
        links: [
          {
            label: "Eye Trainer on GitHub",
            url: siteMetadata.repositoryUrl,
          },
        ],
      },
      {
        id: "availability",
        heading: "Availability and warranty",
        body: [
          "The site is provided as is. It may change, break, or go offline. To the fullest extent allowed by law, Eye Trainer is provided without warranties of any kind.",
        ],
      },
      {
        id: "changes",
        heading: "Changes to these terms",
        body: [
          "These terms may be updated when the app or site changes. The date at the top shows the latest version.",
        ],
      },
    ],
  },
} as const;

export type LegalPageContent = (typeof legalPages)[keyof typeof legalPages];

export const referenceLinks = [
  {
    label: "Visual guidance of smooth pursuit eye movements",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2887486/",
  },
  {
    label: "Spatial allocation of attention during smooth pursuit",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2827938/",
  },
  {
    label: "Saccadic reaction time factors",
    url: "https://pubmed.ncbi.nlm.nih.gov/33324183/",
  },
  {
    label: "Role of peripheral vision in saccade planning",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2629530/",
  },
  {
    label: "Visual learning in multiple-object tracking",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2375111/",
  },
  {
    label: "Lilac chaser illusion",
    url: "https://en.wikipedia.org/wiki/Lilac_chaser",
  },
  {
    label: "FPS Eye Training Warmup (HIGH FPS)",
    url: "https://www.youtube.com/watch?v=WAPKAZhOFM4",
  },
] as const;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
      title: `${toTitleCase(option.name)} Smooth Pursuit | ${siteMetadata.name}`,
      description: `Start the ${option.name.toLowerCase()} smooth pursuit pattern in your browser. Follow one target with adjustable speed, size, color, and trail. No account needed.`,
    })),
  {
    slug: "reaction-jumps",
    path: "/reaction-jumps/",
    mode: "reactionTime",
    label: "Reaction jumps",
    title: `Reaction Jumps | ${siteMetadata.name}`,
    description:
      "Practice Reaction jumps in your browser. Find each new ball position quickly and refocus before the next jump. No account needed.",
  },
  {
    slug: "multiple-distractions",
    path: "/multiple-distractions/",
    mode: "mot",
    label: "Multiple Distractions",
    title: `Multiple Distractions | ${siteMetadata.name}`,
    description:
      "Practice Multiple Distractions in your browser. Track the brightest ball while darker balls move through the same space. No account needed.",
  },
  {
    slug: "lilac-chaser",
    path: "/lilac-chaser/",
    mode: "lilacChaser",
    label: "Lilac Chaser",
    title: `Lilac Chaser Exercise | ${siteMetadata.name}`,
    description:
      "Practice Lilac Chaser in your browser. Keep your eyes on the center cross while fixed balls disappear one by one around the circle. No account needed.",
  },
] satisfies TrainerRoute[];

export const findTrainerRoute = (slug: string | undefined) => {
  if (!slug) return null;
  return trainerRoutes.find((route) => route.slug === slug) ?? null;
};

export const getTrainerRoute = (mode: TrainingMode, patternId: PatternId) => {
  if (mode === "reactionTime") return findTrainerRoute("reaction-jumps");
  if (mode === "mot") return findTrainerRoute("multiple-distractions");
  if (mode === "lilacChaser") return findTrainerRoute("lilac-chaser");

  return (
    trainerRoutes.find(
      (route) => route.mode === "pursuit" && route.patternId === patternId,
    ) ?? null
  );
};

const sitemapEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/guide/", changefreq: "monthly", priority: "0.8" },
  { path: legalPages.privacy.path, changefreq: "yearly", priority: "0.3" },
  { path: legalPages.terms.path, changefreq: "yearly", priority: "0.3" },
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
        keywords: siteMetadata.keywords.join(", "),
      },
      {
        "@type": "WebApplication",
        "@id": `${appUrl}#app`,
        name: siteMetadata.name,
        url: appUrl,
        image: imageUrl,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Visual tracking practice",
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
        keywords: siteMetadata.keywords.join(", "),
        audience: audienceNotes.map((audienceNote) => ({
          "@type": "Audience",
          audienceType: audienceNote.title,
        })),
        featureList: [
          "Smooth pursuit tracking practice",
          "Reaction jump and quick refocus practice",
          "Lilac Chaser peripheral focus practice",
          "Multiple Distractions selective attention practice",
          "Adjustable speed, size, shape, color, opacity, and trail",
          "Viewing distance, screen scale, and Lilac Chaser scale controls",
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
        keywords: siteMetadata.keywords.join(", "),
      },
      {
        "@type": "WebApplication",
        "@id": `${appUrl}#app`,
        name: siteMetadata.name,
        url: appUrl,
        image: imageUrl,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Visual tracking practice",
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
        keywords: siteMetadata.keywords.join(", "),
        audience: audienceNotes.map((audienceNote) => ({
          "@type": "Audience",
          audienceType: audienceNote.title,
        })),
        featureList: [
          "Smooth pursuit tracking practice",
          "Reaction jump and quick refocus practice",
          "Lilac Chaser peripheral focus practice",
          "Multiple Distractions selective attention practice",
          "Adjustable speed, size, shape, color, opacity, and trail",
          "Viewing distance, screen scale, and Lilac Chaser scale controls",
        ],
        dateModified: siteMetadata.lastUpdated,
        sameAs: [siteMetadata.repositoryUrl],
        citation: referenceLinks.map((referenceLink) => referenceLink.url),
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
        keywords: siteMetadata.keywords.join(", "),
        dateModified: siteMetadata.lastUpdated,
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
      {
        "@type": "WebSite",
        "@id": `${appUrl}#website`,
        name: siteMetadata.name,
        url: appUrl,
        description: siteMetadata.shortDescription,
        inLanguage: "en",
        keywords: siteMetadata.keywords.join(", "),
      },
      {
        "@type": "WebApplication",
        "@id": `${appUrl}#app`,
        name: siteMetadata.name,
        url: appUrl,
        image: imageUrl,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Visual tracking practice",
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
        keywords: siteMetadata.keywords.join(", "),
        audience: audienceNotes.map((audienceNote) => ({
          "@type": "Audience",
          audienceType: audienceNote.title,
        })),
        featureList: [
          "Smooth pursuit tracking practice",
          "Reaction jump and quick refocus practice",
          "Lilac Chaser peripheral focus practice",
          "Multiple Distractions selective attention practice",
          "Adjustable speed, size, shape, color, opacity, and trail",
          "Viewing distance, screen scale, and Lilac Chaser scale controls",
        ],
        dateModified: siteMetadata.lastUpdated,
        sameAs: [siteMetadata.repositoryUrl],
        citation: referenceLinks.map((referenceLink) => referenceLink.url),
      },
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
    ],
  };
};

export const buildLegalStructuredData = (page: LegalPageContent, site: URL) => {
  const pageUrl = absoluteUrl(page.path, site);
  const appUrl = absoluteUrl("/", site);

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
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: page.metaTitle,
        headline: page.title,
        url: pageUrl,
        description: page.description,
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
    "Eye Trainer is a free browser eye trainer for visual tracking practice. It helps gamers, IT professionals, developers, sysadmins, support teams, and people who spend long hours on screens practice smooth pursuit, quick refocusing, Lilac Chaser peripheral awareness, distractor tracking, and visual reaction timing. Settings are stored locally in the browser, and no account or install is needed. It is self-guided practice, not diagnosis, prescription, or clinical care.",
    "",
    "## Main page",
    `- App: ${absoluteUrl("/", site)}`,
    `- Guide: ${absoluteUrl("/guide/", site)}`,
    `- Pricing: ${absoluteUrl("/pricing.md", site)}`,
    `- Privacy: ${absoluteUrl(legalPages.privacy.path, site)}`,
    `- Terms: ${absoluteUrl(legalPages.terms.path, site)}`,
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
    "## Common searches Eye Trainer answers",
    "- free browser eye trainer",
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
    "Eye Trainer is free.",
    "",
    "## Free",
    "- Price: $0",
    "- Account required: no",
    "- Install required: no",
    "- Included: all current drills, motion patterns, Lilac Chaser, visual settings, calibration controls, and settings stored locally in your browser",
    "- Best fit: gamers, IT professionals, developers, sysadmins, support engineers, and people who spend long hours on screens",
    "- Paid plan: none",
    "",
    `Use the app: ${absoluteUrl("/", site)}`,
    "",
  ].join("\n");
};

const faqItems = [
  {
    answer:
      "FoveaFlow is a free online eye training app for visual tracking, focus, reaction speed, and peripheral awareness. It includes Smooth Pursuit, Reaction Jumps, Lilac Chaser, and distractor tracking with no account or install.",
    question: "What is FoveaFlow?",
  },
  {
    answer:
      "Yes. FoveaFlow is free to use, with no account, subscription, or paid plan.",
    question: "Is FoveaFlow free?",
  },
  {
    answer:
      "Smooth Pursuit is a moving-target eye training drill. Keep your head still and track the ball with your eyes. Predictable paths build steady control; random paths and hard turns add more target-search work.",
    question: "What is Smooth Pursuit mode?",
  },
  {
    answer:
      "Reaction Jumps trains quick refocus. The target holds still, then jumps to a new spot so you can find it fast and focus before the next move.",
    question: "What is Reaction Jumps mode?",
  },
  {
    answer:
      "Multiple Distractions is focus training under visual clutter. Follow the brightest ball while darker balls move through the same space and compete for your attention.",
    question: "What is Multiple Distractions mode?",
  },
  {
    answer:
      "Lilac Chaser is a peripheral vision and focus drill. Keep your eyes on the center cross while one ball disappears at a time around a fixed circle. With steady fixation, many people perceive a moving green afterimage where the missing ball is.",
    question: "What is Lilac Chaser mode?",
  },
  {
    answer:
      "FoveaFlow may help you train visual skills like tracking, refocusing, peripheral awareness, processing speed, and reaction timing. Results vary, and it is not a replacement for professional care if you have an eye condition or ongoing symptoms.",
    question: "Can FoveaFlow improve eyesight or reaction time?",
  },
  {
    answer:
      "Yes. Use FoveaFlow as a quick visual warmup before FPS games or any game where tracking targets and reading movement matters.",
    question: "Is FoveaFlow good for gamers?",
  },
  {
    answer:
      "Yes. It gives developers, sysadmins, and support teams a short visual reset between code, logs, dashboards, terminals, tickets, and multiple windows.",
    question: "Is FoveaFlow useful for IT professionals?",
  },
  {
    answer:
      "FoveaFlow can be a short active break during long screen sessions. If screen use causes pain, dizziness, headaches, or ongoing symptoms, stop and get professional advice.",
    question: "Can FoveaFlow help with tired eyes from screen work?",
  },
  {
    answer:
      "No. The tool runs in a modern browser and stores settings locally in your browser.",
    question: "Do I need an account or app install?",
  },
  {
    answer:
      "You can adjust the mode, motion path, target size, speed, shape, color, opacity, trail, distractor count, viewing distance, screen scale, and Lilac Chaser size and color.",
    question: "What settings can I change?",
  },
  {
    answer:
      "Yes, but a larger screen gives the moving target more room. A desktop, laptop, or tablet usually feels better for longer paths.",
    question: "Can I use FoveaFlow on a phone?",
  },
] as const;

export const guideFaqItems = [
  {
    answer:
      "Smooth Pursuit is the best starting point when your goal is following one moving target as steadily as possible.",
    question: "Which drill is best for steady tracking?",
  },
  {
    answer:
      "Reaction Jumps is best when you want to find a new target position quickly and lock on before the next move.",
    question: "Which drill is best for quick refocus?",
  },
  {
    answer:
      "Multiple Distractions is the best choice for practicing selective attention under visual clutter.",
    question: "Which drill is best when the screen feels busy?",
  },
  {
    answer:
      "Lilac Chaser is the best choice when you want to hold your gaze on the center and notice change away from it.",
    question: "Which drill is best for fixation and edge-of-vision awareness?",
  },
  {
    answer:
      "Change speed and target size first. They usually have the biggest effect on difficulty and control.",
    question: "Which settings should I change first?",
  },
  {
    answer:
      "Keep sessions short and deliberate. The goal is focused practice, not pushing through discomfort.",
    question: "How long should a session be?",
  },
] as const;

interface PageFaqItem {
  question: string;
  answer: string;
}

export interface PageSeoContent {
  kicker: string;
  heading: string;
  hero: string;
  body: readonly string[];
  primaryCta: {
    label: string;
    href: `/${string}`;
  };
  secondaryCta?: {
    label: string;
    href: `/${string}`;
  };
  trustNote: string;
  faq: readonly PageFaqItem[];
}

export const homepageSeoContent = {
  body: [
    "FoveaFlow is a free online eye trainer for visual tracking, quick refocus, peripheral awareness, and focus under distraction. It runs in the browser with no account or install.",
    "Use Smooth Pursuit to follow one moving target, Reaction Jumps to snap focus to new target positions, Multiple Distractions to track the right target through visual clutter, and Lilac Chaser to hold fixation while noticing peripheral change.",
    "Use FoveaFlow as a short FPS warmup, an active screen break, or a focused visual practice session.",
  ],
  faq: faqItems,
  heading: "Free online eye trainer",
  hero: "Train visual tracking, quick refocus, peripheral awareness, and focus under distraction in your browser.",
  kicker: "Free browser tool",
  primaryCta: {
    href: "/smooth-pursuit/",
    label: "Try Smooth Pursuit",
  },
  secondaryCta: {
    href: "/guide/",
    label: "Open the full guide",
  },
  trustNote:
    "Updated July 10, 2026. FoveaFlow is practice software, not medical care. Stop if a session causes strain, dizziness, headache, nausea, or any other discomfort.",
} satisfies PageSeoContent;

export const guideMetadata = {
  description:
    "Choose the right FoveaFlow drill for visual tracking, quick refocus, peripheral awareness, FPS warmups, and focus under distraction.",
  heading: "FoveaFlow Guide",
  lastModified: "2026-07-10",
  summary:
    "Use this guide to choose the right FoveaFlow eye trainer drill for visual tracking, quick refocus, peripheral awareness, FPS warmups, or focus under distraction.",
  title: "FoveaFlow Guide - Eye Trainer Drills & Visual Tracking Settings",
} as const;

export const faqItems = [
  {
    question: "What is Eye Trainer?",
    answer:
      "Eye Trainer is a free online eye training app for visual tracking, focus, reaction speed, and peripheral awareness. It includes Smooth Pursuit, Reaction Jumps, Lilac Chaser, and distractor tracking with no account or install.",
  },
  {
    question: "Is Eye Trainer free?",
    answer:
      "Yes. Eye Trainer is free to use, with no account, subscription, or paid plan.",
  },
  {
    question: "What is Smooth Pursuit mode?",
    answer:
      "Smooth Pursuit is a moving-target eye training drill. Keep your head still and track the ball with your eyes. Predictable paths build steady control; random paths and hard turns add more target-search work.",
  },
  {
    question: "What is Reaction Jumps mode?",
    answer:
      "Reaction Jumps trains quick refocus. The target holds still, then jumps to a new spot so you can find it fast and focus before the next move.",
  },
  {
    question: "What is Multiple Distractions mode?",
    answer:
      "Multiple Distractions is focus training under visual clutter. Follow the brightest ball while darker balls move through the same space and compete for your attention.",
  },
  {
    question: "What is Lilac Chaser mode?",
    answer:
      "Lilac Chaser is a peripheral vision and focus drill. Keep your eyes on the center cross while one ball disappears at a time around a fixed circle. With steady fixation, many people perceive a moving green afterimage where the missing ball is.",
  },
  {
    question: "Can Eye Trainer improve eyesight or reaction time?",
    answer:
      "Eye Trainer may help you train visual skills like tracking, refocusing, peripheral awareness, processing speed, and reaction timing. Results vary, and it is not a replacement for professional care if you have an eye condition or ongoing symptoms.",
  },
  {
    question: "Is Eye Trainer good for gamers?",
    answer:
      "Yes. Use Eye Trainer as a quick visual warmup before FPS games or any game where tracking targets and reading movement matters.",
  },
  {
    question: "Is Eye Trainer useful for IT professionals?",
    answer:
      "Yes. It gives developers, sysadmins, and support teams a short visual reset between code, logs, dashboards, terminals, tickets, and multiple windows.",
  },
  {
    question: "Can Eye Trainer help with tired eyes from screen work?",
    answer:
      "Eye Trainer can be a short active break during long screen sessions. If screen use causes pain, dizziness, headaches, or ongoing symptoms, stop and get professional advice.",
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

export const guideFaqItems = [
  {
    question: "Which drill is best for steady tracking?",
    answer:
      "Smooth Pursuit is the best starting point when your goal is following one moving target as steadily as possible.",
  },
  {
    question: "Which drill is best for quick refocus?",
    answer:
      "Reaction Jumps is best when you want to find a new target position quickly and lock on before the next move.",
  },
  {
    question: "Which drill is best when the screen feels busy?",
    answer:
      "Multiple Distractions is the best choice for practicing selective attention under visual clutter.",
  },
  {
    question: "Which drill is best for fixation and edge-of-vision awareness?",
    answer:
      "Lilac Chaser is the best choice when you want to hold your gaze on the center and notice change away from it.",
  },
  {
    question: "Which settings should I change first?",
    answer:
      "Change speed and target size first. They usually have the biggest effect on difficulty and control.",
  },
  {
    question: "How long should a session be?",
    answer:
      "Keep sessions short and deliberate. The goal is focused practice, not pushing through discomfort.",
  },
] as const;

export type PageFaqItem = {
  question: string;
  answer: string;
};

export type PageSeoContent = {
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
};

export const homepageSeoContent = {
  kicker: "Free browser tool",
  heading: "Eye Trainer",
  hero: "Train visual tracking, quick refocus, and peripheral awareness in your browser.",
  body: [
    "Eye Trainer is a browser-based set of visual practice drills for people who want a quick session of tracking, refocus, selective attention, or fixation work without downloading an app.",
    "Use Smooth Pursuit to follow one moving target, Reaction Jumps to snap to each new target position, Multiple Distractions to stay with the right target under clutter, and Lilac Chaser to practice steady fixation.",
    "This works well as a short gamer warmup, a between-task reset for screen-heavy work, or a focused practice block when you want to stay sharp.",
  ],
  primaryCta: {
    label: "Try Smooth Pursuit",
    href: "/smooth-pursuit/",
  },
  secondaryCta: {
    label: "Open the full guide",
    href: "/guide/",
  },
  trustNote:
    "Updated May 1, 2026. Eye Trainer is practice software, not medical care. Stop if a session causes strain, dizziness, headache, nausea, or any other discomfort.",
  faq: faqItems,
} satisfies PageSeoContent;

export const guideMetadata = {
  title: "Eye Trainer Guide: Visual Tracking Drills and Settings",
  heading: "Eye Trainer Guide",
  description:
    "Learn which Eye Trainer drill to use, how to set speed and size, and how to choose the right session for tracking, refocus, attention, and peripheral awareness.",
  summary:
    "Pick the right drill, set the right difficulty, and start a short session that matches your goal.",
} as const;

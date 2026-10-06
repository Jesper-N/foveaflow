interface ArticleSection {
  heading: string;
  body?: readonly string[];
  list?: readonly string[];
  orderedList?: readonly string[];
}

interface ComparisonRow {
  feature: string;
  foveaflow: string;
  alternative: string;
}

/** A feature table against another app, with a link to the app that was checked. */
interface Comparison {
  /** The other app's name. */
  alternative: string;
  rows: readonly ComparisonRow[];
  source: { label: string; href: string };
}

/** A standalone guide page, like the FPS warmup or a comparison with another app. */
export interface Article {
  slug: string;
  path: `/${string}/`;
  lastModified: string;
  title: string;
  description: string;
  kicker: string;
  heading: string;
  summary: string;
  primaryCta: { label: string; href: `/${string}` };
  secondaryCta?: { label: string; href: `/${string}` };
  sections: readonly ArticleSection[];
  comparison?: Comparison;
}

export const articles = [
  {
    description:
      "Build a short FPS eye training warmup with four free browser drills. Practice moving-target tracking, quick refocus, and attention under distraction.",
    heading: "FPS eye training warmup",
    kicker: "FPS warmup",
    lastModified: "2026-09-12",
    path: "/fps-eye-training/",
    primaryCta: {
      href: "/smooth-pursuit/",
      label: "Start the warmup",
    },
    secondaryCta: {
      href: "/guide/",
      label: "Read the guide",
    },
    sections: [
      {
        body: [
          "Treat this as a starting routine, not a target you have to finish. Choose a comfortable speed and shorten or skip any drill that does not feel right.",
        ],
        heading: "A 7-minute FPS eye warmup",
        orderedList: [
          "3 minutes of Smooth Pursuit. Follow one moving target with your eyes. Start with Circle or Ellipse and aim for steady tracking.",
          "2 minutes of Reaction Jumps. Find the target after each jump, then settle your gaze before it moves again.",
          "1 minute of Multiple Distractions. Follow the brightest target while the dimmer targets move around it.",
          "1 minute of Lilac Chaser. Keep looking at the center cross while the gap moves around the ring.",
        ],
      },
      {
        body: [
          "Keep your head still and sit comfortably. If you keep losing the target, lower the speed or make it larger. Add difficulty once you can follow it comfortably.",
        ],
        heading: "Adjust the drill, not your posture",
        list: [
          "Use predictable paths to practice a steady rhythm.",
          "Use Reaction Jumps when you want to practice finding a new target.",
          "Add distractors when you want to practice staying with one target through clutter.",
          "Save your preferred settings locally and return to the same setup next time.",
        ],
      },
      {
        body: [
          "These drills give you a way to practice specific visual tasks. FoveaFlow does not measure your eye movements or prove that your aim, reaction time, or eyesight has improved.",
          "Use it alongside your usual in-game practice if you enjoy it. There is no validated FoveaFlow routine or guaranteed performance gain.",
        ],
        heading: "What this warmup can and cannot tell you",
      },
    ],
    slug: "fps-eye-training",
    summary:
      "A few deliberate minutes before you play. FoveaFlow gives you four free browser drills for moving-target tracking, quick refocus, and attention when the screen gets busy.",
    title: "FPS Eye Training Warmup: Tracking & Refocus | FoveaFlow",
  },
  {
    comparison: {
      alternative: "BlinkCamp",
      rows: [
        {
          alternative:
            "Also free in the browser, with no sign-in needed to start.",
          feature: "Getting started",
          foveaflow: "Free in the browser. No account or install.",
        },
        {
          alternative: "Speed and size sliders.",
          feature: "Speed and size",
          foveaflow: "Adjust target size and speed.",
        },
        {
          alternative:
            "The public interface exposes size adjustment; it does not show these appearance controls.",
          feature: "Target appearance",
          foveaflow:
            "Choose shape, color, opacity, trails, and letter overlays.",
        },
        {
          alternative: "A Change Routine control cycles the exercise.",
          feature: "Motion",
          foveaflow:
            "Choose a path and adjust supported direction and motion behaviors.",
        },
        {
          alternative:
            "The public interface does not show distractor count or brightness controls.",
          feature: "Distractions",
          foveaflow:
            "A separate mode with target count, distractor count, and brightness controls.",
        },
      ],
      source: {
        href: "https://blinkcamp.com/",
        label: "Visit BlinkCamp",
      },
    },
    description:
      "Compare FoveaFlow and BlinkCamp’s free browser eye trainers. See the differences in target appearance, motion paths, and distraction controls.",
    heading: "FoveaFlow vs BlinkCamp",
    kicker: "Comparison",
    lastModified: "2026-09-26",
    path: "/blinkcamp-alternative/",
    primaryCta: {
      href: "/",
      label: "Try FoveaFlow",
    },
    secondaryCta: {
      href: "/guide/#drills",
      label: "Explore the drills",
    },
    sections: [
      {
        body: [
          "FoveaFlow lets you change one part of a drill at a time. Keep a familiar path and increase speed. Keep the speed and add distractors. Or make the target easier to see without changing the motion.",
          "The floating controls tuck away while you practice. Your settings stay in your browser, so you can return to your preferred setup without an account.",
        ],
        heading: "More control, when you want it",
      },
      {
        heading: "Four ways to practice",
        list: [
          "Smooth Pursuit: follow one moving target along a chosen path.",
          "Reaction Jumps: find the target after it moves to a new position.",
          "Multiple Distractions: keep track of the brightest target through visual clutter.",
          "Lilac Chaser: hold your gaze on the center while noticing change around it.",
        ],
      },
      {
        body: [
          "If you prefer a small set of visible controls and simply want to cycle through routines, BlinkCamp is a straightforward option. It is also open source.",
          "FoveaFlow is the better fit if you want more say over the target and motion. That is a feature comparison, not evidence of better health or gaming results.",
        ],
        heading: "When BlinkCamp may be enough",
      },
    ],
    slug: "blinkcamp-alternative",
    summary:
      "Both are free eye trainers you can open in a browser. Choose FoveaFlow when you want to fine-tune the session: how the target moves and what it looks like.",
    title: "FoveaFlow vs BlinkCamp: Free Eye Trainer Comparison",
  },
  {
    comparison: {
      alternative: "EyeTrainer.gg",
      rows: [
        {
          alternative: "Browser exercises start without an account or install.",
          feature: "Getting started",
          foveaflow: "Free browser app. No account or install.",
        },
        {
          alternative: "Cycle through the available browser patterns.",
          feature: "Drill selection",
          foveaflow:
            "Smooth Pursuit, Reaction Jumps, Multiple Distractions, and Lilac Chaser.",
        },
        {
          alternative:
            "The public browser interface shows pattern navigation, Show Grid, and Darkmode controls.",
          feature: "Target and motion controls",
          foveaflow:
            "Speed, size, shape, color, opacity, trails, and mode-specific motion settings.",
        },
        {
          alternative:
            "The site also advertises an upcoming Steam app and Exercise Creator.",
          feature: "Desktop app",
          foveaflow: "The full tool runs in the browser.",
        },
      ],
      source: {
        href: "https://www.eyetrainer.gg/",
        label: "Visit EyeTrainer.gg",
      },
    },
    description:
      "Compare FoveaFlow with EyeTrainer.gg’s browser version for FPS warmups. Explore drill modes, motion controls, target customization, and local settings.",
    heading: "FoveaFlow vs EyeTrainer.gg",
    kicker: "Comparison",
    lastModified: "2026-09-26",
    path: "/eyetrainer-gg-alternative/",
    primaryCta: {
      href: "/",
      label: "Try FoveaFlow",
    },
    secondaryCta: {
      href: "/fps-eye-training/",
      label: "Build a warmup",
    },
    sections: [
      {
        body: [
          "FoveaFlow lets you tune the drill to what you want to practice. Use a predictable path for steady tracking, jumps for quick refocus, or dimmer moving targets for distraction practice.",
          "You can change the target’s appearance, adjust motion behavior, and keep your preferred settings on this device. Each main drill and Smooth Pursuit path also has a direct link.",
        ],
        heading: "A warmup you can adjust",
      },
      {
        body: [
          "EyeTrainer.gg offers browser patterns and promotes a forthcoming Steam app. Its announcement mentions new features and an Exercise Creator.",
          "This page compares the public browser tools checked on September 12, 2026. It does not treat announced Steam features as available browser features, or make claims about the finished desktop app.",
        ],
        heading: "What is available today",
      },
      {
        body: [
          "For a quick pattern with minimal setup, EyeTrainer.gg may be enough. Choose FoveaFlow if you want four distinct drill modes and detailed control over the session without leaving the browser.",
          "Neither the number of settings nor a preference for one interface proves better aim or vision. Pick a comfortable routine you find useful.",
        ],
        heading: "Choose by the controls you need",
      },
    ],
    slug: "eyetrainer-gg-alternative",
    summary:
      "Start a visual warmup in either browser tool. FoveaFlow gives you separate tracking, refocus, distraction, and fixation drills, with detailed controls available right now in the browser.",
    title: "FoveaFlow vs EyeTrainer.gg: Browser Eye Training Compared",
  },
] as const satisfies readonly Article[];

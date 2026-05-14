export type SupportPageSection = {
  heading: string;
  body?: readonly string[];
  list?: readonly string[];
  orderedList?: readonly string[];
};

export type ComparisonRow = {
  feature: string;
  foveaflow: string;
  alternative: string;
};

export type SupportPage = {
  slug: string;
  path: `/${string}/`;
  title: string;
  description: string;
  kicker: string;
  heading: string;
  summary: string;
  primaryCta: {
    label: string;
    href: `/${string}`;
  };
  secondaryCta?: {
    label: string;
    href: `/${string}`;
  };
  sections: readonly SupportPageSection[];
  comparisonLabel?: string;
  comparisonRows?: readonly ComparisonRow[];
  sourceLink?: {
    label: string;
    href: string;
  };
};

export const supportPages = [
  {
    slug: "fps-eye-training",
    path: "/fps-eye-training/",
    title: "FoveaFlow - FPS Eye Training Warmup",
    description:
      "Use FoveaFlow as a free FPS eye training warmup for visual tracking, quick refocus, target switching, and focus under distraction.",
    kicker: "FPS warmup",
    heading: "FPS Eye Training Warmup",
    summary:
      "FoveaFlow is a free browser-based FPS eye training warmup. Use Smooth Pursuit for moving-target tracking, Reaction Jumps for quick refocus, and Multiple Distractions for staying locked on the right target through visual clutter.",
    primaryCta: {
      label: "Start the warmup",
      href: "/",
    },
    secondaryCta: {
      label: "Read the guide",
      href: "/guide/",
    },
    sections: [
      {
        heading: "7-minute FPS eye warmup",
        orderedList: [
          "3 minutes Smooth Pursuit: follow the target smoothly.",
          "2 minutes Reaction Jumps: find each new target position quickly.",
          "1 minute Multiple Distractions: stay locked on the brightest target.",
          "1 minute Lilac Chaser: hold center focus and notice peripheral change.",
        ],
      },
      {
        heading: "Which drill to use",
        list: [
          "Smooth Pursuit is for steady moving-target tracking.",
          "Reaction Jumps is for reaction time training, fast refocus, and target switching.",
          "Multiple Distractions is for staying with the right target when the screen is busy.",
          "Lilac Chaser is for fixation and peripheral awareness.",
        ],
      },
      {
        heading: "Keep it short",
        body: [
          "Use FoveaFlow as practice software, not medical care. Stop if a session causes eye strain, dizziness, headache, nausea, or discomfort.",
        ],
      },
    ],
  },
  {
    slug: "blinkcamp-alternative",
    path: "/blinkcamp-alternative/",
    title: "FoveaFlow - BlinkCamp Alternative for Eye Training",
    description:
      "Compare FoveaFlow and BlinkCamp for free browser-based eye training, visual tracking, FPS warmups, reaction jumps, and distractor tracking.",
    kicker: "Alternative",
    heading: "FoveaFlow vs BlinkCamp",
    summary:
      "FoveaFlow and BlinkCamp are both free browser-based eye training tools. FoveaFlow is the stronger fit when you want direct drill links, FPS warmup use, reaction jumps, distractor tracking, and deeper control over how the target moves and appears.",
    primaryCta: {
      label: "Try FoveaFlow",
      href: "/",
    },
    secondaryCta: {
      label: "Compare drills",
      href: "/guide/",
    },
    sourceLink: {
      label: "Visit BlinkCamp",
      href: "https://blinkcamp.com/",
    },
    sections: [
      {
        heading: "Best fit",
        body: [
          "Choose FoveaFlow when you want direct drill links, adjustable target behavior, and a clean full-screen canvas for short visual tracking sessions.",
          "Choose BlinkCamp if you want a simple browser tool centered on basic eye-training routines and speed-and-size adjustment.",
        ],
      },
      {
        heading: "What FoveaFlow includes",
        list: [
          "Smooth Pursuit for one-target visual tracking.",
          "Reaction Jumps for quick refocus.",
          "Multiple Distractions for focus under visual clutter.",
          "Lilac Chaser for fixation and peripheral awareness.",
          "Controls for speed units, target size, shape, color, opacity, trail length, motion path, motion behavior, distractor count, distractor brightness, letter overlays, viewing distance, and screen scale.",
        ],
      },
    ],
    comparisonLabel: "BlinkCamp",
    comparisonRows: [
      {
        feature: "Can I use it free in the browser?",
        foveaflow:
          "Yes. The app runs in the browser with no account or install.",
        alternative:
          "Yes. BlinkCamp is also a free browser-based eye training tool.",
      },
      {
        feature: "Can I adjust speed and target size?",
        foveaflow:
          "Yes. Speed can be tuned in deg/s, cm/s, or screen/s, and target size can be changed per session.",
        alternative: "Yes. BlinkCamp exposes simple speed and size controls.",
      },
      {
        feature: "Can I change how the target looks?",
        foveaflow:
          "Shape, color, opacity, trail length, and trail behavior are adjustable.",
        alternative:
          "BlinkCamp keeps the public controls simpler, with the main visible controls focused on speed and size.",
      },
      {
        feature: "Can I change paths and motion behavior?",
        foveaflow:
          "Path, direction changes, steady motion, speed waves, bursts, build/reset, and size pulse options are available depending on the drill.",
        alternative:
          "BlinkCamp uses a simpler routine-based setup rather than exposing the same path and motion-behavior controls.",
      },
      {
        feature: "Can I train with distractors or letters?",
        foveaflow:
          "Multiple Distractions includes distractor count and brightness controls. Letter overlays include letter color, weight, and scale controls.",
        alternative:
          "BlinkCamp is more focused on straightforward eye-training routines than distractor and letter-overlay customization.",
      },
      {
        feature: "Can I calibrate the session to my setup?",
        foveaflow:
          "Viewing distance and screen scale controls help match motion to your setup.",
        alternative:
          "BlinkCamp keeps setup lighter and does not expose the same viewing-distance and screen-scale controls.",
      },
      {
        feature: "Which drill set is broader?",
        foveaflow:
          "Smooth Pursuit, Reaction Jumps, Multiple Distractions, and Lilac Chaser are available as separate modes.",
        alternative:
          "BlinkCamp has its own exercise set and a simpler public workflow.",
      },
      {
        feature: "Can I link straight to a drill?",
        foveaflow:
          "Yes. Main modes and Smooth Pursuit patterns have direct URLs.",
        alternative: "BlinkCamp is organized around its own routine interface.",
      },
      {
        feature: "Is there a public source link?",
        foveaflow: "Yes. The GitHub repository is linked from the app.",
        alternative: "Yes. BlinkCamp also links to GitHub.",
      },
    ],
  },
  {
    slug: "eyetrainer-gg-alternative",
    path: "/eyetrainer-gg-alternative/",
    title: "FoveaFlow - EyeTrainer.gg Alternative for FPS Eye Training",
    description:
      "Compare FoveaFlow and EyeTrainer.gg for FPS eye training, visual tracking, reaction drills, distraction control, and browser-based warmups.",
    kicker: "Alternative",
    heading: "FoveaFlow vs EyeTrainer.gg",
    summary:
      "FoveaFlow is a free browser-based eye trainer for FPS warmups, visual tracking, reaction jumps, distractor tracking, and peripheral awareness. It is a practical alternative if you want to start in the browser with no account or install.",
    primaryCta: {
      label: "Try FoveaFlow",
      href: "/",
    },
    secondaryCta: {
      label: "Open FPS warmup",
      href: "/fps-eye-training/",
    },
    sourceLink: {
      label: "Visit EyeTrainer.gg",
      href: "https://www.eyetrainer.gg/",
    },
    sections: [
      {
        heading: "Best fit",
        body: [
          "Choose FoveaFlow if you want a lightweight web app with direct access to visual tracking, reaction, distractor, and fixation drills.",
          "EyeTrainer.gg also offers simple browser patterns and promotes its upcoming Steam version from the public page.",
        ],
      },
      {
        heading: "What FoveaFlow includes",
        list: [
          "Smooth Pursuit paths for moving-target tracking.",
          "Reaction Jumps for quick refocus.",
          "Multiple Distractions for staying with a target through clutter.",
          "Lilac Chaser for fixation and peripheral awareness.",
          "Controls for speed units, target size, shape, color, opacity, trail length, motion path, motion behavior, distractors, letter overlays, viewing distance, screen scale, and mode-specific options such as Lilac Chaser ball scale.",
          "Local settings with no account or install.",
        ],
      },
    ],
    comparisonLabel: "EyeTrainer.gg",
    comparisonRows: [
      {
        feature: "Is it aimed at FPS eye training?",
        foveaflow:
          "Yes. FoveaFlow includes FPS warmup-friendly drills for tracking, refocus, and focus under clutter.",
        alternative:
          "Yes. EyeTrainer.gg is also positioned around FPS eye training.",
      },
      {
        feature: "Can I start in the browser?",
        foveaflow: "Yes",
        alternative:
          "Yes. The public page includes simple browser patterns and also promotes a Steam wishlist.",
      },
      {
        feature: "Do I need an account or install?",
        foveaflow:
          "No. FoveaFlow runs in the browser and stores settings locally.",
        alternative:
          "No account is needed for the simple browser patterns shown publicly. Steam is promoted for the upcoming app.",
      },
      {
        feature: "Which drills are available?",
        foveaflow:
          "Smooth Pursuit, Reaction Jumps, Multiple Distractions, and Lilac Chaser are available as separate modes.",
        alternative:
          "EyeTrainer.gg provides simple pattern options, including patterns such as Vertical Waves.",
      },
      {
        feature: "How much can I customize?",
        foveaflow:
          "Speed units, target size, shape, color, opacity, trails, paths, motion behavior, distractors, letter overlays, viewing distance, screen scale, and mode-specific controls.",
        alternative:
          "The public browser page keeps controls simple: Show Grid, Darkmode, and pattern selection.",
      },
      {
        feature: "Can I tune target appearance and calibration?",
        foveaflow:
          "Target appearance, trail display, distractor brightness, letter styling, viewing distance, and screen scale can be tuned.",
        alternative:
          "EyeTrainer.gg focuses the public browser tool on simple pattern practice rather than detailed target and display calibration.",
      },
    ],
  },
] as const satisfies readonly SupportPage[];

export const findSupportPage = (slug: string) =>
  supportPages.find((page) => page.slug === slug);

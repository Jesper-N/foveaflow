import type { TrainingMode } from "../engine/presets";
import type { PatternId } from "../engine/types";
import type { PageSeoContent } from "./page-copy";
import { siteMetadata } from "./site";

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export interface TrainerRoute {
  slug: string;
  path: `/${string}/`;
  lastModified: string;
  mode: TrainingMode;
  patternId?: PatternId;
  label: string;
  heading: string;
  title: string;
  description: string;
  indexable: boolean;
  seoContent: PageSeoContent;
}

const smoothPursuitSeoContent = {
  body: [
    "Smooth Pursuit is FoveaFlow's moving-target drill. Keep your head still, follow one target with your eyes, and stay smooth instead of jumping ahead.",
    "Choose an easy path when you want rhythm and control. Choose a harder path when you want more direction changes and more target-search demand.",
    "Use Smooth Pursuit for short browser-based practice, a pre-game warmup, or a focused reset after dense screen work.",
  ],
  faq: [
    {
      answer:
        "Smooth Pursuit is a drill where you follow one moving target as steadily as you can with your eyes.",
      question: "What is Smooth Pursuit?",
    },
    {
      answer:
        "Use it when you want steady moving-target practice without the extra clutter of other drills.",
      question: "When should I use Smooth Pursuit?",
    },
    {
      answer:
        "Speed, target size, and path matter most because they change difficulty quickly.",
      question: "Which settings matter most?",
    },
    {
      answer:
        "Start with a predictable path such as Circle or Ellipse before moving to harder patterns.",
      question: "Which path is best for beginners?",
    },
    {
      answer:
        "Yes. It works well as a short visual warmup before games or demanding screen tasks.",
      question: "Is Smooth Pursuit good as a warmup?",
    },
    {
      answer:
        "No. FoveaFlow is practice software and should not replace professional care.",
      question: "Is this medical treatment?",
    },
  ],
  heading: "Smooth Pursuit Eye Training",
  hero: "Follow one moving target and train steady visual tracking.",
  kicker: "Smooth Pursuit",
  primaryCta: {
    href: "/smooth-pursuit/",
    label: "Start Smooth Pursuit",
  },
  secondaryCta: {
    href: "/guide/",
    label: "Open the full guide",
  },
  trustNote:
    "Updated July 10, 2026. This is practice software, not medical care, so stop if the session feels uncomfortable.",
} satisfies PageSeoContent;

const reactionJumpsSeoContent = {
  body: [
    "Reaction Jumps is the drill to use when moving smoothly is not the point. The target holds still, then jumps to a new location.",
    "This mode is useful when you want faster target acquisition and cleaner refocusing. Start slower for accuracy, then raise the speed for a more demanding session.",
    "Reaction Jumps works well as a short pre-game warmup or a fast visual reset between tasks.",
  ],
  faq: [
    {
      answer:
        "Reaction Jumps trains quick target acquisition and quick refocus from one target position to the next.",
      question: "What does Reaction Jumps train?",
    },
    {
      answer:
        "Choose Reaction Jumps when you want discrete target changes rather than continuous motion.",
      question: "When should I choose this over Smooth Pursuit?",
    },
    {
      answer:
        "Lower the speed and increase target size so you have more time to settle on each jump.",
      question: "How do I make it easier?",
    },
    {
      answer:
        "Raise the speed and reduce target size so you must find each new position faster.",
      question: "How do I make it harder?",
    },
    {
      answer:
        "Yes. It can be a short warmup for games that reward fast visual reactions.",
      question: "Is Reaction Jumps useful before games?",
    },
    {
      answer:
        "No. It is designed for practice, not to promise eyesight improvement.",
      question: "Is this meant to improve eyesight?",
    },
  ],
  heading: "Reaction Jumps Eye Training",
  hero: "Snap to the next target and train fast refocus.",
  kicker: "Reaction Jumps",
  primaryCta: {
    href: "/reaction-jumps/",
    label: "Start Reaction Jumps",
  },
  secondaryCta: {
    href: "/guide/",
    label: "Compare all drills",
  },
  trustNote:
    "Updated July 10, 2026. Keep sessions brief and controlled. If the drill causes strain or discomfort, stop.",
} satisfies PageSeoContent;

const multipleDistractionsSeoContent = {
  body: [
    "Multiple Distractions is FoveaFlow's clutter drill. One target matters most, but other moving objects share the screen and try to pull your attention away.",
    "This mode is a strong fit when you want to practice selective attention and target identity under visual noise.",
    "Use this drill when Smooth Pursuit feels too clean and you want a more realistic visual-attention challenge.",
  ],
  faq: [
    {
      answer:
        "It is the task of following the correct target while similar moving objects compete for your attention.",
      question: "What is distractor tracking?",
    },
    {
      answer:
        "It trains selective attention, target identity, and steady tracking under clutter.",
      question: "What does Multiple Distractions train?",
    },
    {
      answer:
        "Start with fewer distractors, a slower speed, and a larger main target.",
      question: "How should beginners start?",
    },
    {
      answer:
        "Use it when you want a busier, harder tracking task than Smooth Pursuit.",
      question: "When should I use this mode?",
    },
    {
      answer:
        "Yes. It can be useful as a short warmup for games where visual clutter matters.",
      question: "Is this good for gamers?",
    },
    {
      answer:
        "No. It is practice software, not a treatment or diagnostic tool.",
      question: "Is this a medical tool?",
    },
  ],
  heading: "Distractor Tracking Eye Training",
  hero: "Hold the right target even when the screen gets busy.",
  kicker: "Multiple Distractions",
  primaryCta: {
    href: "/multiple-distractions/",
    label: "Start Distractor Tracking",
  },
  secondaryCta: {
    href: "/smooth-pursuit/",
    label: "Try Smooth Pursuit first",
  },
  trustNote:
    "Updated July 10, 2026. Start with fewer distractors or a bigger target, and stop if the session becomes uncomfortable.",
} satisfies PageSeoContent;

const lilacChaserSeoContent = {
  body: [
    "Lilac Chaser is different from the moving-target drills. Instead of following an object, you keep your eyes on the center cross while the outer ring changes.",
    "This mode works best when you resist the urge to chase the disappearing gap. Keep your gaze centered, stay relaxed, and let the effect happen on its own.",
    "Use Lilac Chaser for a short fixation drill, a perceptual reset, or a quick change of pace between more active modes.",
  ],
  faq: [
    {
      answer:
        "Lilac Chaser is a fixation drill where you keep your gaze on a central cross while the outer pattern changes.",
      question: "What is Lilac Chaser?",
    },
    {
      answer:
        "The goal is steady fixation and better awareness of change away from the center of your gaze.",
      question: "What is the goal of this mode?",
    },
    {
      answer:
        "No. Keep your eyes on the center cross and let the visual effect happen in the periphery.",
      question: "Should I follow the outer shapes?",
    },
    {
      answer:
        "Use it when you want a fixation-focused drill rather than a moving-target tracking session.",
      question: "When should I use this mode?",
    },
    {
      answer:
        "No. It is a browser-based practice drill and not medical treatment.",
      question: "Is this the same as medical peripheral-vision therapy?",
    },
    {
      answer: "Stop the session and rest. Do not push through discomfort.",
      question: "What if the effect feels strange or uncomfortable?",
    },
  ],
  heading: "Lilac Chaser Fixation and Peripheral Awareness",
  hero: "Hold steady at the center and notice change around it.",
  kicker: "Lilac Chaser",
  primaryCta: {
    href: "/lilac-chaser/",
    label: "Start Lilac Chaser",
  },
  secondaryCta: {
    href: "/guide/",
    label: "Try another drill",
  },
  trustNote:
    "Updated July 10, 2026. If the visual effect feels strange or uncomfortable, stop the session and rest.",
} satisfies PageSeoContent;

type PursuitPatternId = Exclude<PatternId, "multipleObjectTracking">;

const patternSummaries = {
  bounce:
    "Bounce adds repeated reversals at the edges. It is useful when you want more direction changes and less continuous flow than Circle or Wave.",
  circle:
    "Circle is the easiest repeating Smooth Pursuit pattern and the best starting point for most users. The loop is predictable, which makes it useful for warmups and speed changes.",
  clover:
    "Clover creates repeated looping lobes for continuous motion with more shape variation than Circle.",
  cornerTour:
    "Corner Tour gives each corner of the display a deliberate role, making the route spacious and structured.",
  diagonal:
    "Diagonal uses longer corner-to-corner motion, so it emphasizes broader screen coverage and clean tracking over distance.",
  diamondLoop:
    "Diamond Loop combines a simple repeating route with clear corner transitions and sharper shifts than Circle.",
  directionChange:
    "Hard Turns is one of the most demanding Smooth Pursuit patterns because the target changes direction abruptly.",
  downLeftSweep:
    "Down-left Sweep moves from the top-right corner toward the bottom-left corner on a simple diagonal line.",
  downRightSweep:
    "Down-right Sweep moves from the top-left corner toward the bottom-right corner on a simple diagonal line.",
  ellipse:
    "Ellipse keeps the calm rhythm of Circle but changes the width and height of the motion. It is a good bridge pattern when you want a familiar loop with more range.",
  figureEight:
    "Figure Eight adds a crossover point, which means the target passes through the center and changes direction more often than a simple loop.",
  horizontalSweep:
    "Horizontal Sweep keeps the motion simple and broad for left-right tracking across a larger visual range.",
  hourglass:
    "Hourglass narrows through the middle and opens back out, creating repeated crossing behavior with a constrained shape.",
  lissajous:
    "Lissajous is one of the more complex flowing patterns because the target moves through a looping path that changes its relationship to the center over time.",
  perimeterLoop:
    "Edge Loop pushes the target around the perimeter, making the drill more spacious and edge-focused than center-heavy loops.",
  randomWalk:
    "Random removes the comfort of a repeating loop. Because the target changes direction and position less predictably, the drill adds more target-search work than a simple circle or ellipse.",
  stairStep:
    "Stair Steps creates a mechanical route with discrete directional segments that stays easier to predict than Random or Hard Turns.",
  teleport:
    "Teleport moves the target between separate positions without continuous travel, which emphasizes quick reacquisition instead of smooth tracking.",
  verticalSweep:
    "Vertical Sweep mirrors the simplicity of Horizontal Sweep but changes the direction of travel for straightforward up-down tracking.",
  wave: "Wave introduces a repeating up-and-down rhythm on top of horizontal movement. It stays readable and smooth without the abrupt feel of hard corners.",
  zigZag:
    "Zigzag adds frequent directional switching, so it feels more aggressive than Wave or Diagonal.",
} satisfies Record<PursuitPatternId, string>;

interface PublicPursuitPatternRoute {
  patternId: PursuitPatternId;
  slug: string;
  label: string;
}

const publicPursuitPatternRoutes = [
  { label: "Random", patternId: "randomWalk", slug: "random" },
  { label: "Circle", patternId: "circle", slug: "circle" },
  { label: "Ellipse", patternId: "ellipse", slug: "ellipse" },
  { label: "Figure eight", patternId: "figureEight", slug: "figure-eight" },
  { label: "Wave", patternId: "wave", slug: "wave" },
  { label: "Diagonal", patternId: "diagonal", slug: "diagonal" },
  { label: "Bounce", patternId: "bounce", slug: "bounce" },
  { label: "Hard turns", patternId: "directionChange", slug: "hard-turns" },
  {
    label: "Horizontal sweep",
    patternId: "horizontalSweep",
    slug: "horizontal-sweep",
  },
  {
    label: "Vertical sweep",
    patternId: "verticalSweep",
    slug: "vertical-sweep",
  },
  {
    label: "Down-right sweep",
    patternId: "downRightSweep",
    slug: "down-right-sweep",
  },
  {
    label: "Down-left sweep",
    patternId: "downLeftSweep",
    slug: "down-left-sweep",
  },
  { label: "Edge loop", patternId: "perimeterLoop", slug: "edge-loop" },
  { label: "Diamond loop", patternId: "diamondLoop", slug: "diamond-loop" },
  { label: "Clover", patternId: "clover", slug: "clover" },
  { label: "Zigzag", patternId: "zigZag", slug: "zigzag" },
  { label: "Stair steps", patternId: "stairStep", slug: "stair-steps" },
  { label: "Lissajous", patternId: "lissajous", slug: "lissajous" },
  { label: "Hourglass", patternId: "hourglass", slug: "hourglass" },
  { label: "Corner tour", patternId: "cornerTour", slug: "corner-tour" },
] satisfies readonly PublicPursuitPatternRoute[];

const buildPatternSeoContent = (
  label: string,
  path: `/${string}/`,
  patternId: PursuitPatternId
) =>
  ({
    body: [
      patternSummaries[patternId] ??
        `${label} loads a dedicated Smooth Pursuit path so you can start that style of moving-target practice immediately.`,
      "Start with a comfortable speed and a medium target size, then raise difficulty only when you can stay on the target cleanly.",
    ],
    faq: [
      {
        answer:
          "It is a Smooth Pursuit pattern page that loads the matching path so you can start that style of moving-target practice immediately.",
        question: `What is the ${label} drill?`,
      },
      {
        answer:
          "The path shape changes how predictable the movement feels and how often the target changes direction.",
        question: `What makes the ${label} path different?`,
      },
      {
        answer:
          "Lower the speed, increase target size, and keep the trail visible until you can stay on target comfortably.",
        question: "How do I make this pattern easier?",
      },
      {
        answer:
          "Raise the speed, reduce target size, or switch from an easy loop to a more demanding path.",
        question: "How do I make this pattern harder?",
      },
    ],
    heading: `${toTitleCase(label)} Smooth Pursuit Drill`,
    hero: `Use the ${label} path for short smooth pursuit practice.`,
    kicker: "Smooth Pursuit pattern",
    primaryCta: {
      href: path,
      label: `Start ${label}`,
    },
    secondaryCta: {
      href: "/smooth-pursuit/",
      label: "Open Smooth Pursuit",
    },
    trustNote:
      "Updated July 10, 2026. This is a browser-based practice drill and not medical therapy.",
  }) satisfies PageSeoContent;

export const trainerRoutes = [
  {
    description:
      "Free online eye trainer for smooth pursuit, visual tracking, and steady moving-target practice. Browser-based with no account or install.",
    heading: "Smooth Pursuit Eye Training",
    indexable: true,
    label: "Smooth Pursuit",
    lastModified: "2026-07-10",
    mode: "pursuit",
    path: "/smooth-pursuit/",
    patternId: "randomWalk",
    seoContent: smoothPursuitSeoContent,
    slug: "smooth-pursuit",
    title: `${siteMetadata.name} - Free Online Smooth Pursuit Eye Trainer`,
  },
  ...publicPursuitPatternRoutes.map((patternRoute) => ({
    description: `Practice the ${patternRoute.label} smooth pursuit pattern online. Adjust speed, target size, color, trail, and screen scale for short visual tracking sessions.`,
    heading: `${toTitleCase(patternRoute.label)} Smooth Pursuit Eye Training`,
    indexable: false,
    label: patternRoute.label,
    lastModified: "2026-07-10",
    mode: "pursuit" as const,
    path: `/${patternRoute.slug}/` as const,
    patternId: patternRoute.patternId,
    seoContent: buildPatternSeoContent(
      patternRoute.label,
      `/${patternRoute.slug}/`,
      patternRoute.patternId
    ),
    slug: patternRoute.slug,
    title: `${siteMetadata.name} - ${toTitleCase(patternRoute.label)} Smooth Pursuit Drill`,
  })),
  {
    description:
      "Free online eye trainer for quick refocus, target acquisition, and fast visual reaction practice. Browser-based with no account or install.",
    heading: "Reaction Jumps Eye Training",
    indexable: true,
    label: "Reaction Jumps",
    lastModified: "2026-07-10",
    mode: "reactionTime",
    path: "/reaction-jumps/",
    seoContent: reactionJumpsSeoContent,
    slug: "reaction-jumps",
    title: `${siteMetadata.name} - Free Online Reaction Jumps Eye Trainer`,
  },
  {
    description:
      "Free online eye trainer for selective attention, distractor tracking, and focus under visual clutter. Browser-based with no account or install.",
    heading: "Distractor Tracking Eye Training",
    indexable: true,
    label: "Multiple Distractions",
    lastModified: "2026-07-10",
    mode: "mot",
    path: "/multiple-distractions/",
    seoContent: multipleDistractionsSeoContent,
    slug: "multiple-distractions",
    title: `${siteMetadata.name} - Free Online Multiple Distractions Eye Trainer`,
  },
  {
    description:
      "Free online eye trainer for steady fixation, peripheral awareness, and noticing change outside center focus. Browser-based with no account or install.",
    heading: "Lilac Chaser Fixation and Peripheral Awareness",
    indexable: true,
    label: "Lilac Chaser",
    lastModified: "2026-07-10",
    mode: "lilacChaser",
    path: "/lilac-chaser/",
    seoContent: lilacChaserSeoContent,
    slug: "lilac-chaser",
    title: `${siteMetadata.name} - Free Online Lilac Chaser Eye Trainer`,
  },
] satisfies TrainerRoute[];

export const indexableTrainerRoutes = trainerRoutes.filter(
  (route) => route.indexable
);

export const findTrainerRoute = (slug: string | undefined) => {
  if (!slug) {
    return null;
  }
  return trainerRoutes.find((route) => route.slug === slug) ?? null;
};

export const getRouteSlugFromPath = (path: string) =>
  path.split("?")[0]?.split("/").find(Boolean) ?? "";

export const getTrainerRoute = (mode: TrainingMode, patternId: PatternId) => {
  if (mode === "reactionTime") {
    return findTrainerRoute("reaction-jumps");
  }
  if (mode === "mot") {
    return findTrainerRoute("multiple-distractions");
  }
  if (mode === "lilacChaser") {
    return findTrainerRoute("lilac-chaser");
  }

  return (
    trainerRoutes.find(
      (route) => route.mode === "pursuit" && route.patternId === patternId
    ) ?? null
  );
};

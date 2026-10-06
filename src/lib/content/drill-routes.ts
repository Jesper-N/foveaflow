import { siteMetadata } from "$lib/content/site";
import type { PatternId } from "$lib/trainer/engine/types";
import type { DrillId } from "$lib/trainer/settings/drills";
import { pursuitPatterns } from "$lib/trainer/settings/patterns";
import type { PursuitPatternId } from "$lib/trainer/settings/patterns";

import type { DrillPageCopy } from "./types";

/** A page that opens the trainer on one drill, or on one Smooth Pursuit path. */
export interface DrillRoute {
  slug: string;
  path: `/${string}/`;
  lastModified: string;
  drillId: DrillId;
  patternId?: PatternId;
  label: string;
  heading: string;
  title: string;
  description: string;
  /** Pattern pages are reachable from the guide but kept out of search results. */
  indexable: boolean;
  copy: DrillPageCopy;
}

interface PatternDrillRoute extends DrillRoute {
  patternId: PursuitPatternId;
}

const LAST_MODIFIED = "2026-07-10";

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const smoothPursuitCopy = {
  body: [
    "Smooth Pursuit is FoveaFlow's moving-target drill. Keep your head still, follow one target with your eyes, and stay smooth instead of jumping ahead.",
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
  ],
  heading: "Smooth Pursuit Eye Training",
  hero: "Follow one moving target and train steady visual tracking.",
} satisfies DrillPageCopy;

const reactionJumpsCopy = {
  body: [
    "Reaction Jumps is the drill to use when moving smoothly is not the point. The target holds still, then jumps to a new location.",
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
  ],
  heading: "Reaction Jumps Eye Training",
  hero: "Snap to the next target and train fast refocus.",
} satisfies DrillPageCopy;

const multipleDistractionsCopy = {
  body: [
    "Multiple Distractions is FoveaFlow's clutter drill. One target matters most, but other moving objects share the screen and try to pull your attention away.",
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
  ],
  heading: "Distractor Tracking Eye Training",
  hero: "Hold the right target even when the screen gets busy.",
} satisfies DrillPageCopy;

const lilacChaserCopy = {
  body: [
    "Lilac Chaser is different from the moving-target drills. Instead of following an object, you keep your eyes on the center cross while the outer ring changes.",
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
  ],
  heading: "Lilac Chaser Fixation and Peripheral Awareness",
  hero: "Hold steady at the center and notice change around it.",
} satisfies DrillPageCopy;

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
  verticalSweep:
    "Vertical Sweep mirrors the simplicity of Horizontal Sweep but changes the direction of travel for straightforward up-down tracking.",
  wave: "Wave introduces a repeating up-and-down rhythm on top of horizontal movement. It stays readable and smooth without the abrupt feel of hard corners.",
  zigZag:
    "Zigzag adds frequent directional switching, so it feels more aggressive than Wave or Diagonal.",
} satisfies Record<PursuitPatternId, string>;

const patternSlugs = {
  bounce: "bounce",
  circle: "circle",
  clover: "clover",
  cornerTour: "corner-tour",
  diagonal: "diagonal",
  diamondLoop: "diamond-loop",
  directionChange: "hard-turns",
  downLeftSweep: "down-left-sweep",
  downRightSweep: "down-right-sweep",
  ellipse: "ellipse",
  figureEight: "figure-eight",
  horizontalSweep: "horizontal-sweep",
  hourglass: "hourglass",
  lissajous: "lissajous",
  perimeterLoop: "edge-loop",
  randomWalk: "random",
  stairStep: "stair-steps",
  verticalSweep: "vertical-sweep",
  wave: "wave",
  zigZag: "zigzag",
} satisfies Record<PursuitPatternId, string>;

const patternCopy = (label: string, patternId: PursuitPatternId) =>
  ({
    body: [
      patternSummaries[patternId],
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
    ],
    heading: `${toTitleCase(label)} Smooth Pursuit Drill`,
    hero: `Use the ${label} path for short smooth pursuit practice.`,
  }) satisfies DrillPageCopy;

/** Routes for Smooth Pursuit paths, in menu order. */
export const patternDrillRoutes = pursuitPatterns.map(
  ({ id, name }): PatternDrillRoute => ({
    copy: patternCopy(name, id),
    description: `Practice the ${name} smooth pursuit pattern online. Adjust speed, target size, color, and trail for short visual tracking sessions.`,
    drillId: "pursuit",
    heading: `${toTitleCase(name)} Smooth Pursuit Eye Training`,
    indexable: false,
    label: name,
    lastModified: LAST_MODIFIED,
    path: `/${patternSlugs[id]}/`,
    patternId: id,
    slug: patternSlugs[id],
    title: `${siteMetadata.name} - ${toTitleCase(name)} Smooth Pursuit Drill`,
  })
);

export const drillRoutes: readonly DrillRoute[] = [
  {
    copy: smoothPursuitCopy,
    description:
      "Free online eye trainer for smooth pursuit, visual tracking, and steady moving-target practice. Browser-based with no account or install.",
    drillId: "pursuit",
    heading: "Smooth Pursuit Eye Training",
    indexable: true,
    label: "Smooth Pursuit",
    lastModified: LAST_MODIFIED,
    path: "/smooth-pursuit/",
    patternId: "randomWalk",
    slug: "smooth-pursuit",
    title: `${siteMetadata.name} - Free Online Smooth Pursuit Eye Trainer`,
  },
  ...patternDrillRoutes,
  {
    copy: reactionJumpsCopy,
    description:
      "Free online eye trainer for quick refocus, target acquisition, and fast visual reaction practice. Browser-based with no account or install.",
    drillId: "reactionTime",
    heading: "Reaction Jumps Eye Training",
    indexable: true,
    label: "Reaction Jumps",
    lastModified: LAST_MODIFIED,
    path: "/reaction-jumps/",
    slug: "reaction-jumps",
    title: `${siteMetadata.name} - Free Online Reaction Jumps Eye Trainer`,
  },
  {
    copy: multipleDistractionsCopy,
    description:
      "Free online eye trainer for selective attention, distractor tracking, and focus under visual clutter. Browser-based with no account or install.",
    drillId: "mot",
    heading: "Distractor Tracking Eye Training",
    indexable: true,
    label: "Multiple Distractions",
    lastModified: LAST_MODIFIED,
    path: "/multiple-distractions/",
    slug: "multiple-distractions",
    title: `${siteMetadata.name} - Free Online Multiple Distractions Eye Trainer`,
  },
  {
    copy: lilacChaserCopy,
    description:
      "Free online eye trainer for steady fixation, peripheral awareness, and noticing change outside center focus. Browser-based with no account or install.",
    drillId: "lilacChaser",
    heading: "Lilac Chaser Fixation and Peripheral Awareness",
    indexable: true,
    label: "Lilac Chaser",
    lastModified: LAST_MODIFIED,
    path: "/lilac-chaser/",
    slug: "lilac-chaser",
    title: `${siteMetadata.name} - Free Online Lilac Chaser Eye Trainer`,
  },
];

export const indexableDrillRoutes = drillRoutes.filter(
  (route) => route.indexable
);

export const findDrillRoute = (slug: string | undefined) =>
  drillRoutes.find((route) => route.slug === slug) ?? null;

/** The first path segment, which is the route slug: `/circle/` gives `circle`. */
export const slugFromPath = (path: string) =>
  path.split("?")[0]?.split("/").find(Boolean) ?? "";

/** The page for a drill. Smooth Pursuit has one page per path. */
export const routeForDrill = (drillId: DrillId, patternId: PatternId) =>
  drillRoutes.find((route) =>
    drillId === "pursuit"
      ? route.drillId === "pursuit" && route.patternId === patternId
      : route.drillId === drillId
  ) ?? null;

/** The main page for a drill, as linked from the guide. */
export const mainRouteForDrill = (drillId: DrillId) =>
  indexableDrillRoutes.find((route) => route.drillId === drillId);

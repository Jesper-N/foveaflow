import type { DrillId } from "$lib/trainer/settings/drills";

interface DrillGuideContent {
  drillId: DrillId;
  title: string;
  summary: string;
  steps: readonly string[];
  /** What the drill trains, in a sentence or two. */
  benefits: string;
}

/** How to practice each drill. */
export const drillGuides = [
  {
    benefits:
      "Smooth Pursuit helps train steady tracking, moving-target focus, and controlled eye movement across more of your usable range.",
    drillId: "pursuit",
    steps: [
      "Keep your head still and let your eyes do the work.",
      "Track the ball as smoothly as you can instead of jumping ahead of it.",
      "Use predictable paths for steady tracking. Use random paths or hard turns when you want more target-search work.",
    ],
    summary: "Train smooth visual tracking by following one moving target.",
    title: "Smooth Pursuit",
  },
  {
    benefits:
      "Reaction Jumps trains quick target acquisition, saccadic eye movement, peripheral detection, and fast refocusing. It is useful when you want to react to a new visual target without moving your head first.",
    drillId: "reactionTime",
    steps: [
      "Keep your head still and start with your eyes on the ball.",
      "When it jumps, find the new location and actually focus on it before the next jump.",
      "Use slower speeds for clean refocusing. Raise the speed when you want a sharper reaction drill.",
    ],
    summary:
      "Train quick refocus by snapping your eyes to each new target position.",
    title: "Reaction Jumps",
  },
  {
    benefits:
      "Multiple Distractions trains selective attention, visual tracking under clutter, and target identity. You follow the motion and keep choosing the right ball when similar ones compete for your attention.",
    drillId: "mot",
    steps: [
      "Keep your head still and lock onto the main, brightest ball.",
      "Follow it like Smooth Pursuit, but do not let the darker balls pull your eyes away.",
      "Start with fewer distractors, then add more when you can keep the target cleanly.",
    ],
    summary:
      "Sharpen selective focus by tracking the brightest target through moving distractions.",
    title: "Multiple Distractions",
  },
  {
    benefits:
      "Lilac Chaser trains fixation, peripheral awareness, visual attention, and noticing change away from the point you are looking at. For gaming, it can be a short warmup for catching movement near the edge of your vision without constantly shifting your gaze.",
    drillId: "lilacChaser",
    steps: [
      "Look only at the black cross in the middle.",
      "Do not follow the balls with your eyes.",
      "Let the disappearing gap move around the fixed circle. With steady focus, the colored balls may fade and the missing spot can look like a moving green afterimage.",
    ],
    summary: "Train peripheral awareness by holding focus on the center cross.",
    title: "Lilac Chaser",
  },
] as const satisfies readonly DrillGuideContent[];

export const getDrillGuide = (drillId: DrillId) =>
  drillGuides.find((guide) => guide.drillId === drillId) ?? drillGuides[0];

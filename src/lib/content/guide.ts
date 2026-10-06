/** A study or video the guide cites. */
interface ReferenceLink {
  label: string;
  url: string;
}

export const guideMetadata = {
  description:
    "Choose the right FoveaFlow drill for visual tracking, quick refocus, peripheral awareness, FPS warmups, and focus under distraction.",
  lastModified: "2026-09-12",
  title: "FoveaFlow Guide - Eye Trainer Drills & Visual Tracking Settings",
} as const;

export const guideFaq = [
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

/** Who the app is for, shown in the guide and in structured data. */
export const audiences = [
  {
    body: "Sharpen your visual warmup before FPS games with tracking, refocus, peripheral awareness, and character movement reading drills.",
    title: "Gamers",
  },
  {
    body: "Sharpen focus between code, logs, dashboards, terminals, tickets, and multi-monitor work.",
    title: "IT professionals",
  },
  {
    body: "Give tired screen eyes a quick active break after reading, meetings, or too many tabs.",
    title: "People on screens all day",
  },
] as const;

export const referenceLinks = [
  {
    label: "Visual guidance of smooth pursuit eye movements",
    url: "https://pubmed.ncbi.nlm.nih.gov/20510853/",
  },
  {
    label: "Spatial allocation of attention during smooth pursuit",
    url: "https://pubmed.ncbi.nlm.nih.gov/19533852/",
  },
  {
    label: "Saccadic reaction time factors",
    url: "https://pubmed.ncbi.nlm.nih.gov/33324183/",
  },
  {
    label: "Role of peripheral vision in saccade planning",
    url: "https://pubmed.ncbi.nlm.nih.gov/19146326/",
  },
  {
    label: "Visual learning in multiple-object tracking",
    url: "https://pubmed.ncbi.nlm.nih.gov/18493599/",
  },
  {
    label: "Lilac chaser illusion",
    url: "https://en.wikipedia.org/wiki/Lilac_chaser",
  },
  {
    label: "FPS Eye Training Warmup (HIGH FPS)",
    url: "https://www.youtube.com/watch?v=WAPKAZhOFM4",
  },
] as const satisfies readonly ReferenceLink[];

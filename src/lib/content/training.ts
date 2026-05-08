import type { TrainingMode } from "../engine/presets";

export const audienceNotes = [
  {
    title: "Gamers",
    body: "Sharpen your visual warmup before FPS games with tracking, refocus, peripheral awareness, and character movement reading drills.",
  },
  {
    title: "IT professionals",
    body: "Sharpen focus between code, logs, dashboards, terminals, tickets, and multi-monitor work.",
  },
  {
    title: "People on screens all day",
    body: "Give tired screen eyes a quick active break after reading, meetings, or too many tabs.",
  },
] as const;

export const trainingModeGuides = [
  {
    mode: "pursuit",
    title: "Smooth Pursuit",
    summary: "Train smooth visual tracking by following one moving target.",
    steps: [
      "Keep your head still and let your eyes do the work.",
      "Track the ball as smoothly as you can instead of jumping ahead of it.",
      "Use predictable paths for steady tracking. Use random paths or hard turns when you want more target-search work.",
    ],
    benefits:
      "Smooth Pursuit helps train steady tracking, moving-target focus, and controlled eye movement across more of your usable range. Predictable paths build rhythm and control. Random paths and hard turns add more visual search and reaction demand.",
  },
  {
    mode: "reactionTime",
    title: "Reaction Jumps",
    summary:
      "Train quick refocus by snapping your eyes to each new target position.",
    steps: [
      "Keep your head still and start with your eyes on the ball.",
      "When it jumps, find the new location and actually focus on it before the next jump.",
      "Use slower speeds for clean refocusing. Raise the speed when you want a sharper reaction drill.",
    ],
    benefits:
      "Reaction Jumps trains quick target acquisition, saccadic eye movement, peripheral detection, and fast refocusing. It is useful when you want to react to a new visual target without moving your head first.",
  },
  {
    mode: "mot",
    title: "Multiple Distractions",
    summary:
      "Sharpen selective focus by tracking the brightest target through moving distractions.",
    steps: [
      "Keep your head still and lock onto the main, brightest ball.",
      "Follow it like Smooth Pursuit, but do not let the darker balls pull your eyes away.",
      "Start with fewer distractors, then add more when you can keep the target cleanly.",
    ],
    benefits:
      "Multiple Distractions trains selective attention, visual tracking under clutter, and target identity. The job is not just following motion. You also have to keep choosing the right object when similar objects compete for attention.",
  },
  {
    mode: "lilacChaser",
    title: "Lilac Chaser",
    summary: "Train peripheral awareness by holding focus on the center cross.",
    steps: [
      "Look only at the black cross in the middle.",
      "Do not follow the balls with your eyes.",
      "Let the disappearing gap move around the fixed circle. With steady focus, the colored balls may fade and the missing spot can look like a moving green afterimage.",
    ],
    benefits:
      "Lilac Chaser trains fixation, peripheral awareness, visual attention, and noticing change away from the point you are looking at. For gaming, it can be a short warmup for catching movement near the edge of your vision without constantly shifting your gaze.",
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
] as const;

export const targetForms = [
  { id: "circle", name: "Circle" },
  { id: "ring", name: "Ring" },
  { id: "square", name: "Square" },
  { id: "diamond", name: "Diamond" },
  { id: "triangle", name: "Triangle" },
  { id: "cross", name: "Cross" },
] as const;

export type TargetForm = (typeof targetForms)[number]["id"];

export const letterWeights = [
  { id: 400, name: "Regular" },
  { id: 500, name: "Medium" },
  { id: 600, name: "Semibold" },
  { id: 700, name: "Bold" },
  { id: 800, name: "Heavy" },
] as const;

export type LetterWeight = (typeof letterWeights)[number]["id"];

export const lilacChaserColors = [
  { id: "#ff00fe", name: "Magenta" },
  { id: "#ff3030", name: "Red" },
  { id: "#245cff", name: "Blue" },
  { id: "#ffcc00", name: "Gold" },
  { id: "#00d7ff", name: "Cyan" },
] as const;

export type LilacChaserColor = (typeof lilacChaserColors)[number]["id"];

export const isTargetForm = (value: string): value is TargetForm =>
  targetForms.some((form) => form.id === value);

export const isLetterWeight = (value: number): value is LetterWeight =>
  letterWeights.some((weight) => weight.id === value);

export const isLilacChaserColor = (value: string): value is LilacChaserColor =>
  lilacChaserColors.some((color) => color.id === value);

export const getLetterWeightName = (id: LetterWeight) =>
  letterWeights.find((weight) => weight.id === id)?.name ?? String(id);

export const getLilacChaserColorName = (id: LilacChaserColor) =>
  lilacChaserColors.find((color) => color.id === id)?.name ?? id;

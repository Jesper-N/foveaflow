import { t } from "$lib/i18n/translate";
import { behaviors } from "$lib/trainer/settings/behaviors";
import { drills } from "$lib/trainer/settings/drills";
import { letterWeights } from "$lib/trainer/settings/options";
import {
  predictablePatterns,
  unpredictablePatterns,
} from "$lib/trainer/settings/patterns";

import type { SelectGroup } from "../ui/select-types";

export const drillGroups = (): SelectGroup[] => [
  { options: drills.map(({ id, name }) => ({ label: t(name), value: id })) },
];

export const patternGroups = (): SelectGroup[] =>
  [
    { label: "Unpredictable", patterns: unpredictablePatterns },
    { label: "Predictable", patterns: predictablePatterns },
  ].map(({ label, patterns }) => ({
    label: t(label),
    options: patterns.map(({ id, name }) => ({ label: t(name), value: id })),
  }));

export const behaviorGroups = (): SelectGroup[] => [
  { options: behaviors.map(({ id, name }) => ({ label: t(name), value: id })) },
];

export const letterWeightGroups = (): SelectGroup[] => [
  {
    options: letterWeights.map(({ id, name }) => ({
      label: t(name),
      value: String(id),
    })),
  },
];

export const ballColorPresets = [
  "#fdc700",
  "#f0b100",
  "#ff8a00",
  "#ff3b6b",
  "#c86bff",
  "#2f7bff",
  "#00d7ff",
  "#34d17a",
] as const;

export const letterColorPresets = [
  "#000000",
  "#17181a",
  "#5c5b56",
  "#ffffff",
  "#ff8a00",
  "#ff3b6b",
  "#2f7bff",
  "#34d17a",
] as const;

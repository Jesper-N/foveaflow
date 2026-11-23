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

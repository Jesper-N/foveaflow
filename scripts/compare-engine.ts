import path from "node:path";
import { pathToFileURL } from "node:url";

import { DEFAULT_CALIBRATION } from "../src/lib/engine/calibration";
import {
  firstPreset,
  patternOptions,
  settingsFromPreset,
} from "../src/lib/engine/presets";
import { integrateSpeedProfile } from "../src/lib/engine/profiles";
import type * as ProfilesModule from "../src/lib/engine/profiles";
import { createRng } from "../src/lib/engine/random";
import type * as RandomModule from "../src/lib/engine/random";
import type { TargetForm } from "../src/lib/engine/types";
import {
  behaviorOptions,
  createBehaviorProfiles,
} from "../src/lib/trainer/behavior";
import { createTrainerFrameSampler } from "../src/lib/trainer/frame-sampler";
import type * as SamplerModule from "../src/lib/trainer/frame-sampler";

const [referenceDirectory] = process.argv.slice(2);
if (!referenceDirectory) {
  throw new Error(
    "Usage: bun scripts/compare-engine.ts <reference-bundle-directory>"
  );
}
const referenceSampler: typeof SamplerModule = await import(
  pathToFileURL(path.resolve(referenceDirectory, "trainer/frame-sampler.js"))
    .href
);
const referenceProfiles: typeof ProfilesModule = await import(
  pathToFileURL(path.resolve(referenceDirectory, "engine/profiles.js")).href
);
const referenceRandom: typeof RandomModule = await import(
  pathToFileURL(path.resolve(referenceDirectory, "engine/random.js")).href
);

const forms: TargetForm[] = [
  "circle",
  "square",
  "diamond",
  "triangle",
  "cross",
  "ring",
];
const patterns = [...patternOptions.map(({ id }) => id), "teleport"] as const;
const arenas = [
  { height: 1080, width: 1920 },
  { height: 844, width: 390 },
  { height: 60, width: 90 },
];
let comparisons = 0;
let scenarios = 0;
let maximumPositionError = 0;

for (const patternId of patterns) {
  for (const behavior of behaviorOptions) {
    for (const targetForm of forms) {
      for (const arena of arenas) {
        const settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION, {
          ...createBehaviorProfiles(behavior.id),
          distractorCount: 20,
          patternId,
          presetId: patternId === "teleport" ? "reactionTime" : "pursuit",
          targetCount: 5,
          targetForm,
        });
        const input: SamplerModule.TrainerFrameInput = {
          arena,
          distractorColor: "#339999",
          elapsedSec: 0,
          pathMarginPx: 16,
          rng: createRng(12_345),
          safeBallColor: "#76d900",
          seed: 12_345,
          settings,
          travelPx: 0,
        };
        const original = referenceSampler.createTrainerFrameSampler();
        const updated = createTrainerFrameSampler();
        scenarios += 1;
        for (let step = 0; step < 300; step += 1) {
          input.elapsedSec = step / 60;
          input.travelPx += step < 240 ? 7 : -7;
          if (step === 100) {
            settings.baseRadiusPx = 65;
            settings.distractorCount = 3;
            settings.targetCount = 2;
            input.arena = {
              height: arena.height * 0.8,
              width: arena.width * 0.9,
            };
          }
          if (step === 200) {
            settings.baseRadiusPx = 10;
            settings.distractorCount = 20;
            settings.targetCount = 5;
            input.arena = arena;
          }
          const before = original.sample(input);
          const after = updated.sample(input);
          if (before.count !== after.count) {
            throw new Error(
              `Target count mismatch: ${patternId}/${behavior.id}/${targetForm}/${step}`
            );
          }
          for (let index = 0; index < before.count; index += 1) {
            const a = before.frames[index];
            const b = after.frames[index];
            const error = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
            maximumPositionError = Math.max(maximumPositionError, error);
            if (
              error > 1e-7 ||
              a.radiusPx !== b.radiusPx ||
              a.alpha !== b.alpha ||
              a.color !== b.color ||
              a.visible !== b.visible ||
              a.role !== b.role
            ) {
              throw new Error(
                `Frame mismatch: ${patternId}/${behavior.id}/${targetForm}/${step}/${index}: ${JSON.stringify({ after: b, before: a, error })}`
              );
            }
            comparisons += 1;
          }
        }
      }
    }
  }
}

let maximumSpeedError = 0;
for (const behavior of behaviorOptions) {
  const { speedProfile } = createBehaviorProfiles(behavior.id);
  for (let step = 0; step < 10_000; step += 1) {
    const start = step / 60;
    const end = start + (step % 2 === 0 ? 1 / 144 : -1 / 30);
    const before = referenceProfiles.integrateSpeedProfile(
      speedProfile,
      start,
      end,
      420
    );
    const after = integrateSpeedProfile(speedProfile, start, end, 420);
    const error = Math.abs(before - after);
    maximumSpeedError = Math.max(maximumSpeedError, error);
    if (error > 1e-7) {
      throw new Error(
        `Speed mismatch: ${behavior.id}/${step}: ${before} != ${after}`
      );
    }
  }
}

for (const seed of [0, -42, 12_345, 0.5, 2_147_483_648]) {
  const before = referenceRandom.createRng(seed);
  const after = createRng(seed);
  for (let index = -1000; index <= 1000; index += 1) {
    if (before.randomAt(index) !== after.randomAt(index)) {
      throw new Error(`Random sequence mismatch: ${seed}/${index}`);
    }
  }
}

process.stdout.write(
  `${JSON.stringify({ comparisons, maximumPositionError, maximumSpeedError, scenarios })}\n`
);

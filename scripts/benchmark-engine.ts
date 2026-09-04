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
import {
  behaviorOptions,
  createBehaviorProfiles,
} from "../src/lib/trainer/behavior";
import { createTrainerFrameSampler } from "../src/lib/trainer/frame-sampler";
import type * as SamplerModule from "../src/lib/trainer/frame-sampler";

const [referenceDirectory] = process.argv.slice(2);
const samplerModule: typeof SamplerModule = referenceDirectory
  ? await import(
      pathToFileURL(
        path.resolve(referenceDirectory, "trainer/frame-sampler.js")
      ).href
    )
  : { createTrainerFrameSampler };
const profilesModule: Pick<typeof ProfilesModule, "integrateSpeedProfile"> =
  referenceDirectory
    ? await import(
        pathToFileURL(path.resolve(referenceDirectory, "engine/profiles.js"))
          .href
      )
    : { integrateSpeedProfile };
const integrate = profilesModule.integrateSpeedProfile;
const randomModule: Pick<typeof RandomModule, "createRng"> = referenceDirectory
  ? await import(
      pathToFileURL(path.resolve(referenceDirectory, "engine/random.js")).href
    )
  : { createRng };

const sampleCount = 100_000;
const median = (values: number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

const patterns = [
  ...patternOptions,
  { id: "teleport", name: "Reaction jumps" },
] as const;
const patternResults = patterns.map(({ id }) => {
  const times: number[] = [];
  let checksum = 0;
  for (let round = 0; round < 5; round += 1) {
    const sampler = samplerModule.createTrainerFrameSampler();
    const settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION, {
      distractorCount: 10,
      patternId: id,
      targetCount: 6,
    });
    const input: SamplerModule.TrainerFrameInput = {
      arena: { height: 1080, width: 1920 },
      distractorColor: "#339999",
      elapsedSec: 0,
      pathMarginPx: 16,
      rng: randomModule.createRng(12_345),
      safeBallColor: "#76d900",
      seed: 12_345,
      settings,
      travelPx: 0,
    };
    const start = performance.now();
    for (let index = 0; index < sampleCount; index += 1) {
      input.elapsedSec = index / 120;
      input.travelPx = index * 3;
      const sample = sampler.sample(input);
      checksum += sample.frames[0].x + sample.frames[sample.count - 1].y;
    }
    times.push(performance.now() - start);
  }
  return {
    checksum,
    milliseconds: median(times),
    pattern: id,
    samples: sampleCount,
  };
});

const profileResults = behaviorOptions.map(({ id }) => {
  const { speedProfile } = createBehaviorProfiles(id);
  const times: number[] = [];
  let checksum = 0;
  for (let round = 0; round < 5; round += 1) {
    const start = performance.now();
    for (let index = 0; index < sampleCount; index += 1) {
      checksum += integrate(speedProfile, index / 120, (index + 1) / 120, 360);
    }
    times.push(performance.now() - start);
  }
  return {
    behavior: id,
    checksum,
    milliseconds: median(times),
    samples: sampleCount,
  };
});

process.stdout.write(
  `${JSON.stringify({ patternResults, profileResults }, null, 2)}\n`
);

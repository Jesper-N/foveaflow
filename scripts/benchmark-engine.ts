// Times the motion engine without a browser. Run it on two checkouts to
// compare: `bun scripts/benchmark-engine.ts`. Checksums must match between
// runs when a change should not move any target.
import { FrameSampler } from "../src/lib/trainer/canvas/frame-sampler";
import { integrateSpeedProfile } from "../src/lib/trainer/engine/profiles";
import { createRng } from "../src/lib/trainer/engine/random";
import type { PatternId } from "../src/lib/trainer/engine/types";
import {
  behaviors,
  profilesForBehavior,
} from "../src/lib/trainer/settings/behaviors";
import { getDrill } from "../src/lib/trainer/settings/drills";
import { pursuitPatterns } from "../src/lib/trainer/settings/patterns";
import { createDefaultSettings } from "../src/lib/trainer/settings/settings";

const SAMPLE_COUNT = 100_000;
const ROUNDS = 5;
const SEED = 12_345;

const median = (values: number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

const time = (run: () => number) => {
  const times: number[] = [];
  let checksum = 0;
  for (let round = 0; round < ROUNDS; round += 1) {
    const start = performance.now();
    checksum += run();
    times.push(performance.now() - start);
  }
  return { checksum, milliseconds: median(times), samples: SAMPLE_COUNT };
};

const patterns: { drillId: string; patternId: PatternId }[] = [
  ...pursuitPatterns.map(({ id }) => ({ drillId: "pursuit", patternId: id })),
  { drillId: "reactionTime", patternId: "teleport" },
  { drillId: "mot", patternId: "multipleObjectTracking" },
];

const patternResults = patterns.map(({ drillId, patternId }) => {
  const settings = {
    ...createDefaultSettings(getDrill(drillId)),
    distractorCount: 10,
    patternId,
    targetCount: 6,
  };
  const arena = { height: 1080, width: 1920 };
  const result = time(() => {
    const sampler = new FrameSampler();
    const rng = createRng(SEED);
    let checksum = 0;
    for (let index = 0; index < SAMPLE_COUNT; index += 1) {
      const sample = sampler.sample(
        settings,
        arena,
        index / 120,
        index * 3,
        rng
      );
      checksum += sample.frames[0].x + sample.frames[sample.count - 1].y;
    }
    return checksum;
  });
  return { pattern: patternId, ...result };
});

const profileResults = behaviors.map(({ id }) => {
  const { speedProfile } = profilesForBehavior(id);
  const result = time(() => {
    let checksum = 0;
    for (let index = 0; index < SAMPLE_COUNT; index += 1) {
      checksum += integrateSpeedProfile(
        speedProfile,
        index / 120,
        (index + 1) / 120,
        360
      );
    }
    return checksum;
  });
  return { behavior: id, ...result };
});

process.stdout.write(
  `${JSON.stringify({ patternResults, profileResults }, null, 2)}\n`
);

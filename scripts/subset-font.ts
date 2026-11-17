import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { $ } from "bun";

const [source] = process.argv.slice(2);
if (!source) {
  console.error(
    "Usage: bun run font:subset <path to AlloVariableFriendly.woff2>"
  );
  process.exit(1);
}

const output = "src/assets/fonts/allo-latin.woff2";
const fonttools = "fonttools[woff]==4.60.1";
const latin =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

const workDir = await mkdtemp(path.join(tmpdir(), "allo-"));
const instanced = path.join(workDir, "allo.ttf");

try {
  await $`uvx --from ${fonttools} fonttools varLib.instancer ${source} wght=400:800 --quiet --output ${instanced}`;
  await $`uvx --from ${fonttools} pyftsubset ${instanced} --unicodes=${latin} ${"--layout-features=*"} ${"--name-IDs=*"} --flavor=woff2 --output-file=${output}`;
} finally {
  await rm(workDir, { force: true, recursive: true });
}

console.log(`Wrote ${output}`);

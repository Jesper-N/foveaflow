// Draws each Smooth Pursuit path into `src/lib/trainer/glyphs/pattern-glyphs.ts`,
// so the menus show the real routes without shipping the engine to every page.
// Run `bun scripts/generate-pattern-glyphs.ts` after a path changes.
import { fileURLToPath } from "node:url";

import { renderPatternGlyphModule } from "../src/lib/trainer/glyphs/pattern-glyph";

const output = fileURLToPath(
  new URL("../src/lib/trainer/glyphs/pattern-glyphs.ts", import.meta.url)
);

await Bun.write(output, renderPatternGlyphModule());

Bun.spawnSync(["bunx", "oxfmt", output], {
  stdio: ["ignore", "inherit", "inherit"],
});

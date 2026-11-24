import { expect, test } from "bun:test";

import { buildPatternGlyph } from "../../src/lib/trainer/glyphs/pattern-glyph";
import { patternGlyphs } from "../../src/lib/trainer/glyphs/pattern-glyphs";
import { pursuitPatterns } from "../../src/lib/trainer/settings/patterns";

test("the motion path glyphs match the paths the engine draws", () => {
  for (const { id } of pursuitPatterns) {
    expect(
      patternGlyphs[id],
      `${id} is stale. Run \`bun scripts/generate-pattern-glyphs.ts\`.`
    ).toBe(buildPatternGlyph(id));
  }
});

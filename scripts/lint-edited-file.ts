// Claude Code PostToolUse hook: fix and lint the file an agent just wrote.
// Problems left after the fix go to stderr with exit code 2, which Claude Code
// feeds back to the agent so it corrects them before moving on.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const root = fileURLToPath(new URL("..", import.meta.url));
const hookInput = z.object({
  tool_input: z.object({ file_path: z.string() }),
});

const { tool_input: toolInput } = hookInput.parse(await Bun.stdin.json());
const filePath = path.relative(root, path.resolve(toolInput.file_path));

if (filePath.startsWith("..") || path.isAbsolute(filePath)) {
  process.exit(0);
}

const commands = [
  ["bunx", "ultracite", "fix", "--no-error-on-unmatched-pattern", filePath],
];
if (filePath.endsWith(".astro")) {
  commands.push([
    "bunx",
    "prettier",
    "--write",
    "--plugin=prettier-plugin-astro",
    filePath,
  ]);
}

let failed = false;
for (const command of commands) {
  const result = Bun.spawnSync(command, { cwd: root });
  if (result.exitCode !== 0) {
    failed = true;
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
  }
}

if (failed) {
  process.exit(2);
}

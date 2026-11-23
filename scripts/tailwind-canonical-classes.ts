// Reports Tailwind classes that have a canonical spelling, like the editor's
// suggestCanonicalClasses diagnostic, and exits 1 when it finds any.
import { readdirSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import enhancedResolve from "enhanced-resolve";
import { __unstable__loadDesignSystem } from "tailwindcss";

const root = fileURLToPath(new URL("..", import.meta.url));

const resolveStylesheet = enhancedResolve.create.sync({
  conditionNames: ["style", "import", "default"],
  extensions: [".css"],
  mainFields: ["style", "main"],
});

const sourceExtensions = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".svelte",
  ".ts",
  ".tsx",
]);

interface Edit {
  file: string;
  line: number;
  from: string;
  to: string;
}

const packageStylesheet = (id: string) => {
  const stylesheet = resolveStylesheet(root, id);

  if (stylesheet === false) {
    throw new Error(`Cannot resolve stylesheet: ${id}`);
  }

  return stylesheet;
};

const designSystem = async () => {
  const css = path.resolve(root, "src/styles/global.css");

  return await __unstable__loadDesignSystem(readFileSync(css, "utf-8"), {
    base: path.dirname(css),
    from: css,
    async loadStylesheet(id: string, base: string) {
      const stylesheet =
        id.startsWith(".") || id.startsWith("/")
          ? path.resolve(base, id)
          : packageStylesheet(id);

      return {
        base: path.dirname(stylesheet),
        content: await readFile(stylesheet, "utf-8"),
        path: stylesheet,
      };
    },
  });
};

const strings = (text: string) => {
  const ranges: { start: number; value: string }[] = [];

  for (let i = 0; i < text.length; i += 1) {
    const quote = text[i];

    if (quote !== `"` && quote !== "'" && quote !== "`") {
      continue;
    }

    i += 1;
    const start = i;

    for (; i < text.length; i += 1) {
      if (text[i] === "\\") {
        i += 1;
      } else if (text[i] === quote) {
        ranges.push({ start, value: text.slice(start, i) });
        break;
      }
    }
  }

  return ranges;
};

const tokens = (value: string) => {
  const ranges: { start: number; value: string }[] = [];
  let start = -1;
  let depth = 0;
  let quote = "";

  for (let i = 0; i <= value.length; i += 1) {
    const char = value[i] ?? " ";

    if (quote) {
      if (char === "\\") {
        i += 1;
      } else if (char === quote) {
        quote = "";
      }

      continue;
    }

    if (char === `"` || char === "'") {
      quote = char;

      if (start < 0) {
        start = i;
      }

      continue;
    }

    if (char === "[" || char === "(") {
      depth += 1;

      if (start < 0) {
        start = i;
      }

      continue;
    }

    if ((char === "]" || char === ")") && depth > 0) {
      depth -= 1;
      continue;
    }

    if (/\s/u.test(char) && depth === 0) {
      if (start >= 0) {
        ranges.push({ start, value: value.slice(start, i) });
      }

      start = -1;
      continue;
    }

    if (start < 0) {
      start = i;
    }
  }

  return ranges;
};

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.resolve(dir, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    if (!entry.isFile()) {
      return [];
    }

    const extension = entry.name.slice(entry.name.lastIndexOf("."));

    return sourceExtensions.has(extension) ? [entryPath] : [];
  });

const system = await designSystem();
const sourceFiles = listSourceFiles(path.resolve(root, "src"));

const sources = sourceFiles.map((file) => {
  const text = readFileSync(file, "utf-8");

  const found = strings(text).flatMap((string) =>
    tokens(string.value)
      .filter(
        (token) =>
          !token.value.includes("${") && /[\w\][\]():!@*/.-]/u.test(token.value)
      )
      .map((token) => ({
        start: string.start + token.start,
        value: token.value,
      }))
  );

  return { file, text, tokens: found };
});

const seen = new Set<string>();

for (const source of sources) {
  for (const token of source.tokens) {
    seen.add(token.value);
  }
}

const canonical = new Map(
  [...seen].map((token) => [
    token,
    system.canonicalizeCandidates([token], { rem: 16 })[0],
  ])
);

const edits: Edit[] = [];

for (const source of sources) {
  for (const token of source.tokens) {
    const to = canonical.get(token.value);

    if (to !== undefined && to !== token.value) {
      edits.push({
        file: source.file,
        from: token.value,
        line: source.text.slice(0, token.start).split("\n").length,
        to,
      });
    }
  }
}

if (edits.length === 0) {
  process.stdout.write("No suggestCanonicalClasses diagnostics found.\n");
  process.exit(0);
}

for (const edit of edits) {
  const file = path.relative(root, edit.file).split(path.sep).join("/");
  process.stdout.write(`${file}:${edit.line} ${edit.from} -> ${edit.to}\n`);
}

process.exit(1);

import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { __unstable__loadDesignSystem } from "tailwindcss";

const root = resolve(import.meta.dir, "..");
const write = process.argv.includes("--write");
const require = createRequire(import.meta.url);

type Edit = {
  file: string;
  start: number;
  end: number;
  from: string;
  to: string;
};

type PackageJson = {
  exports?: Record<string, string | { style?: string }>;
  main?: string;
};

function packageStylesheet(id: string) {
  const parts = id.split("/");
  const name = id.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  const subpath = id.slice(name.length) || ".";
  const pkgPath = require.resolve(`${name}/package.json`, { paths: [root] });
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as PackageJson;
  const entry =
    pkg.exports?.[subpath === "" ? "." : `.${subpath}`] ?? pkg.exports?.["."];
  const style = entry && typeof entry === "object" ? entry.style : undefined;

  if (style) return resolve(dirname(pkgPath), style);
  if (pkg.main?.endsWith(".css")) return resolve(dirname(pkgPath), pkg.main);

  return require.resolve(id, { paths: [root] });
}

async function designSystem() {
  const css = resolve(root, "src/styles/global.css");

  return __unstable__loadDesignSystem(readFileSync(css, "utf8"), {
    base: dirname(css),
    from: css,
    async loadStylesheet(id: string, base: string) {
      const path =
        id.startsWith(".") || id.startsWith("/")
          ? resolve(base, id)
          : packageStylesheet(id);

      return {
        path,
        base: dirname(path),
        content: readFileSync(path, "utf8"),
      };
    },
  });
}

function strings(text: string) {
  const ranges: Array<{ start: number; value: string }> = [];

  for (let i = 0; i < text.length; i++) {
    const quote = text[i];
    if (quote !== `"` && quote !== "'" && quote !== "`") continue;

    const start = ++i;
    for (; i < text.length; i++) {
      if (text[i] === "\\") i++;
      else if (text[i] === quote) {
        ranges.push({ start, value: text.slice(start, i) });
        break;
      }
    }
  }

  return ranges;
}

function tokens(value: string) {
  const ranges: Array<{ start: number; end: number; value: string }> = [];
  let start = -1;
  let depth = 0;
  let quote = "";

  for (let i = 0; i <= value.length; i++) {
    const char = value[i] ?? " ";

    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
      continue;
    }

    if (char === `"` || char === "'") {
      quote = char;
      if (start < 0) start = i;
      continue;
    }

    if (char === "[" || char === "(") {
      depth++;
      if (start < 0) start = i;
      continue;
    }

    if ((char === "]" || char === ")") && depth > 0) {
      depth--;
      continue;
    }

    if (/\s/.test(char) && depth === 0) {
      if (start >= 0)
        ranges.push({ start, end: i, value: value.slice(start, i) });
      start = -1;
      continue;
    }

    if (start < 0) start = i;
  }

  return ranges;
}

const system = await designSystem();
const sourceFiles = await Array.fromAsync(
  new Bun.Glob("src/**/*.{astro,css,html,js,jsx,svelte,ts,tsx}").scan({
    absolute: true,
    cwd: root,
  }),
);
const sources = sourceFiles.map((file) => {
  const text = readFileSync(file, "utf8");
  const found = strings(text).flatMap((string) =>
    tokens(string.value)
      .filter(
        (token) =>
          !token.value.includes("${") && /[\w\][\]():!@*/.-]/.test(token.value),
      )
      .map((token) => ({
        start: string.start + token.start,
        end: string.start + token.end,
        value: token.value,
      })),
  );

  return { file, text, tokens: found };
});
const seen = new Set<string>();

for (const source of sources) {
  for (const token of source.tokens) seen.add(token.value);
}

const canonical = new Map(
  [...seen].map((token) => [
    token,
    system.canonicalizeCandidates([token], { rem: 16 })[0],
  ]),
);
const edits: Edit[] = [];

for (const source of sources) {
  for (const token of source.tokens) {
    const to = canonical.get(token.value);
    if (to && to !== token.value) {
      edits.push({
        file: source.file,
        start: token.start,
        end: token.end,
        from: token.value,
        to,
      });
    }
  }
}

if (edits.length === 0) {
  console.log("No suggestCanonicalClasses diagnostics found.");
  process.exit(0);
}

for (const edit of edits) {
  const file = relative(root, edit.file).split(sep).join("/");
  console.log(`${file} ${edit.from} -> ${edit.to}`);
}

if (!write) process.exit(1);

for (const file of new Set(edits.map((edit) => edit.file))) {
  const text = sources.find((source) => source.file === file)?.text ?? "";
  const next = edits
    .filter((edit) => edit.file === file)
    .sort((a, b) => b.start - a.start)
    .reduce(
      (current, edit) =>
        `${current.slice(0, edit.start)}${edit.to}${current.slice(edit.end)}`,
      text,
    );

  if (next !== text) writeFileSync(file, next);
}

console.log(`Applied ${edits.length} canonical class replacement(s).`);

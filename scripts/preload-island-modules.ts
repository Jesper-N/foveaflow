// Adds a `modulepreload` link for every script an island imports up front to
// each built page. Astro requests an island's component and renderer only when
// the page reaches the island, and the browser finds their imports only after
// they download, so without preloads the scripts arrive in two rounds.
// Dynamic imports, like translations, still load on demand. ui-sdk fetches its
// sheet presentation as soon as a touch screen mounts a popup, so pages that
// can import it preload it for coarse pointers only. Runs after `astro build`.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIST_DIR = "dist";

const ISLAND_SCRIPT_PATTERN =
  /\s(?:component|renderer)-url="(?<url>\/_astro\/[^"]+\.js)"/gu;

/**
 * Built chunks start with their static imports, like
 * `import{a as b}from"./c.js";`. The sticky flag stops at the first other
 * statement, so dynamic imports further down never match.
 */
const LEADING_IMPORT_PATTERN =
  /import\s*(?:[^"';]*from\s*)?"(?<specifier>\.\/[^"]+)";?/guy;

/** Vite puts its dynamic import map on the first line, before the imports. */
const VITE_DEPS_PREAMBLE = "const __vite__mapDeps=";

const TOUCH_ONLY_CHUNK_PATTERN = /^sheet-presentation\.[\w-]+\.js$/u;

const listHtmlFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(entry.parentPath, entry.name));

const importsByUrl = new Map<string, string[]>();

const readStaticImports = (url: string) => {
  let imports = importsByUrl.get(url);

  if (!imports) {
    const code = readFileSync(path.join(DIST_DIR, url), "utf-8");

    const body = code.startsWith(VITE_DEPS_PREAMBLE)
      ? code.slice(code.indexOf("\n") + 1)
      : code;

    imports = [...body.matchAll(LEADING_IMPORT_PATTERN)].map(({ groups }) =>
      path.posix.join(path.posix.dirname(url), groups?.["specifier"] ?? "")
    );
    importsByUrl.set(url, imports);
  }

  return imports;
};

/** Adds `urls` and everything they import up front to `modules`. */
const collectModules = (urls: string[], modules: Set<string>) => {
  for (const url of urls) {
    if (!modules.has(url)) {
      modules.add(url);
      collectModules(readStaticImports(url), modules);
    }
  }

  return modules;
};

const touchOnlyChunk = readdirSync(path.join(DIST_DIR, "_astro")).find((name) =>
  TOUCH_ONLY_CHUNK_PATTERN.test(name)
);

const importsTouchOnlyChunk = (url: string) =>
  touchOnlyChunk !== undefined &&
  readFileSync(path.join(DIST_DIR, url), "utf-8").includes(
    `./${touchOnlyChunk}`
  );

let pageCount = 0;

for (const file of listHtmlFiles(DIST_DIR)) {
  const html = readFileSync(file, "utf-8");

  const islandUrls = [...html.matchAll(ISLAND_SCRIPT_PATTERN)].map(
    ({ groups }) => groups?.["url"] ?? ""
  );

  if (islandUrls.length === 0) {
    continue;
  }

  const modules = collectModules(islandUrls, new Set());

  const links = [...modules]
    .map((url) => `<link rel="modulepreload" href="${url}">`)
    .join("");

  const touchLinks =
    touchOnlyChunk !== undefined && [...modules].some(importsTouchOnlyChunk)
      ? [...collectModules([`/_astro/${touchOnlyChunk}`], new Set())]
          .flatMap((url) =>
            modules.has(url)
              ? []
              : [
                  `<link rel="modulepreload" href="${url}" media="(pointer: coarse)">`,
                ]
          )
          .join("")
      : "";

  writeFileSync(file, html.replace("</head>", `${links}${touchLinks}</head>`));
  pageCount += 1;
}

process.stdout.write(`Added module preloads to ${pageCount} page(s).\n`);

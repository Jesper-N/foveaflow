// Adds a `modulepreload` link for every script an island imports up front to
// each built page. Astro requests an island's component and renderer only when
// the page reaches the island, and the browser finds their imports only after
// they download, so without preloads the scripts arrive in two rounds.
// Dynamic imports, like translations, still load on demand. Runs after
// `astro build`, before the CSP step.
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

const listHtmlFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(entry.parentPath, entry.name));

const importsByUrl = new Map<string, string[]>();

const readStaticImports = (url: string) => {
  let imports = importsByUrl.get(url);
  if (!imports) {
    const code = readFileSync(path.join(DIST_DIR, url), "utf-8");
    imports = [...code.matchAll(LEADING_IMPORT_PATTERN)].map(({ groups }) =>
      path.posix.join(path.posix.dirname(url), groups?.specifier ?? "")
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

let pageCount = 0;
for (const file of listHtmlFiles(DIST_DIR)) {
  const html = readFileSync(file, "utf-8");
  const islandUrls = [...html.matchAll(ISLAND_SCRIPT_PATTERN)].map(
    ({ groups }) => groups?.url ?? ""
  );
  if (islandUrls.length === 0) {
    continue;
  }

  const links = [...collectModules(islandUrls, new Set())]
    .map((url) => `<link rel="modulepreload" href="${url}">`)
    .join("");
  writeFileSync(file, html.replace("</head>", `${links}</head>`));
  pageCount += 1;
}
process.stdout.write(`Added module preloads to ${pageCount} page(s).\n`);

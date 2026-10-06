// Adds a hash for every inline script in the built pages to the `script-src`
// of the Content-Security-Policy in dist/_headers. The rest of the policy lives
// in public/_headers. Runs after `astro build`, so the strict policy only exists
// in production builds.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIST_DIR = "dist";
const HEADERS_PATH = path.join(DIST_DIR, "_headers");
/** The CSP header up to the end of its `script-src` directive. */
const SCRIPT_SRC_PATTERN =
  /Content-Security-Policy: (?:[^;\n]*; )*script-src [^;\n]*/u;
const INLINE_SCRIPT_PATTERN =
  /<script\b(?<attributes>[^>]*)>(?<content>[\s\S]*?)<\/script>/giu;
const JSON_LD_TYPE_PATTERN =
  /\stype\s*=\s*(?<quote>["'])application\/ld\+json\k<quote>/iu;

const listHtmlFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(entry.parentPath, entry.name));

// External scripts are covered by 'self', and JSON-LD is data the browser never runs.
const hashInlineScripts = (html: string) =>
  [...html.matchAll(INLINE_SCRIPT_PATTERN)]
    .filter(({ groups }) => {
      const attributes = groups?.attributes ?? "";
      return (
        !/\ssrc\s*=/iu.test(attributes) &&
        !JSON_LD_TYPE_PATTERN.test(attributes) &&
        Boolean(groups?.content?.trim())
      );
    })
    .map(({ groups }) => {
      const digest = createHash("sha256")
        .update(groups?.content ?? "")
        .digest("base64");
      return `'sha256-${digest}'`;
    });

const scriptHashes = [
  ...new Set(
    listHtmlFiles(DIST_DIR).flatMap((file) =>
      hashInlineScripts(readFileSync(file, "utf-8"))
    )
  ),
].toSorted();

const headers = readFileSync(HEADERS_PATH, "utf-8");
if (!SCRIPT_SRC_PATTERN.test(headers)) {
  throw new Error(`No CSP script-src directive found in ${HEADERS_PATH}`);
}
writeFileSync(
  HEADERS_PATH,
  headers.replace(SCRIPT_SRC_PATTERN, (directive) =>
    [directive, ...scriptHashes].join(" ")
  )
);
process.stdout.write(
  `Applied CSP with ${scriptHashes.length} script hash(es).\n`
);

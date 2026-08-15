import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const distDir = "dist";
const headersPath = path.join(distDir, "_headers");

const readHtmlFiles = (dir: string): string[] => {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
      files.push(...readHtmlFiles(entryPath));
    } else if (entryPath.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
};

const hashInlineBlocks = (html: string, tagName: "script" | "style") => {
  const hashes = new Set<string>();
  const pattern = new RegExp(
    `<${tagName}\\b(?<attributes>[^>]*)>(?<content>[\\s\\S]*?)<\\/${tagName}>`,
    "giu"
  );

  for (const match of html.matchAll(pattern)) {
    const attributes = match[1] ?? "";
    const content = match[2] ?? "";

    if (tagName === "script") {
      if (/\ssrc\s*=/iu.test(attributes)) {
        continue;
      }
      if (
        /\stype\s*=\s*(?<quote>["'])application\/ld\+json\k<quote>/iu.test(
          attributes
        )
      ) {
        continue;
      }
    }
    if (!content.trim()) {
      continue;
    }

    const digest = createHash("sha256").update(content).digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }

  return hashes;
};

const collectScriptHashes = () => {
  const scriptHashes = new Set<string>();

  for (const file of readHtmlFiles(distDir)) {
    const html = readFileSync(file, "utf-8");

    for (const hash of hashInlineBlocks(html, "script")) {
      scriptHashes.add(hash);
    }
  }

  return [...scriptHashes].toSorted();
};

const scriptHashes = collectScriptHashes();

const csp = [
  "default-src 'self'",
  `script-src 'self' https://static.cloudflareinsights.com ${scriptHashes.join(" ")}`.trim(),
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const headers = readFileSync(headersPath, "utf-8");
const cspHeaderPattern = /Content-Security-Policy: .*/u;
if (!cspHeaderPattern.test(headers)) {
  throw new Error(`No Content-Security-Policy header found in ${headersPath}`);
}

const updatedHeaders = headers.replace(
  cspHeaderPattern,
  `Content-Security-Policy: ${csp}`
);

if (headers !== updatedHeaders) {
  writeFileSync(headersPath, updatedHeaders);
}
console.log(`Applied CSP with ${scriptHashes.length} script hash(es).`);

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const headersPath = join(distDir, "_headers");

const readHtmlFiles = (dir: string): string[] => {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...readHtmlFiles(path));
    } else if (path.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
};

const hashInlineBlocks = (html: string, tagName: "script" | "style") => {
  const hashes = new Set<string>();
  const pattern = new RegExp(
    `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
    "gi",
  );

  for (const match of html.matchAll(pattern)) {
    const attributes = match[1] ?? "";
    const content = match[2] ?? "";

    if (tagName === "script" && /\ssrc\s*=/i.test(attributes)) continue;
    if (!content.trim()) continue;

    const digest = createHash("sha256").update(content).digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }

  return hashes;
};

const collectScriptHashes = () => {
  const scriptHashes = new Set<string>();

  for (const file of readHtmlFiles(distDir)) {
    const html = readFileSync(file, "utf8");

    for (const hash of hashInlineBlocks(html, "script")) {
      scriptHashes.add(hash);
    }
  }

  return [...scriptHashes].sort();
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

const headers = readFileSync(headersPath, "utf8");
const updatedHeaders = headers.replace(
  /Content-Security-Policy: .*/u,
  `Content-Security-Policy: ${csp}`,
);

if (headers === updatedHeaders) {
  throw new Error(`No Content-Security-Policy header found in ${headersPath}`);
}

writeFileSync(headersPath, updatedHeaders);
console.log(`Applied CSP with ${scriptHashes.length} script hash(es).`);

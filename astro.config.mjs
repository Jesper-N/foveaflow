// @ts-check
import { readFileSync } from "node:fs";

import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { inlineStyleHash } from "./src/lib/csp.ts";

// mode-watcher adds this sheet for a frame while the theme changes. Its text
// is not exported, so read it from the package to allow it by hash.
const modeWatcherSheet = /createTextNode\(`(?<css>[^`]*)`\)/u.exec(
  readFileSync(
    new URL(
      "node_modules/mode-watcher/dist/without-transition.js",
      import.meta.url
    ),
    "utf-8"
  )
)?.groups?.["css"];

if (modeWatcherSheet === undefined) {
  throw new Error(
    "mode-watcher's transition sheet moved; update astro.config.mjs"
  );
}

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "manifest-src 'self'",
        "worker-src 'none'",
        "upgrade-insecure-requests",
      ],
      scriptDirective: {
        resources: ["'self'", "https://static.cloudflareinsights.com"],
      },
      styleDirective: {
        hashes: [inlineStyleHash(modeWatcherSheet)],
        resources: [
          { kind: "element", resource: "'self'" },
          { kind: "attribute", resource: "'unsafe-inline'" },
        ],
      },
    },
  },
  site: process.env["SITE_URL"] ?? "https://foveaflow.com",
  vite: {
    plugins: [tailwindcss()],
  },
});

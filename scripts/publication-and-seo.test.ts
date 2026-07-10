import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { guideMetadata } from "../src/lib/content/page-copy";
import { referenceLinks } from "../src/lib/content/training";
import { supportPages } from "../src/lib/content/support-pages";
import { indexableTrainerRoutes } from "../src/lib/content/trainer-routes";
import {
  buildLlmsText,
  buildRobotsText,
  buildSitemapXml,
} from "../src/lib/publication-outputs";
import {
  buildGuideStructuredData,
  buildStructuredData,
  buildSupportPageStructuredData,
} from "../src/lib/seo";

const site = new URL("https://example.com/");

describe("publication outputs", () => {
  test("sitemap lists public URLs without unverifiable freshness hints", () => {
    const sitemap = buildSitemapXml(site);

    expect(sitemap).not.toContain("<lastmod>");
    expect(sitemap).not.toContain("<changefreq>");
    expect(sitemap).not.toContain("<priority>");
    expect(sitemap).toContain("<loc>https://example.com/</loc>");

    for (const route of indexableTrainerRoutes) {
      expect(sitemap).toContain(`<loc>https://example.com${route.path}</loc>`);
    }
  });

  test("robots uses one wildcard policy", () => {
    const robots = buildRobotsText(site);

    expect(robots.match(/^User-agent:/gmu)).toHaveLength(1);
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  test("llms summary stays concise while indexing public routes", () => {
    const summary = buildLlmsText(site);

    expect(summary).not.toContain("Common searches");
    expect(summary).toContain("> ");
    expect(summary).toContain("[App](https://example.com/)");
    expect(summary.match(/^## /gmu)).toHaveLength(3);
    expect(summary.length).toBeLessThan(8_000);
    for (const page of supportPages) {
      expect(summary).toContain(`https://example.com${page.path}`);
    }
    for (const route of indexableTrainerRoutes) {
      expect(summary).toContain(`https://example.com${route.path}`);
    }
  });

  test("Cloudflare serves the advertised OpenAPI media type", () => {
    const headers = readFileSync("public/_headers", "utf8");

    expect(headers).toContain(
      "/.well-known/openapi.json\n  Content-Type: application/vnd.oai.openapi+json; charset=utf-8",
    );
  });
});

describe("structured data scope", () => {
  test("home owns site-wide entity nodes", () => {
    const structuredData = buildStructuredData(site);
    const serialized = JSON.stringify(structuredData);

    expect(serialized).toContain('"@type":"Organization"');
    expect(serialized).toContain('"@type":"WebSite"');
    expect(serialized).toContain('"@type":"WebApplication"');
    expect(serialized).toContain(
      '"url":"https://example.com/metadata/android-chrome-192x192.png","width":192,"height":192',
    );
    expect(serialized).not.toContain("dateModified");
    expect(serialized).not.toContain('"keywords"');
    expect(serialized).not.toContain('"citation"');
  });

  test("guide emits only page-specific nodes", () => {
    const structuredData = buildGuideStructuredData(site);
    const serialized = JSON.stringify(structuredData);

    expect(serialized).toContain(`"name":"${guideMetadata.title}"`);
    expect(serialized).toContain('"@type":"WebPage"');
    expect(serialized).toContain('"@type":"BreadcrumbList"');
    expect(serialized).toContain('"@type":"ItemList"');
    expect(serialized).not.toContain('"@type":"Organization"');
    expect(serialized).not.toContain('"@type":"FAQPage"');
    expect(serialized).toContain(referenceLinks[0].url);
  });

  test("comparison markup cites only its visible source", () => {
    const page = supportPages.find((candidate) => "sourceLink" in candidate);
    if (!page) throw new Error("Expected a comparison page");

    const serialized = JSON.stringify(
      buildSupportPageStructuredData(page, site),
    );

    expect(serialized).toContain(page.sourceLink.href);
    for (const reference of referenceLinks) {
      expect(serialized).not.toContain(reference.url);
    }
  });
});

import { getSiteOrigin } from "$lib/seo/site-url";
import { sitemapXml } from "$lib/seo/sitemap";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(getSiteOrigin(site)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });

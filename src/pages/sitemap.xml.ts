import type { APIRoute } from "astro";
import { buildSitemapXml, getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildSitemapXml(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};

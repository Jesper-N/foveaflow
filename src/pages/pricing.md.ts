import type { APIRoute } from "astro";
import { buildPricingText, getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildPricingText(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};

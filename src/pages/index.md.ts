import type { APIRoute } from "astro";
import { buildLlmsText } from "../lib/publication-outputs";
import { getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildLlmsText(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};

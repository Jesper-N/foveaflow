import type { APIRoute } from "astro";
import { buildLlmsText, getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildLlmsText(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

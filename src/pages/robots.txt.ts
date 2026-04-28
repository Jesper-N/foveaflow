import type { APIRoute } from "astro";
import { buildRobotsText, getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildRobotsText(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

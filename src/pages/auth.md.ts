import type { APIRoute } from "astro";
import { buildAuthMarkdown } from "../lib/agent-discovery";
import { getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildAuthMarkdown(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};

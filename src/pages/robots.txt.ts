import { robotsText } from "$lib/seo/robots";
import { getSiteOrigin } from "$lib/seo/site-url";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(robotsText(getSiteOrigin(site)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

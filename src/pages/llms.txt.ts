import { llmsText } from "$lib/seo/llms";
import { getSiteOrigin } from "$lib/seo/site-url";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(llmsText(getSiteOrigin(site)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

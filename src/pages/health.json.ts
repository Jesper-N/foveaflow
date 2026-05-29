import type { APIRoute } from "astro";
import {
  buildHealthJson,
  stringifyDiscoveryJson,
} from "../lib/agent-discovery";
import { getSiteOrigin } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(
    stringifyDiscoveryJson(buildHealthJson(getSiteOrigin(context.site))),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
};

import type { APIRoute } from "astro";
import {
  buildOpenApiJson,
  stringifyDiscoveryJson,
} from "../../lib/agent-discovery";
import { getSiteOrigin } from "../../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(
    stringifyDiscoveryJson(buildOpenApiJson(getSiteOrigin(context.site))),
    {
      headers: {
        "Content-Type": "application/vnd.oai.openapi+json; charset=utf-8",
      },
    },
  );
};

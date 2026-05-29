import type { APIRoute } from "astro";
import {
  buildApiCatalogJson,
  stringifyDiscoveryJson,
} from "../../lib/agent-discovery";
import { getSiteOrigin } from "../../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(
    stringifyDiscoveryJson(buildApiCatalogJson(getSiteOrigin(context.site))),
    {
      headers: {
        "Content-Type": "application/linkset+json; charset=utf-8",
      },
    },
  );
};

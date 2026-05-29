import type { APIRoute } from "astro";
import { buildAgentSkillMarkdown } from "../../../../lib/agent-discovery";
import { getSiteOrigin } from "../../../../lib/seo";

export const prerender = true;

export const GET: APIRoute = (context) => {
  return new Response(buildAgentSkillMarkdown(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};

import type { APIRoute, GetStaticPaths } from "astro";

import { buildAgentSkillMarkdown } from "../../../../lib/agent-discovery";
import { getSiteOrigin } from "../../../../lib/seo";

export const getStaticPaths = (() => [
  { params: { skillfile: "SKILL.md" } },
]) satisfies GetStaticPaths;

export const prerender = true;

export const GET: APIRoute = (context) =>
  new Response(buildAgentSkillMarkdown(getSiteOrigin(context.site)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });

import { agentSkillMarkdown } from "$lib/seo/agent-skills";
import { getSiteOrigin } from "$lib/seo/site-url";
import type { APIRoute, GetStaticPaths } from "astro";

// A dynamic segment because file names must be kebab-case, and the agent
// skills spec needs `SKILL.md`.
export const getStaticPaths = (() => [
  { params: { skillfile: "SKILL.md" } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = ({ site }) =>
  new Response(agentSkillMarkdown(getSiteOrigin(site)), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });

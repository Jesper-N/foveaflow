import { agentSkillsIndexJson } from "$lib/seo/agent-skills";
import { getSiteOrigin } from "$lib/seo/site-url";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(agentSkillsIndexJson(getSiteOrigin(site)), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

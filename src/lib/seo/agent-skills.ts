import { createHash } from "node:crypto";

import { absoluteUrl } from "./site-url";

const agentSkillName = "foveaflow";
const agentSkillDescription =
  "Use when helping users choose a FoveaFlow drill, understand its controls, or find its guide and safety notes.";

/** Agent skill file published under `/.well-known/agent-skills/`. */
export const agentSkillMarkdown = (site: URL) =>
  [
    "---",
    `name: ${agentSkillName}`,
    `description: ${JSON.stringify(agentSkillDescription)}`,
    "---",
    "",
    "# FoveaFlow Agent Skill",
    "",
    "Use this skill when a user needs help choosing a FoveaFlow drill, setting its controls, or finding the app's safety notes.",
    "",
    "## Capabilities",
    "",
    "- Explain that FoveaFlow is practice software, not medical advice, diagnosis, treatment, vision therapy, or a medical device.",
    "- Direct users to the app homepage for the interactive trainer.",
    "- Use the guide for mode explanations, safety guidance, and drill selection.",
    "- Use llms.txt for a compact machine-readable route and content summary.",
    "",
    "## Public Resources",
    "",
    `- App: ${absoluteUrl("/", site)}`,
    `- Guide: ${absoluteUrl("/guide/", site)}`,
    `- Agent summary: ${absoluteUrl("/llms.txt", site)}`,
    `- Sitemap: ${absoluteUrl("/sitemap.xml", site)}`,
    "",
  ].join("\n");

/** Discovery index that lists the skill with a digest of its contents. */
export const agentSkillsIndexJson = (site: URL) => {
  const skillMarkdown = agentSkillMarkdown(site);
  const digest = createHash("sha256").update(skillMarkdown).digest("hex");

  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        description: agentSkillDescription,
        digest: `sha256:${digest}`,
        name: agentSkillName,
        type: "skill-md",
        url: absoluteUrl("/.well-known/agent-skills/foveaflow/SKILL.md", site),
      },
    ],
  };
  return JSON.stringify(index, null, 2);
};

import { createHash } from "node:crypto";

import { absoluteUrl } from "./seo";

const agentSkillName = "foveaflow";
const agentSkillDescription =
  "Use when helping users choose a FoveaFlow drill, understand its controls, or find its guide and safety notes.";

export const buildAgentSkillMarkdown = (site: URL) =>
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

export const buildAgentSkillsIndexJson = (site: URL) => {
  const skillMarkdown = buildAgentSkillMarkdown(site);
  const digest = createHash("sha256").update(skillMarkdown).digest("hex");

  return {
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
};

export const stringifyAgentSkillsIndex = (
  value: ReturnType<typeof buildAgentSkillsIndexJson>
) => JSON.stringify(value, null, 2);

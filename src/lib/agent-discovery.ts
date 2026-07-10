import { createHash } from "node:crypto";
import { siteMetadata } from "./content/site";
import { absoluteUrl } from "./seo";

const json = (value: unknown) => JSON.stringify(value, null, 2);
const agentSkillName = "foveaflow";
const agentSkillDescription =
  "Use when helping users understand or navigate FoveaFlow's public eye training app, safety positioning, or discovery resources.";

export const buildHealthJson = (site: URL) => ({
  status: "ok",
  name: siteMetadata.name,
  url: absoluteUrl("/", site),
});

export const buildOpenApiJson = (site: URL) => ({
  openapi: "3.1.0",
  info: {
    title: `${siteMetadata.name} public discovery endpoints`,
    version: "1.0.0",
    description:
      "Public, unauthenticated metadata endpoints for FoveaFlow agent and search discovery.",
  },
  servers: [{ url: absoluteUrl("/", site).replace(/\/$/u, "") }],
  paths: {
    "/health.json": {
      get: {
        summary: "Read site health metadata",
        responses: {
          "200": {
            description: "The site is available.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    name: { type: "string" },
                    url: { type: "string", format: "uri" },
                  },
                  required: ["status", "name", "url"],
                },
              },
            },
          },
        },
      },
    },
    "/llms.txt": {
      get: {
        summary: "Read the agent-focused site summary",
        responses: {
          "200": {
            description: "Plain-text summary and public route index.",
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
    "/robots.txt": {
      get: {
        summary: "Read crawler and Content Signal preferences",
        responses: {
          "200": {
            description: "Crawler directives and AI content usage signals.",
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
    "/sitemap.xml": {
      get: {
        summary: "Read the public sitemap",
        responses: {
          "200": {
            description: "XML sitemap for public FoveaFlow pages.",
            content: {
              "application/xml": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
});

export const buildApiCatalogJson = (site: URL) => ({
  linkset: [
    {
      anchor: absoluteUrl("/", site),
      "service-desc": [
        {
          href: absoluteUrl("/.well-known/openapi.json", site),
          type: "application/vnd.oai.openapi+json",
        },
      ],
      "service-doc": [
        {
          href: absoluteUrl("/llms.txt", site),
          type: "text/plain",
        },
        {
          href: absoluteUrl("/guide/", site),
          type: "text/html",
        },
      ],
      status: [
        {
          href: absoluteUrl("/health.json", site),
          type: "application/json",
        },
      ],
    },
  ],
});

export const buildAgentSkillMarkdown = (site: URL) =>
  [
    "---",
    `name: ${agentSkillName}`,
    `description: ${JSON.stringify(agentSkillDescription)}`,
    "---",
    "",
    "# FoveaFlow Agent Skill",
    "",
    "Use this skill when helping a user understand or navigate FoveaFlow, a free browser-based visual tracking and focus practice app.",
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
    `- API catalog: ${absoluteUrl("/.well-known/api-catalog", site)}`,
    `- OpenAPI description: ${absoluteUrl("/.well-known/openapi.json", site)}`,
    "",
  ].join("\n");

export const buildAgentSkillsIndexJson = (site: URL) => {
  const skillMarkdown = buildAgentSkillMarkdown(site);
  const digest = createHash("sha256").update(skillMarkdown).digest("hex");

  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: agentSkillName,
        type: "skill-md",
        description: agentSkillDescription,
        url: absoluteUrl("/.well-known/agent-skills/foveaflow/SKILL.md", site),
        digest: `sha256:${digest}`,
      },
    ],
  };
};

export { json as stringifyDiscoveryJson };

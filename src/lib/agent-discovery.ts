import { createHash } from "node:crypto";

import { siteMetadata } from "./content/site";
import { absoluteUrl } from "./seo";

const agentSkillName = "foveaflow";
const agentSkillDescription =
  "Use when helping users understand or navigate FoveaFlow's public eye training app, safety positioning, or discovery resources.";

export const buildHealthJson = (site: URL) => ({
  name: siteMetadata.name,
  status: "ok",
  url: absoluteUrl("/", site),
});

export const buildOpenApiJson = (site: URL) => ({
  info: {
    description:
      "Public, unauthenticated metadata endpoints for FoveaFlow agent and search discovery.",
    title: `${siteMetadata.name} public discovery endpoints`,
    version: "1.0.0",
  },
  openapi: "3.1.0",
  paths: {
    "/health.json": {
      get: {
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    name: { type: "string" },
                    status: { type: "string" },
                    url: { format: "uri", type: "string" },
                  },
                  required: ["status", "name", "url"],
                  type: "object",
                },
              },
            },
            description: "The site is available.",
          },
        },
        summary: "Read site health metadata",
      },
    },
    "/llms.txt": {
      get: {
        responses: {
          "200": {
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
            description: "Plain-text summary and public route index.",
          },
        },
        summary: "Read the agent-focused site summary",
      },
    },
    "/robots.txt": {
      get: {
        responses: {
          "200": {
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
            description: "Crawler directives and AI content usage signals.",
          },
        },
        summary: "Read crawler and Content Signal preferences",
      },
    },
    "/sitemap.xml": {
      get: {
        responses: {
          "200": {
            content: {
              "application/xml": {
                schema: { type: "string" },
              },
            },
            description: "XML sitemap for public FoveaFlow pages.",
          },
        },
        summary: "Read the public sitemap",
      },
    },
  },
  servers: [{ url: absoluteUrl("/", site).replace(/\/$/u, "") }],
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
        description: agentSkillDescription,
        digest: `sha256:${digest}`,
        name: agentSkillName,
        type: "skill-md",
        url: absoluteUrl("/.well-known/agent-skills/foveaflow/SKILL.md", site),
      },
    ],
  };
};

type DiscoveryJson =
  | ReturnType<typeof buildAgentSkillsIndexJson>
  | ReturnType<typeof buildApiCatalogJson>
  | ReturnType<typeof buildHealthJson>
  | ReturnType<typeof buildOpenApiJson>;

export const stringifyDiscoveryJson = (value: DiscoveryJson) =>
  JSON.stringify(value, null, 2);

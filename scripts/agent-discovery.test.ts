import { createHash } from "node:crypto";

import { describe, expect, test } from "bun:test";

import {
  buildAgentSkillMarkdown,
  buildAgentSkillsIndexJson,
} from "../src/lib/agent-discovery";

const site = new URL("https://example.com/");
const descriptionPrefix = "description: ";

describe("agent skill discovery", () => {
  test("emits the required YAML frontmatter", () => {
    const markdown = buildAgentSkillMarkdown(site);
    const lines = markdown.split("\n");
    const descriptionLine = lines[2];

    expect(lines.slice(0, 2)).toEqual(["---", "name: foveaflow"]);
    expect(lines[3]).toBe("---");
    expect(lines[4]).toBe("");
    expect(lines[5]).toBe("# FoveaFlow Agent Skill");

    if (!descriptionLine?.startsWith(descriptionPrefix)) {
      throw new Error("Expected the skill description in YAML frontmatter");
    }

    const description: unknown = JSON.parse(
      descriptionLine.slice(descriptionPrefix.length),
    );
    expect(description).toBe(
      buildAgentSkillsIndexJson(site).skills[0].description,
    );
  });

  test("indexes the digest of the exact generated skill", () => {
    const markdown = buildAgentSkillMarkdown(site);
    const digest = createHash("sha256").update(markdown).digest("hex");
    const [skill] = buildAgentSkillsIndexJson(site).skills;

    if (!skill) {
      throw new Error("Expected the generated skill in the discovery index");
    }

    expect(skill.name).toBe("foveaflow");
    expect(skill.url).toBe(
      "https://example.com/.well-known/agent-skills/foveaflow/SKILL.md",
    );
    expect(skill.digest).toBe(`sha256:${digest}`);
  });
});

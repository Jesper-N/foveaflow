import { Glob } from "bun";
import { compile } from "svelte/compiler";
import ts from "typescript";
import { z } from "zod";

import { legalPages } from "../src/lib/content/legal";
import type { LegalPageContent } from "../src/lib/content/legal";
import {
  guideFaqItems,
  homepageSeoContent,
} from "../src/lib/content/page-copy";
import type { PageSeoContent } from "../src/lib/content/page-copy";
import { supportPages } from "../src/lib/content/support-pages";
import type { SupportPage } from "../src/lib/content/support-pages";
import { trainerRoutes } from "../src/lib/content/trainer-routes";
import {
  audienceNotes,
  referenceLinks,
  safetyNote,
  trainingModeGuides,
} from "../src/lib/content/training";
import { en } from "../src/lib/i18n/dictionaries/en";

const messages = new Set<string>([
  safetyNote,
  ...guideFaqItems.flatMap(({ question, answer }) => [question, answer]),
  ...audienceNotes.flatMap(({ title, body }) => [title, body]),
  ...referenceLinks.map(({ label }) => label),
  ...trainingModeGuides.flatMap(({ title, summary, benefits, steps }) => [
    title,
    summary,
    benefits,
    ...steps,
  ]),
]);

const collectSeoContent = (content: PageSeoContent) => {
  for (const message of [
    content.kicker,
    content.heading,
    content.hero,
    ...content.body,
    content.primaryCta.label,
    content.trustNote,
    ...content.faq.flatMap(({ question, answer }) => [question, answer]),
  ]) {
    messages.add(message);
  }
  if (content.secondaryCta) {
    messages.add(content.secondaryCta.label);
  }
};
collectSeoContent(homepageSeoContent);
for (const route of trainerRoutes) {
  messages.add(route.label);
  collectSeoContent(route.seoContent);
}
const policies: LegalPageContent[] = Object.values(legalPages);
for (const page of policies) {
  for (const message of [
    page.label,
    page.title,
    page.description,
    page.summary,
    ...page.sections.flatMap((section) => [
      section.heading,
      ...section.body,
      ...("links" in section ? section.links.map(({ label }) => label) : []),
    ]),
  ]) {
    messages.add(message);
  }
}
const articles: readonly SupportPage[] = supportPages;
for (const page of articles) {
  for (const message of [
    page.title,
    page.description,
    page.kicker,
    page.heading,
    page.summary,
    page.primaryCta.label,
    ...page.sections.flatMap(({ heading, body, list, orderedList }) => [
      heading,
      ...(body ?? []),
      ...(list ?? []),
      ...(orderedList ?? []),
    ]),
    ...(page.comparisonRows?.flatMap(({ feature, foveaflow, alternative }) => [
      feature,
      foveaflow,
      alternative,
    ]) ?? []),
  ]) {
    messages.add(message);
  }
  if (page.secondaryCta) {
    messages.add(page.secondaryCta.label);
  }
  if (page.comparisonLabel) {
    messages.add(page.comparisonLabel);
  }
  if (page.sourceLink) {
    messages.add(page.sourceLink.label);
  }
}

const visit = (node: ts.Node) => {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "t"
  ) {
    const [, message] = node.arguments;
    if (message && ts.isStringLiteral(message)) {
      messages.add(message.text);
    }
  }
  if (
    ts.isPropertyAssignment(node) &&
    ts.isIdentifier(node.name) &&
    ["label", "title"].includes(node.name.text) &&
    ts.isStringLiteral(node.initializer)
  ) {
    messages.add(node.initializer.text);
  }
  ts.forEachChild(node, visit);
};
const files = [...new Glob("src/**/*.svelte").scanSync(".")];
const sources = await Promise.all(
  files.map(async (file) => ({ file, source: await Bun.file(file).text() }))
);
for (const { file, source } of sources) {
  const { js } = compile(source, { filename: file, generate: "server" });
  visit(ts.createSourceFile(file, js.code, ts.ScriptTarget.Latest, true));
}

const errors = [...messages]
  .filter((message) => !Object.hasOwn(en, message))
  .map((message) => `Unregistered message: ${message}`);
const dictionaryModule = z.record(z.string(), z.record(z.string(), z.string()));
const dictionaryFiles = [
  ...new Glob("src/lib/i18n/dictionaries/*.ts").scanSync("."),
];
const dictionaries = await Promise.all(
  dictionaryFiles.map(async (file) => ({
    file,
    module: dictionaryModule.parse(await import(`../${file}`)),
  }))
);
for (const { file, module } of dictionaries) {
  const [dictionary] = Object.values(module);
  if (!dictionary) {
    throw new Error(`No dictionary exported by ${file}`);
  }
  for (const message of Object.keys(en)) {
    if (!dictionary[message]?.trim()) {
      errors.push(`${file}: missing ${message}`);
    }
  }
}
if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}
console.log(
  `Translation coverage passed: ${messages.size} source messages, ${Object.keys(en).length} dictionary entries per locale.`
);

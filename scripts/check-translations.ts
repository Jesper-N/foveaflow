import { Glob } from "bun";
import { compile } from "svelte/compiler";
import ts from "typescript";
import { z } from "zod";

import { articles } from "../src/lib/content/articles";
import type { Article } from "../src/lib/content/articles";
import { drillGuides } from "../src/lib/content/drill-guides";
import { drillRoutes } from "../src/lib/content/drill-routes";
import { audiences, guideFaq, referenceLinks } from "../src/lib/content/guide";
import { homeCopy } from "../src/lib/content/home";
import { legalPages } from "../src/lib/content/legal";
import type { LegalPage } from "../src/lib/content/legal";
import { freeUseNote, safetyNote } from "../src/lib/content/site";
import type { PageCopy } from "../src/lib/content/types";
import { en } from "../src/lib/i18n/dictionaries/en";
import { behaviors } from "../src/lib/trainer/settings/behaviors";
import { drills } from "../src/lib/trainer/settings/drills";
import {
  letterWeights,
  lilacChaserColors,
  targetForms,
} from "../src/lib/trainer/settings/options";
import { pursuitPatterns } from "../src/lib/trainer/settings/patterns";

// Every English message the UI can show must have a dictionary entry.
const messages = new Set<string>([
  freeUseNote,
  safetyNote,
  ...guideFaq.flatMap(({ question, answer }) => [question, answer]),
  ...audiences.flatMap(({ title, body }) => [title, body]),
  ...referenceLinks.map(({ label }) => label),
  ...drillGuides.flatMap(({ title, summary, benefits, steps }) => [
    title,
    summary,
    benefits,
    ...steps,
  ]),
  // Option names shown in the controls.
  ...[
    ...drills,
    ...pursuitPatterns,
    ...behaviors,
    ...targetForms,
    ...letterWeights,
    ...lilacChaserColors,
  ].map(({ name }) => name),
]);

const addPageCopy = (copy: PageCopy) => {
  for (const message of [copy.heading, copy.hero, ...copy.body]) {
    messages.add(message);
  }
};
addPageCopy(homeCopy);
for (const route of drillRoutes) {
  messages.add(route.label);
  addPageCopy(route.copy);
  for (const { question, answer } of route.copy.faq) {
    messages.add(question);
    messages.add(answer);
  }
}

const legal: LegalPage[] = Object.values(legalPages);
for (const page of legal) {
  for (const message of [
    page.label,
    page.title,
    page.description,
    page.summary,
    ...page.sections.flatMap((section) => [
      section.heading,
      ...section.body,
      ...(section.links ?? []).map(({ label }) => label),
    ]),
  ]) {
    messages.add(message);
  }
}

const articleList: readonly Article[] = articles;
for (const article of articleList) {
  for (const message of [
    article.title,
    article.description,
    article.kicker,
    article.heading,
    article.summary,
    article.primaryCta.label,
    ...article.sections.flatMap(({ heading, body, list, orderedList }) => [
      heading,
      ...(body ?? []),
      ...(list ?? []),
      ...(orderedList ?? []),
    ]),
  ]) {
    messages.add(message);
  }
  if (article.secondaryCta) {
    messages.add(article.secondaryCta.label);
  }
  if (article.comparison) {
    messages.add(article.comparison.alternative);
    messages.add(article.comparison.source.label);
    for (const { feature, foveaflow, alternative } of article.comparison.rows) {
      messages.add(feature);
      messages.add(foveaflow);
      messages.add(alternative);
    }
  }
}

// Literal text passed to `t()`, or set as a `label`, `title`, or
// `description` in components and their helper modules.
const visit = (node: ts.Node) => {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "t"
  ) {
    const [message] = node.arguments;
    if (message && ts.isStringLiteral(message)) {
      messages.add(message.text);
    }
  }
  if (
    ts.isPropertyAssignment(node) &&
    ts.isIdentifier(node.name) &&
    ["description", "label", "title"].includes(node.name.text) &&
    ts.isStringLiteral(node.initializer)
  ) {
    messages.add(node.initializer.text);
  }
  ts.forEachChild(node, visit);
};
const files = [
  ...new Glob("src/**/*.svelte").scanSync("."),
  ...new Glob("src/lib/components/**/*.ts").scanSync("."),
];
const sources = await Promise.all(
  files.map(async (file) => ({ file, source: await Bun.file(file).text() }))
);
for (const { file, source } of sources) {
  const code = file.endsWith(".svelte")
    ? compile(source, { filename: file, generate: "server" }).js.code
    : source;
  visit(ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true));
}

const errors = [
  ...[...messages]
    .filter((message) => !Object.hasOwn(en, message))
    .map((message) => `Unregistered message: ${message}`),
  ...Object.keys(en)
    .filter((message) => !messages.has(message))
    .map((message) => `Unused message: ${message}`),
];
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

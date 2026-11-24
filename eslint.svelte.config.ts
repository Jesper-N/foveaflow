import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import core from "ultracite/oxlint/core";

const svelteRules = Object.fromEntries(
  Object.entries(svelte.rules)
    .filter(([, rule]) => rule.meta?.deprecated !== true)
    .map(([name]) => [`svelte/${name}`, "error"])
);

const svelteFormattingRules = Object.fromEntries(
  svelte.configs["flat/prettier"].flatMap((entry) =>
    Object.entries(entry.rules ?? {})
  )
);

const typeAwareRules = Object.fromEntries(
  Object.entries(core.rules ?? {}).flatMap(([name, setting]) => {
    const ruleName = name.replace(/^typescript\//u, "");
    const rule = typescriptPlugin.rules[ruleName];

    return name.startsWith("typescript/") &&
      rule?.meta.docs.requiresTypeChecking === true
      ? [[`@typescript-eslint/${ruleName}`, setting]]
      : [];
  })
);

export default defineConfig(
  {
    ignores: ["**/*", "!src/", "!src/**/", "!src/**/*.svelte"],
  },
  ...svelte.configs["flat/base"],
  {
    files: ["src/**/*.svelte"],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".svelte"],
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...svelteRules,
      ...svelteFormattingRules,
      ...typeAwareRules,
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "svelte/block-lang": ["error", { script: "ts", style: null }],
      "svelte/max-lines-per-block": "off",
      "svelte/no-restricted-html-elements": "off",
      "svelte/no-unused-class-name": "off",
    },
  }
);

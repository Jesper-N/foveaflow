import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import astro from "ultracite/oxlint/astro";
import core from "ultracite/oxlint/core";
import svelte from "ultracite/oxlint/svelte";

export default defineConfig({
  extends: [core, astro, svelte, antiSlop],
  ignorePatterns: [...core.ignorePatterns, "src/lib/components/ui/**"],
  rules: {
    "anti-slop/no-runtime-typeof": "error",
    complexity: ["error", { max: 80 }],
    "no-control-regex": "off",
  },
});

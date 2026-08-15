import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [...ultracite.ignorePatterns, "src/lib/components/ui/**"],
  svelte: true,
});

// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL ?? "https://foveaflow.com";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()],
  },
});

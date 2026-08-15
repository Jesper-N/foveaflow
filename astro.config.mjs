import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://foveaflow.com";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  site,
  vite: {
    plugins: [tailwindcss()],
  },
});

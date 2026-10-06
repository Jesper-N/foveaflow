// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  site: process.env.SITE_URL ?? "https://foveaflow.com",
  vite: {
    plugins: [tailwindcss()],
  },
});

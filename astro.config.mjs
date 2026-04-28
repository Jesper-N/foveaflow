// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

/** @returns {import("vite").Plugin} */
function devWatcherListenerLimit() {
  return {
    name: "eye-trainer:dev-watcher-listener-limit",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      const currentLimit = server.watcher.getMaxListeners();

      if (currentLimit !== 0 && currentLimit < 30) {
        // Astro, Svelte, and Tailwind share Vite's dev watcher.
        server.watcher.setMaxListeners(30);
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],

  vite: {
    plugins: [devWatcherListenerLimit(), tailwindcss()],
  },
});

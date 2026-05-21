import { defineConfig, devices } from "@playwright/test";

const getSmokePort = () => {
  const port = Number(process.env.SMOKE_PORT ?? 4323);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("SMOKE_PORT must be an integer between 1 and 65535.");
  }

  return port;
};

const smokePort = getSmokePort();
const smokeBaseUrl = `http://127.0.0.1:${smokePort}`;

export default defineConfig({
  testDir: "./tests/smoke",
  testMatch: "**/*.playwright.ts",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: smokeBaseUrl,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `bun run build && bun run astro preview --host 127.0.0.1 --port ${smokePort}`,
    url: smokeBaseUrl,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

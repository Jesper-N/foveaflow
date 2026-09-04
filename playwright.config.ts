import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.TEST_PORT ?? 4323);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("TEST_PORT must be an integer between 1 and 65535.");
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  forbidOnly: true,
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  testDir: "./tests",
  testMatch: "**/*.playwright.ts",
  timeout: 30_000,
  use: {
    baseURL,
    contextOptions: { reducedMotion: "no-preference" },
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `bunx wrangler dev --ip 127.0.0.1 --port ${port} --log-level error`,
    reuseExistingServer: false,
    timeout: 30_000,
    url: baseURL,
  },
});

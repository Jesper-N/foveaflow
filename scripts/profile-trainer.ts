import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "@playwright/test";

const [baseUrl = "http://127.0.0.1:4323", route = "/smooth-pursuit/"] =
  process.argv.slice(2);

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    locale: "en-US",
    reducedMotion: "no-preference",
    viewport: { height: 1080, width: 1920 },
  });
  const page = await context.newPage();
  await page.coverage.startJSCoverage();
  await page.goto(new URL(route, baseUrl).href);
  await page
    .getByRole("button", { exact: true, name: "Pause motion" })
    .waitFor();
  const coverage = await page.coverage.stopJSCoverage();
  const scripts = coverage
    .filter(({ url }) => url.includes("/_astro/"))
    .map(({ url, source }) => ({
      bytes: source === undefined ? null : Buffer.byteLength(source),
      name: new URL(url).pathname.split("/").at(-1),
    }));

  const session = await context.newCDPSession(page);
  await session.send("Performance.enable");
  await session.send("Profiler.enable");
  await session.send("Profiler.start");
  const before = await session.send("Performance.getMetrics");
  await delay(2000);
  const after = await session.send("Performance.getMetrics");
  const { profile } = await session.send("Profiler.stop");
  const sampleCounts = new Map<number, number>();
  for (const id of profile.samples ?? []) {
    sampleCounts.set(id, (sampleCounts.get(id) ?? 0) + 1);
  }
  const hotFunctions = profile.nodes
    .map(({ id, callFrame }) => ({
      name: callFrame.functionName,
      samples: sampleCounts.get(id) ?? 0,
      script: callFrame.url.split("/").at(-1),
    }))
    .filter(({ samples, script }) => samples > 0 && script)
    .toSorted((a, b) => b.samples - a.samples)
    .slice(0, 8);
  const metrics = Object.fromEntries(
    after.metrics
      .filter(({ name }) =>
        [
          "TaskDuration",
          "ScriptDuration",
          "LayoutDuration",
          "RecalcStyleDuration",
        ].includes(name)
      )
      .map(({ name, value }) => [
        name,
        value -
          (before.metrics.find((metric) => metric.name === name)?.value ?? 0),
      ])
  );
  process.stdout.write(
    `${JSON.stringify({ hotFunctions, metrics, route, scripts })}\n`
  );
  await context.close();
} finally {
  await browser.close();
}

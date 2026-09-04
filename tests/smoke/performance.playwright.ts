import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    canvasMetrics: {
      arcs: number;
      callbacks: number;
      outsideFrame: number;
      duplicateDraws: number;
      lastDrawTimestamp: number;
      targetX: number;
    };
  }
}

test.beforeEach(async ({ page, context, baseURL }) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required.");
  }
  await context.addCookies([
    { name: "PARAGLIDE_LOCALE", url: baseURL, value: "en" },
  ]);
  await page.addInitScript(() => {
    window.canvasMetrics = {
      arcs: 0,
      callbacks: 0,
      duplicateDraws: 0,
      lastDrawTimestamp: -1,
      outsideFrame: 0,
      targetX: 0,
    };
    let timestamp = -1;
    const requestFrame = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (onFrame) =>
      requestFrame((time) => {
        window.canvasMetrics.callbacks += 1;
        timestamp = time;
        try {
          return onFrame(time);
        } finally {
          timestamp = -1;
        }
      });
    const drawArc = CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.arc = function arc(...args) {
      const metrics = window.canvasMetrics;
      metrics.arcs += 1;
      [metrics.targetX] = args;
      if (timestamp === -1) {
        metrics.outsideFrame += 1;
      } else if (timestamp === metrics.lastDrawTimestamp) {
        metrics.duplicateDraws += 1;
      }
      metrics.lastDrawTimestamp = timestamp;
      return drawArc.apply(this, args);
    };
  });
});

test("settings and theme redraws stay within one draw per display frame", async ({
  page,
}) => {
  await page.goto("/smooth-pursuit/");
  await expect(
    page.getByRole("button", { exact: true, name: "Pause motion" })
  ).toBeVisible();
  await page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    let index = 0;
    const interval = window.setInterval(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: index % 2 === 0 ? "ArrowUp" : "ArrowDown",
        })
      );
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
      index += 1;
      if (index === 20) {
        window.clearInterval(interval);
        resolve();
      }
    }, 8);
    return promise;
  });
  const metrics = await page.evaluate(() => window.canvasMetrics);
  expect(metrics.arcs).toBeGreaterThan(0);
  expect(metrics.outsideFrame).toBe(0);
  expect(metrics.duplicateDraws).toBe(0);
});

test("paused rendering stays idle and redraws changed settings", async ({
  page,
}) => {
  await page.goto("/smooth-pursuit/");
  await page.getByRole("button", { exact: true, name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Resume motion" })
  ).toBeVisible();
  const canvas = page.locator("canvas");
  await page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    return promise;
  });
  const pausedImage = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL()
  );
  const before = await page.evaluate(() => window.canvasMetrics.arcs);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.canvasMetrics.arcs)).toBe(before);
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))
  );
  await expect
    .poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()))
    .not.toBe(pausedImage);
  await page
    .getByRole("button", { exact: true, name: "Resume motion" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.canvasMetrics.arcs))
    .toBeGreaterThan(before + 1);
});

test("reaction jumps keep unchanged frames on the canvas", async ({ page }) => {
  await page.goto("/reaction-jumps/");
  await expect(
    page.getByRole("button", { exact: true, name: "Pause motion" })
  ).toBeVisible();
  const before = await page.evaluate(() => ({ ...window.canvasMetrics }));
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => window.canvasMetrics);
  expect(after.arcs - before.arcs).toBeGreaterThan(0);
  expect(after.arcs - before.arcs).toBeLessThan(
    (after.callbacks - before.callbacks) / 2
  );
});

test("resuming motion excludes paused time from the first movement", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "foveaflow.settings.v2",
      JSON.stringify({
        patternId: "horizontalSweep",
        presetId: "pursuit",
        speed: { unit: "screen/s", value: 0.5 },
      })
    );
  });
  await page.goto("/");
  await page.getByRole("button", { exact: true, name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Resume motion" })
  ).toBeVisible();
  await page.waitForTimeout(300);
  const movement = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      throw new Error("Trainer canvas is missing.");
    }
    const before = { ...window.canvasMetrics };
    const resumedAt = performance.now();
    const speed = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.5;
    const { promise, resolve } = Promise.withResolvers<{
      actual: number;
      expected: number;
    }>();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    const readFirstMovement = () => {
      const metrics = window.canvasMetrics;
      if (metrics.arcs > before.arcs) {
        resolve({
          actual: metrics.targetX - before.targetX,
          expected:
            (Math.max(0, metrics.lastDrawTimestamp - resumedAt) * speed) / 1000,
        });
        return;
      }
      requestAnimationFrame(readFirstMovement);
    };
    requestAnimationFrame(readFirstMovement);
    return promise;
  });
  expect(movement.actual).toBeLessThanOrEqual(movement.expected + 0.5);
  expect(movement.actual).toBeGreaterThanOrEqual(0);
});

test("lilac chaser sleeps between steps and updates only changed dots", async ({
  page,
}) => {
  await page.goto("/lilac-chaser/");
  await expect(
    page.getByRole("button", { exact: true, name: "Pause motion" })
  ).toBeVisible();
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => ({ ...window.canvasMetrics }));
  await page.waitForTimeout(1000);
  const after = await page.evaluate(() => window.canvasMetrics);
  expect(after.arcs - before.arcs).toBeGreaterThanOrEqual(8);
  expect(after.arcs - before.arcs).toBeLessThanOrEqual(12);
  expect(after.callbacks - before.callbacks).toBeLessThanOrEqual(25);
});

test("incremental lilac drawing returns to identical pixels after a full cycle", async ({
  page,
}) => {
  await page.goto("/lilac-chaser/");
  await expect(
    page.getByRole("button", { exact: true, name: "Pause motion" })
  ).toBeVisible();
  await page.waitForTimeout(200);
  const canvas = page.locator("canvas");
  const initial = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL()
  );
  await expect
    .poll(
      () => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()),
      { intervals: [25], timeout: 2000 }
    )
    .not.toBe(initial);
  await expect
    .poll(
      () => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()),
      { intervals: [25], timeout: 2500 }
    )
    .toBe(initial);
});

for (const path of ["/smooth-pursuit/", "/lilac-chaser/"]) {
  test(`${path} stops work while hidden and resumes when visible`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(
      page.getByRole("button", { exact: true, name: "Pause motion" })
    ).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const before = await page.evaluate(() => window.canvasMetrics.arcs);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.canvasMetrics.arcs)).toBe(before);
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect
      .poll(() => page.evaluate(() => window.canvasMetrics.arcs))
      .toBeGreaterThan(before);
  });
}

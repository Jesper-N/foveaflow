import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import { z } from "zod";

/**
 * Pages start in English and fail the test on any browser error or failed
 * request for a site resource.
 */
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    if (baseURL === undefined) {
      throw new Error("Browser tests need a baseURL.");
    }

    await page
      .context()
      .addCookies([{ name: "PARAGLIDE_LOCALE", url: baseURL, value: "en" }]);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      // Failed requests are checked from their responses below.
      if (
        message.type() === "error" &&
        !message.text().startsWith("Failed to load resource")
      ) {
        errors.push(message.text());
      }
    });
    // Tests check the status of the page itself, so only resources count.
    page.on("response", (response) => {
      if (
        response.url().startsWith(baseURL) &&
        response.request().resourceType() !== "document" &&
        response.status() >= 400
      ) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    await use(page);
    expect(errors, "Browser errors and failed site resources").toEqual([]);
  },
});

export const openPage = async (page: Page, path: string) => {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  await expect(page).toHaveTitle(/FoveaFlow/u);
  // Every island has hydrated.
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
};

const savedSettingsSchema = z.looseObject({
  baseRadiusPx: z.number(),
  letterEnabled: z.boolean(),
  lilacChaserScale: z.number(),
  targetForm: z.string(),
});

export const readSettings = async (page: Page) => {
  const value = await page.evaluate(() =>
    localStorage.getItem("foveaflow.settings.v3")
  );

  return value === null ? null : savedSettingsSchema.parse(JSON.parse(value));
};

export const canvasImage = async (page: Page) =>
  await page
    .locator("canvas")
    .evaluate((node: HTMLCanvasElement) => node.toDataURL());

/** The canvas has drawn something and keeps changing. */
export const expectAnimation = async (page: Page) => {
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect
    .poll(
      async () =>
        await canvas.evaluate(
          (node: HTMLCanvasElement) =>
            node
              .getContext("2d")
              ?.getImageData(0, 0, node.width, node.height)
              .data.some((value) => value !== 0) ?? false
        )
    )
    .toBe(true);
  const image = await canvasImage(page);
  await expect
    .poll(async () => await canvasImage(page), { timeout: 4000 })
    .not.toBe(image);
};

/** Fails when the page scrolls sideways, which usually means something overflows. */
export const expectNoHorizontalScroll = async (page: Page) => {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    ),
    "The page must not scroll sideways"
  ).toBe(true);
};

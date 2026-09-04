import { expect, test } from "@playwright/test";

import { DEFAULT_CALIBRATION } from "../../src/lib/engine/calibration";
import {
  firstPreset,
  patternOptions,
  settingsFromPreset,
} from "../../src/lib/engine/presets";
import {
  behaviorOptions,
  createBehaviorProfiles,
} from "../../src/lib/trainer/behavior";
import { targetFormOptions } from "../../src/lib/trainer/options";

const patterns = [
  ...patternOptions,
  { id: "teleport", name: "Reaction jumps" },
] as const;

for (const [index, pattern] of patterns.entries()) {
  test(`${pattern.name} renders saved shapes, letters, trails and behavior`, async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) {
      throw new Error("Playwright baseURL is required.");
    }
    await context.addCookies([
      { name: "PARAGLIDE_LOCALE", url: baseURL, value: "en" },
    ]);
    const settings = settingsFromPreset(firstPreset, DEFAULT_CALIBRATION, {
      ...createBehaviorProfiles(
        behaviorOptions[index % behaviorOptions.length].id
      ),
      baseRadiusPx: 45,
      distractorBrightness: 0.5,
      distractorCount: 10,
      letterColor: "#000000",
      letterEnabled: true,
      letterScale: 1.2,
      letterWeight: 800,
      motionDirection: index % 2 === 0 ? 1 : -1,
      patternId: pattern.id,
      presetId: pattern.id === "teleport" ? "reactionTime" : "pursuit",
      showTrail: true,
      targetCount: 6,
      targetForm: targetFormOptions[index % targetFormOptions.length].id,
      targetOpacity: 0.65,
    });
    await page.addInitScript(
      (saved) =>
        localStorage.setItem("foveaflow.settings.v2", JSON.stringify(saved)),
      settings
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(
      page.getByRole("button", { exact: true, name: "Pause motion" })
    ).toBeVisible();
    const canvas = page.locator("canvas");
    const initial = await canvas.evaluate((node: HTMLCanvasElement) =>
      node.toDataURL()
    );
    await expect
      .poll(() =>
        canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())
      )
      .not.toBe(initial);
    await page
      .getByRole("button", { exact: true, name: "Pause motion" })
      .click();
    await expect(
      page.getByRole("button", { exact: true, name: "Resume motion" })
    ).toBeVisible();
    await page.evaluate(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))
    );
    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("foveaflow.settings.v2");
          return raw ? JSON.parse(raw).baseRadiusPx : null;
        })
      )
      .toBeGreaterThan(settings.baseRadiusPx);
    expect(errors).toEqual([]);
  });
}

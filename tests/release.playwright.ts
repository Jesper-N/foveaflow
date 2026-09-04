import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

import {
  getTrainerRoute,
  trainerRoutes,
} from "../src/lib/content/trainer-routes";
import {
  exercisePresets,
  getPreset,
  patternOptions,
} from "../src/lib/engine/presets";
import type { TrainerSettings, TrainingMode } from "../src/lib/engine/presets";
import type { PatternId } from "../src/lib/engine/types";

const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error("Release tests require a baseURL.");
    }
    await page
      .context()
      .addCookies([{ name: "PARAGLIDE_LOCALE", url: baseURL, value: "en" }]);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("response", (response) => {
      if (response.url().startsWith(baseURL) && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    await use(page);
    expect(errors, "Browser errors and failed site resources").toEqual([]);
  },
});

const readSettings = (page: Page): Promise<TrainerSettings | null> =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("foveaflow.settings.v2") ?? "null")
  );

const openPage = async (page: Page, path: string) => {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page).toHaveTitle(/FoveaFlow/u);
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
};

const expectAnimation = async (page: Page) => {
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((node: HTMLCanvasElement) => {
        const context = node.getContext("2d");
        return (
          context
            ?.getImageData(0, 0, node.width, node.height)
            .data.some((value) => value !== 0) ?? false
        );
      })
    )
    .toBe(true);
  const image = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL()
  );
  await expect
    .poll(
      () => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()),
      { timeout: 4000 }
    )
    .not.toBe(image);
};

const expectTrainer = async (
  page: Page,
  mode: TrainingMode,
  patternId: PatternId
) => {
  await expect(
    page.getByRole("button", { exact: true, name: "Pause motion" })
  ).toBeVisible();
  await expect(
    page.locator('[data-trainer-shortcut-select$="-mode"]:visible')
  ).toContainText(getPreset(mode).name);
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({ patternId, presetId: mode });
  await expectAnimation(page);
};

const choose = async (
  page: Page,
  select: "mode" | "pattern",
  name: string,
  hasTouch: boolean
) => {
  const action = hasTouch ? "tap" : "click";
  const trigger = page.locator(
    `[data-trainer-shortcut-select$="-${select}"]:visible`
  );
  await trigger[action]();
  await page.getByRole("option", { exact: true, name })[action]();
  await expect(page.locator('[data-slot="select-content"]')).toHaveCount(0);
};

const section = (page: Page, id: string) =>
  page.locator(`[data-control-section="${id}"]:visible`).click();

const adjustSlider = (page: Page, name: string, key: string) =>
  page
    .getByRole("dialog")
    .locator(`[data-slot="slider"][aria-label="${name}"]`)
    .getByRole("slider")
    .press(key);

const trainerPages = [
  { mode: "pursuit" as const, path: "/", patternId: "randomWalk" as const },
  ...trainerRoutes.map((route) => ({
    mode: route.mode,
    path: route.path,
    patternId: route.patternId ?? getPreset(route.mode).patternId,
  })),
];

for (const route of trainerPages) {
  test(`direct load: ${route.path}`, async ({ page }) => {
    await openPage(page, route.path);
    await expectTrainer(page, route.mode, route.patternId);
  });
}

for (const path of [
  "/guide/",
  "/privacy/",
  "/terms/",
  "/fps-eye-training/",
  "/blinkcamp-alternative/",
  "/eyetrainer-gg-alternative/",
]) {
  test(`public page: ${path}`, async ({ page }) => {
    await openPage(page, path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

const menuChoices = [
  ...exercisePresets.map((preset) => ({
    mode: preset.id,
    name: preset.name,
    patternId: preset.patternId,
    select: "mode" as const,
  })),
  ...patternOptions
    .filter(({ id }) => id !== "multipleObjectTracking")
    .map((pattern) => ({
      mode: "pursuit" as const,
      name: pattern.name,
      patternId: pattern.id,
      select: "pattern" as const,
    })),
];

for (const choice of menuChoices) {
  test(`menu navigation: ${choice.select} / ${choice.name}`, async ({
    page,
    hasTouch,
  }) => {
    const route = getTrainerRoute(choice.mode, choice.patternId);
    if (!route) {
      throw new Error(`Missing route for ${choice.mode}/${choice.patternId}`);
    }
    await openPage(
      page,
      choice.select === "mode" && choice.mode === "pursuit"
        ? "/reaction-jumps/"
        : "/smooth-pursuit/"
    );
    await expect(
      page.getByRole("button", { exact: true, name: "Pause motion" })
    ).toBeVisible();
    await choose(page, choice.select, choice.name, hasTouch);
    await expect(page).toHaveURL(new RegExp(`${route.path}$`, "u"));
    await expectTrainer(page, choice.mode, choice.patternId);
  });
}

test("pause freezes the canvas and resume restarts motion", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  await page.getByRole("button", { exact: true, name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Resume motion" })
  ).toBeVisible();
  await page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    return promise;
  });
  const canvas = page.locator("canvas");
  const image = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL()
  );
  await page.waitForTimeout(250);
  expect(
    await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())
  ).toBe(image);
  await page
    .getByRole("button", { exact: true, name: "Resume motion" })
    .click();
  await expectAnimation(page);
});

test("settings redraw, survive reload, and reset through the controls", async ({
  page,
  hasTouch,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  const initial = await readSettings(page);
  if (!initial) {
    throw new Error("Trainer settings were not saved.");
  }
  await page.getByRole("button", { exact: true, name: "Pause motion" }).click();
  await page.getByRole("button", { name: "Open controls" }).click();
  const canvas = page.locator("canvas");
  const image = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL()
  );
  await adjustSlider(page, "Target size", "ArrowRight");
  await page.getByRole("button", { exact: true, name: "Target form" }).click();
  await page.getByRole("option", { exact: true, name: "Ring" }).click();
  await page.getByRole("switch", { name: "Show target letters" }).click();
  const changed = {
    baseRadiusPx: initial.baseRadiusPx + 1,
    letterEnabled: true,
    targetForm: "ring",
  };
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
  await expect
    .poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()))
    .not.toBe(image);
  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
  await page.getByRole("button", { name: "Open controls" }).click();
  await expect(
    page.getByRole("switch", { name: "Show target letters" })
  ).toBeChecked();
  await section(page, "defaults");
  await page.getByRole("button", { name: "Reset to defaults" }).click();
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      baseRadiusPx: initial.baseRadiusPx,
      letterEnabled: initial.letterEnabled,
      targetForm: initial.targetForm,
    });
  await page.keyboard.press("Escape");
  await choose(page, "mode", "Multiple Distractions", hasTouch);
  await page.getByRole("button", { name: "Open controls" }).click();
  await adjustSlider(page, "Targets", "ArrowRight");
  await adjustSlider(page, "Distractors", "ArrowLeft");
  const mot = getPreset("mot");
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      distractorCount: mot.distractorCount - 1,
      presetId: "mot",
      targetCount: mot.targetCount + 1,
    });
  await page.keyboard.press("Escape");
  await expectAnimation(page);
});

test("Lilac color and scale update the paused drill and persist", async ({
  page,
}) => {
  await openPage(page, "/lilac-chaser/");
  await expectTrainer(page, "lilacChaser", "circle");
  const initial = await readSettings(page);
  if (!initial) {
    throw new Error("Trainer settings were not saved.");
  }
  await page.getByRole("button", { exact: true, name: "Pause motion" }).click();
  await page.getByRole("button", { name: "Open controls" }).click();
  await section(page, "drill");
  const canvas = page.locator("canvas");
  const image = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL()
  );
  await adjustSlider(page, "Lilac Chaser scale", "ArrowRight");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lilac Chaser ball color" })
    .click();
  await page.getByRole("option", { exact: true, name: "Blue" }).click();
  await expect
    .poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()))
    .not.toBe(image);
  const changed = {
    lilacChaserBallColor: "#245cff",
    lilacChaserScale: initial.lilacChaserScale + 0.05,
  };
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
  await page.reload();
  await expectTrainer(page, "lilacChaser", "circle");
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
});

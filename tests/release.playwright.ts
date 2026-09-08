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
    JSON.parse(localStorage.getItem("foveaflow.settings.v3") ?? "null")
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

const hoverIsland = async (page: Page) => {
  const bounds = await page.locator("#trainer-island").boundingBox();
  if (!bounds) {
    throw new Error("Island has no rendered bounds.");
  }
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 20);
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
  const option = page.getByRole("option", { exact: true, name });
  // Scrolling can reveal the select's scroll buttons and shift its items.
  // Let the click check stability after that layout change.
  await option.scrollIntoViewIfNeeded();
  await option[action]();
  await expect(page.locator('[data-slot="select-content"]')).toHaveCount(0);
  if (!hasTouch) {
    await hoverIsland(page);
  }
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

test("island hides when idle and respects pointer or touch after selection", async ({
  page,
  hasTouch,
}) => {
  await openPage(page, "/");
  const island = page.locator("#trainer-island");
  const reveal = page.getByRole("button", { name: "Reveal controls" });
  await expect(reveal).toBeVisible({ timeout: 4500 });
  await expect(island).toHaveAttribute("inert", "");

  await (hasTouch ? reveal.tap() : hoverIsland(page));
  await expect(island).not.toHaveAttribute("inert", "");
  const action = hasTouch ? "tap" : "click";
  const drill = page.getByRole("button", {
    exact: true,
    name: "Drill: Smooth Pursuit",
  });
  await drill[action]();
  const reaction = page.getByRole("option", {
    exact: true,
    name: "Reaction jumps",
  });
  await reaction[action]();
  await expect(page).toHaveURL(/\/reaction-jumps\/$/u);
  await expect(page.getByRole("listbox")).toHaveCount(0);

  if (!hasTouch) {
    // Keep the pointer where selecting the option left it, inside the island.
    await page.waitForTimeout(5500);
    await expect(island).not.toHaveAttribute("inert", "");
    await page.mouse.move(0, 0);
  }
  await expect(reveal).toBeVisible({ timeout: hasTouch ? 4500 : 1000 });
  await expect(island).toHaveAttribute("inert", "");
});

test("island offers the controls supported by the selected drill", async ({
  page,
  hasTouch,
}) => {
  await openPage(page, "/circle/");
  const reverse = page.getByRole("button", {
    exact: true,
    name: "Reverse motion direction",
  });
  const pattern = page.locator(
    '[data-trainer-shortcut-select="header-pattern"]'
  );
  const speed = page.locator(
    '[data-slot="slider"][aria-label="Header target speed"]'
  );
  await expect(reverse).toBeVisible();
  await choose(page, "pattern", "Random", hasTouch);
  await expect(reverse).toBeHidden();
  await expect(pattern).toBeVisible();

  await choose(page, "mode", "Reaction jumps", hasTouch);
  await expect(pattern).toBeHidden();
  await expect(reverse).toBeHidden();

  await choose(page, "mode", "Lilac Chaser", hasTouch);
  await expect(pattern).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Lilac Chaser ball color" })
  ).toBeVisible();
  await expect(speed).toBeHidden();
  await expect(
    page.locator('[data-slot="field-group"][inert]').filter({ has: speed })
  ).toHaveCount(1);

  await choose(page, "mode", "Smooth Pursuit", hasTouch);
  await expect(pattern).toBeVisible();
  await expect(speed).toBeVisible();
  await expect(
    page.locator('[data-slot="field-group"][inert]').filter({ has: speed })
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Lilac Chaser ball color" })
  ).toHaveCount(0);
});

test("settings keep the selected unit and reopen the last category", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await page.getByRole("button", { name: "Open controls" }).click();
  await section(page, "drill");
  const unit = page.getByRole("radio", { exact: true, name: "cm/s" });
  await unit.click();
  await unit.click();
  await expect(unit).toBeChecked();
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      speed: { unit: "cm/s" },
    });
  await page.getByRole("button", { exact: true, name: "Done" }).click();
  await page.getByRole("button", { name: "Open controls" }).click();
  await expect(
    page.getByRole("heading", { exact: true, level: 2, name: "Drill" })
  ).toBeVisible();
  await expect(unit).toBeChecked();

  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await page.getByRole("button", { name: "Open controls" }).click();
  await section(page, "drill");
  await expect(unit).toBeChecked();
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      speed: { unit: "cm/s" },
    });
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
  await page.getByRole("radio", { exact: true, name: "Ring" }).click();
  await page.getByRole("radio", { exact: true, name: "Ring" }).click();
  await expect(
    page.getByRole("radio", { exact: true, name: "Ring" })
  ).toBeChecked();
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
  await section(page, "general");
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
  await section(page, "targets");
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

test("target defaults follow the theme while custom colors persist", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  await page.getByRole("button", { exact: true, name: "Pause motion" }).click();
  await page.getByRole("button", { name: "Open controls" }).click();
  const color = page.getByLabel("Ball color", { exact: true });
  const expectThemeTarget = async () => {
    const primary = await page.evaluate(() => {
      const sample = document.createElement("canvas");
      const context = sample.getContext("2d");
      if (!context) {
        throw new Error("Canvas context unavailable");
      }
      context.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return [red, green, blue];
    });
    const hex = `#${primary.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
    await expect(color).toHaveValue(hex);
    await expect
      .poll(() =>
        page
          .locator("canvas")
          .evaluate((canvas: HTMLCanvasElement, expected) => {
            const pixels = canvas
              .getContext("2d")
              ?.getImageData(0, 0, canvas.width, canvas.height).data;
            if (!pixels) {
              return false;
            }
            for (let index = 0; index < pixels.length; index += 4) {
              if (
                pixels[index] === expected[0] &&
                pixels[index + 1] === expected[1] &&
                pixels[index + 2] === expected[2] &&
                pixels[index + 3] === 255
              ) {
                return true;
              }
            }
            return false;
          }, primary)
      )
      .toBe(true);
    await expect
      .poll(() => readSettings(page))
      .toMatchObject({ ballColor: null });
  };
  await expectThemeTarget();
  await section(page, "display");
  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await section(page, "targets");
  await expectThemeTarget();
  // The previous default must remain available as an explicitly chosen color.
  await color.fill("#76d900");
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({ ballColor: "#76d900" });
  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await page.getByRole("button", { name: "Open controls" }).click();
  await expect(color).toHaveValue("#76d900");
  await section(page, "display");
  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await section(page, "targets");
  await expect(color).toHaveValue("#76d900");
  await section(page, "general");
  await page.getByRole("button", { name: "Reset to defaults" }).click();
  await section(page, "targets");
  await expectThemeTarget();
});

for (const legacyColor of ["#76d900", "#2488cc"]) {
  test(`saved target color migrates from v2: ${legacyColor}`, async ({
    page,
  }) => {
    await page.addInitScript((ballColor) => {
      localStorage.setItem(
        "foveaflow.settings.v2",
        JSON.stringify({ ballColor, baseRadiusPx: 51 })
      );
    }, legacyColor);
    await openPage(page, "/circle/");
    await expect
      .poll(() => readSettings(page))
      .toMatchObject({
        ballColor: legacyColor === "#76d900" ? null : legacyColor,
        baseRadiusPx: 51,
      });
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("foveaflow.settings.v2"))
      )
      .toBeNull();
  });
}

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
  await section(page, "targets");
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

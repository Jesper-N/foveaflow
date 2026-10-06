import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { drillRoutes } from "../src/lib/content/drill-routes";
import { homeCopy } from "../src/lib/content/home";
import type { PatternId } from "../src/lib/trainer/engine/types";
import { getDrill } from "../src/lib/trainer/settings/drills";
import type { DrillId } from "../src/lib/trainer/settings/drills";
import { getPatternName } from "../src/lib/trainer/settings/patterns";
import { createDefaultSettings } from "../src/lib/trainer/settings/settings";
import {
  canvasImage,
  expectAnimation,
  openPage,
  readSettings,
  test,
} from "./fixtures";

const pauseButton = (page: Page) =>
  page.getByRole("button", { exact: true, name: "Pause motion" });

const resumeButton = (page: Page) =>
  page.getByRole("button", { exact: true, name: "Resume motion" });

/** The trainer shows the drill in its menu, saves it, and animates. */
const expectTrainer = async (
  page: Page,
  drillId: DrillId,
  patternId: PatternId
) => {
  await expect(pauseButton(page)).toBeVisible();
  await expect(page.locator('[data-hud-select="drill"]:visible')).toContainText(
    getDrill(drillId).name
  );
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({ patternId, presetId: drillId });
  await expectAnimation(page);
};

const hoverIsland = async (page: Page) => {
  const bounds = await page.locator("#trainer-island").boundingBox();
  if (!bounds) {
    throw new Error("The island has no rendered bounds.");
  }
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 20);
};

/** Picks an option from a menu in the island, by mouse or by touch. */
const choose = async (
  page: Page,
  select: "drill" | "pattern",
  name: string,
  hasTouch: boolean
) => {
  const action = hasTouch ? "tap" : "click";
  await page.locator(`[data-hud-select="${select}"]:visible`)[action]();
  const option = page.getByRole("option", { exact: true, name });
  // Scrolling can reveal the menu's scroll buttons and shift its items, so
  // the click checks stability after that layout change.
  await option.scrollIntoViewIfNeeded();
  await option[action]();
  await expect(page.locator('[data-slot="select-content"]')).toHaveCount(0);
  if (!hasTouch) {
    await hoverIsland(page);
  }
};

const openControls = async (page: Page, section: string) => {
  await page.getByRole("button", { name: "Open controls" }).click();
  await page.locator(`[data-control-section="${section}"]:visible`).click();
};

const showSection = (page: Page, section: string) =>
  page.locator(`[data-control-section="${section}"]:visible`).click();

const adjustSlider = (page: Page, name: string, key: string) =>
  page
    .getByRole("dialog")
    .locator(`[data-slot="slider"][aria-label="${name}"]`)
    .getByRole("slider")
    .press(key);

const resetToDefaults = async (page: Page) => {
  await page.getByRole("button", { name: "Reset to defaults" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset to defaults" })
    .click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
};

const openGuide = async (page: Page) => {
  const trigger = page.locator(
    '#trainer-island [aria-controls="trainer-guide"]'
  );
  await trigger.click();
  const guide = page.locator("#trainer-guide");
  await expect(guide).toBeVisible();
  return { guide, trigger };
};

const trainerPages = [
  { drillId: "pursuit" as const, path: "/", patternId: "randomWalk" as const },
  ...drillRoutes.map((route) => ({
    drillId: route.drillId,
    path: route.path,
    patternId: route.patternId ?? getDrill(route.drillId).patternId,
  })),
];

for (const { drillId, path, patternId } of trainerPages) {
  test(`${path} opens on its drill`, async ({ page }) => {
    await openPage(page, path);
    await expectTrainer(page, drillId, patternId);
  });
}

test("the home guide shows every drill and closes with Escape", async ({
  page,
}) => {
  await openPage(page, "/");
  const { guide, trigger } = await openGuide(page);
  await expect(guide.getByRole("heading", { level: 2 })).toHaveText(
    homeCopy.heading
  );
  await expect(guide.locator('[data-slot="drill-illustration"]')).toHaveCount(
    4
  );
  expect(
    await guide.evaluate((node) => node.scrollWidth <= node.clientWidth),
    "The guide must fit without scrolling sideways"
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(guide).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("a drill guide answers questions and closes from outside", async ({
  page,
}) => {
  await openPage(page, "/smooth-pursuit/");
  const { guide } = await openGuide(page);
  const route = drillRoutes.find(({ slug }) => slug === "smooth-pursuit");
  await expect(guide.getByRole("heading", { level: 2 })).toHaveText(
    route?.copy.heading ?? ""
  );
  const answer = guide.locator("details").first();
  await answer.locator("summary").press("Enter");
  await expect(answer).toHaveAttribute("open", "");
  await expect(
    guide.getByRole("link", { name: "Read full guide" })
  ).toHaveAttribute("href", "/guide/");
  await page.mouse.click(4, 4);
  await expect(guide).not.toBeVisible();
  await expectAnimation(page);
});

test("the menus move between drills and paths", async ({ page, hasTouch }) => {
  await openPage(page, "/smooth-pursuit/");
  await expect(pauseButton(page)).toBeVisible();

  await choose(page, "drill", "Reaction Jumps", hasTouch);
  await expect(page).toHaveURL(/\/reaction-jumps\/$/u);
  await expectTrainer(page, "reactionTime", "teleport");

  await choose(page, "drill", "Smooth Pursuit", hasTouch);
  await choose(page, "pattern", getPatternName("figureEight"), hasTouch);
  await expect(page).toHaveURL(/\/figure-eight\/$/u);
  await expectTrainer(page, "pursuit", "figureEight");
});

test("keyboard shortcuts pause and open panels", async ({ page }) => {
  await openPage(page, "/circle/");
  await expect(pauseButton(page)).toBeVisible();
  await page.keyboard.press(" ");
  await expect(resumeButton(page)).toBeVisible();
  await page.keyboard.press(" ");
  await expect(pauseButton(page)).toBeVisible();

  await page.keyboard.press("s");
  await expect(page.getByRole("dialog")).toBeVisible();
  // The next shortcut must work while the closed dialog is still animating out.
  await page.keyboard.press("Escape");
  await page.keyboard.press("g");
  await expect(page.locator("#trainer-guide")).toBeVisible();
});

test("pause freezes the canvas and resume restarts motion", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  await pauseButton(page).click();
  await expect(resumeButton(page)).toBeVisible();
  // Let the frame that was already scheduled finish drawing.
  await page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    return promise;
  });
  const image = await canvasImage(page);
  await page.waitForTimeout(250);
  expect(await canvasImage(page)).toBe(image);
  await resumeButton(page).click();
  await expectAnimation(page);
});

test("the island hides when idle and comes back on pointer or touch", async ({
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
  const drillMenu = page.getByRole("button", {
    exact: true,
    name: "Drill: Smooth Pursuit",
  });
  await drillMenu[action]();
  const reactionJumps = page.getByRole("option", {
    exact: true,
    name: "Reaction Jumps",
  });
  await reactionJumps[action]();
  await expect(page).toHaveURL(/\/reaction-jumps\/$/u);
  await expect(page.getByRole("listbox")).toHaveCount(0);

  if (!hasTouch) {
    // A pointer resting on the island keeps it open.
    await page.waitForTimeout(5500);
    await expect(island).not.toHaveAttribute("inert", "");
    await page.mouse.move(0, 0);
  }
  await expect(reveal).toBeVisible({ timeout: hasTouch ? 4500 : 1000 });
  await expect(island).toHaveAttribute("inert", "");
});

test("the island offers the controls the drill supports", async ({
  page,
  hasTouch,
}) => {
  await openPage(page, "/circle/");
  const reverse = page.getByRole("button", {
    exact: true,
    name: "Reverse motion direction",
  });
  const pattern = page.locator('[data-hud-select="pattern"]');
  const speed = page.locator(
    '[data-slot="slider"][aria-label="Header target speed"]'
  );
  const lilacColor = page.getByRole("button", {
    name: "Lilac Chaser ball color",
  });
  await expect(reverse).toBeVisible();

  await choose(page, "pattern", "Random", hasTouch);
  await expect(reverse).toBeHidden();
  await expect(pattern).toBeVisible();

  await choose(page, "drill", "Reaction Jumps", hasTouch);
  await expect(pattern).toBeHidden();

  await choose(page, "drill", "Lilac Chaser", hasTouch);
  await expect(lilacColor).toBeVisible();
  await expect(speed).toBeHidden();

  await choose(page, "drill", "Smooth Pursuit", hasTouch);
  await expect(pattern).toBeVisible();
  await expect(speed).toBeVisible();
  await expect(lilacColor).toHaveCount(0);
});

test("the controls fit the panel in every section", async ({ page }) => {
  await openPage(page, "/circle/");
  await page.getByRole("button", { name: "Open controls" }).click();
  const expectSectionFits = async (section: string) => {
    await showSection(page, section);
    expect(
      await page
        .getByRole("dialog")
        .evaluate(
          (node) =>
            node.scrollLeft === 0 && node.scrollWidth <= node.clientWidth
        ),
      `The ${section} section must not scroll sideways`
    ).toBe(true);
  };
  await expectSectionFits("drill");
  await expectSectionFits("targets");
  await expectSectionFits("general");
});

test("speed moves in whole steps and the controls reopen on the last section", async ({
  page,
  hasTouch,
}) => {
  await openPage(page, "/circle/");
  await openControls(page, "drill");
  await adjustSlider(page, "Speed", "ArrowRight");
  await expect.poll(() => readSettings(page)).toMatchObject({ speed: 21 });
  await page.getByRole("button", { exact: true, name: "Done" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  if (!hasTouch) {
    await hoverIsland(page);
  }
  await page.getByRole("button", { name: "Open controls" }).click();
  await expect(
    page.getByRole("heading", { exact: true, level: 2, name: "Drill" })
  ).toBeVisible();
});

test("settings redraw the paused drill, survive a reload, and reset", async ({
  page,
  hasTouch,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  const initial = await readSettings(page);
  if (!initial) {
    throw new Error("The trainer did not save its settings.");
  }
  await pauseButton(page).click();
  await openControls(page, "targets");
  const image = await canvasImage(page);
  await adjustSlider(page, "Target size", "ArrowRight");
  await page.getByRole("radio", { exact: true, name: "Ring" }).click();
  await page.getByRole("switch", { name: "Show target letters" }).click();
  const changed = {
    baseRadiusPx: initial.baseRadiusPx + 1,
    letterEnabled: true,
    targetForm: "ring",
  };
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
  await expect.poll(() => canvasImage(page)).not.toBe(image);

  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
  await openControls(page, "targets");
  await expect(
    page.getByRole("switch", { name: "Show target letters" })
  ).toBeChecked();

  await showSection(page, "general");
  await resetToDefaults(page);
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      baseRadiusPx: initial.baseRadiusPx,
      letterEnabled: initial.letterEnabled,
      targetForm: initial.targetForm,
    });
  await page.keyboard.press("Escape");

  await choose(page, "drill", "Multiple Distractions", hasTouch);
  await openControls(page, "targets");
  await adjustSlider(page, "Targets", "ArrowRight");
  await adjustSlider(page, "Distractors", "ArrowLeft");
  const distractions = createDefaultSettings(getDrill("mot"));
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      distractorCount: distractions.distractorCount - 1,
      presetId: "mot",
      targetCount: distractions.targetCount + 1,
    });
});

test("the target color follows the theme until a custom color is chosen", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  await pauseButton(page).click();
  await openControls(page, "targets");
  const color = page.getByLabel("Ball color", { exact: true });

  /** The color picker shows the theme's primary color and the canvas draws it. */
  const expectThemeTarget = async () => {
    const primary = await page.evaluate(() => {
      const context = document.createElement("canvas").getContext("2d");
      if (!context) {
        throw new Error("No canvas context");
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
          .evaluate((canvas: HTMLCanvasElement, [red, green, blue]) => {
            const pixels = canvas
              .getContext("2d")
              ?.getImageData(0, 0, canvas.width, canvas.height).data;
            if (!pixels) {
              return false;
            }
            for (let index = 0; index < pixels.length; index += 4) {
              if (
                pixels[index] === red &&
                pixels[index + 1] === green &&
                pixels[index + 2] === blue &&
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
      .toMatchObject({
        ballColor: null,
      });
  };

  await expectThemeTarget();
  await showSection(page, "general");
  await page.getByRole("radio", { exact: true, name: "Dark" }).click();
  await showSection(page, "targets");
  await expectThemeTarget();

  // The old default stays available as a chosen color.
  await color.fill("#76d900");
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      ballColor: "#76d900",
    });
  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await openControls(page, "general");
  await page.getByRole("radio", { exact: true, name: "Light" }).click();
  await showSection(page, "targets");
  await expect(color).toHaveValue("#76d900");

  await showSection(page, "general");
  await resetToDefaults(page);
  await showSection(page, "targets");
  await expectThemeTarget();
});

test("a version 2 save is migrated when the trainer loads", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "foveaflow.settings.v2",
      JSON.stringify({
        ballColor: "#76d900",
        baseRadiusPx: 51,
        calibration: { cssPxPerCm: 37.8, viewingDistanceCm: 60 },
        speed: { unit: "cm/s", value: 20 },
      })
    );
  });
  await openPage(page, "/circle/");
  await expect
    .poll(() => readSettings(page))
    .toMatchObject({
      ballColor: null,
      baseRadiusPx: 51,
      speed: 19,
    });
  expect(await readSettings(page)).not.toHaveProperty("calibration");
  expect(
    await page.evaluate(() => localStorage.getItem("foveaflow.settings.v2"))
  ).toBeNull();
});

test("Lilac color and scale redraw the paused drill and persist", async ({
  page,
}) => {
  await openPage(page, "/lilac-chaser/");
  await expectTrainer(page, "lilacChaser", "circle");
  const initial = await readSettings(page);
  if (!initial) {
    throw new Error("The trainer did not save its settings.");
  }
  await pauseButton(page).click();
  await openControls(page, "targets");
  const image = await canvasImage(page);
  await adjustSlider(page, "Lilac Chaser scale", "ArrowRight");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lilac Chaser ball color" })
    .click();
  await page.getByRole("option", { exact: true, name: "Blue" }).click();
  await expect.poll(() => canvasImage(page)).not.toBe(image);
  const changed = {
    lilacChaserBallColor: "#245cff",
    lilacChaserScale: initial.lilacChaserScale + 0.05,
  };
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
  await page.reload();
  await expectTrainer(page, "lilacChaser", "circle");
  await expect.poll(() => readSettings(page)).toMatchObject(changed);
});

import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { drillRoutes } from "../src/lib/content/drill-routes";
import { homeCopy } from "../src/lib/content/home";
import { getCanvasTheme } from "../src/lib/trainer/canvas/theme";
import type { ColorMode } from "../src/lib/trainer/canvas/theme";
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
  await expect(
    page
      .locator("[data-island-drills]")
      .getByRole("radio", { exact: true, name: getDrill(drillId).name })
  ).toBeChecked();
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject({ patternId, presetId: drillId });
  await expectAnimation(page);
};

/** Waits until a popup has finished moving in, so clicks land where they aim. */
const settle = async (locator: Locator) => {
  await expect
    .poll(async () => {
      const first = await locator.boundingBox();
      await locator.page().waitForTimeout(100);

      return (
        JSON.stringify(first) === JSON.stringify(await locator.boundingBox())
      );
    })
    .toBe(true);
};

/** Opens the island at the top of the trainer by resting the pointer on it. */
const expandIsland = async (page: Page) => {
  const island = page.locator("section.island");
  const box = await island.boundingBox();

  await island.hover({ position: { x: (box?.width ?? 0) / 2, y: 20 } });
  await expect(island).toHaveAttribute("data-expanded", "true");
};

/** Picks a drill tab or a path from the path select in the trainer controls. */
const choose = async (
  page: Page,
  select: "drill" | "pattern",
  label: string
) => {
  await expandIsland(page);

  if (select === "drill") {
    await page
      .locator("[data-island-drills]")
      .getByRole("radio", { exact: true, name: label })
      .click();

    return;
  }

  await page.locator('[data-hud-select="pattern"]').click();
  const listbox = page.getByRole("listbox");
  await settle(listbox);
  await listbox.getByRole("option", { exact: true, name: label }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
};

const openControls = async (page: Page) => {
  await expandIsland(page);
  await page.getByRole("button", { name: "Open controls" }).click();
  await settle(page.getByRole("dialog"));
};

const closeControls = async (page: Page) => {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

const openTab = async (page: Page, name: "Drill" | "Targets" | "General") => {
  await page.getByRole("dialog").getByRole("tab", { name }).click();
};

const adjustSlider = async (page: Page, name: string, key: string) => {
  await page
    .getByRole("dialog")
    .getByRole("slider", { exact: true, name })
    .press(key);
};

const resetToDefaults = async (page: Page) => {
  await openTab(page, "General");
  await page.getByRole("button", { name: "Reset to defaults" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset to defaults" })
    .click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
};

const openGuide = async (page: Page) => {
  await expandIsland(page);

  const trigger = page
    .locator("#trainer-controls")
    .getByRole("button", { name: /^(?:About FoveaFlow|Open guide)$/u });

  await trigger.click();
  const guide = page.getByRole("dialog");
  await settle(guide);

  return { guide, trigger };
};

const trainerPages = [
  {
    drillId: "pursuit" as const,
    path: "/",
    patternId: "directionChange" as const,
  },
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
  await expect(guide.getByRole("list").first().getByRole("link")).toHaveCount(
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

test("a drill guide answers questions and closes from its button", async ({
  page,
}) => {
  await openPage(page, "/smooth-pursuit/");
  const { guide } = await openGuide(page);
  const route = drillRoutes.find(({ slug }) => slug === "smooth-pursuit");
  await expect(guide.getByRole("heading", { level: 2 })).toHaveText(
    route?.copy.heading ?? ""
  );
  await expect(
    guide.getByRole("heading", {
      level: 4,
      name: route?.copy.faq[0]?.question ?? "",
    })
  ).toBeVisible();
  await expect(
    guide.getByRole("link", { name: "Read full guide" })
  ).toHaveAttribute("href", "/guide/");
  await guide.getByRole("button", { name: "Close" }).click();
  await expect(guide).not.toBeVisible();
  await expectAnimation(page);
});

test("the menus move between drills and paths, then free the shortcuts", async ({
  page,
}) => {
  await openPage(page, "/smooth-pursuit/");
  await expect(pauseButton(page)).toBeVisible();

  await choose(page, "drill", "Reaction Jumps");
  await expect(page).toHaveURL(/\/reaction-jumps\/$/u);
  await expectTrainer(page, "reactionTime", "teleport");

  await choose(page, "drill", "Smooth Pursuit");
  await choose(page, "pattern", getPatternName("figureEight"));
  await expect(page).toHaveURL(/\/figure-eight\/$/u);
  await expectTrainer(page, "pursuit", "figureEight");

  const isDark = async () =>
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

  const wasDark = await isDark();

  await page.keyboard.press("d");
  await expect.poll(isDark).toBe(!wasDark);
  await expect(page).toHaveURL(/\/figure-eight\/$/u);
});

test("letter shortcuts still work after clicking a toolbar button", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expandIsland(page);
  await pauseButton(page).click();
  await expect(resumeButton(page)).toBeVisible();

  const isDark = async () =>
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

  const wasDark = await isDark();

  await page.keyboard.press("d");
  await expect.poll(isDark).toBe(!wasDark);
});

test("keyboard shortcuts pause and open panels", async ({ page }) => {
  await openPage(page, "/circle/");
  await expect(pauseButton(page)).toBeVisible();
  await page.keyboard.press(" ");
  await expect(resumeButton(page)).toBeVisible();
  await page.keyboard.press(" ");
  await expect(pauseButton(page)).toBeVisible();

  await page.keyboard.press("s");
  await settle(page.getByRole("dialog"));
  // The next shortcut must work before the dialog's close event arrives.
  await page.keyboard.press("Escape");
  await page.keyboard.press("g");
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: drillRoutes.find(({ slug }) => slug === "circle")?.copy.heading,
    })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("p");
  await expect(page.getByRole("option", { name: "Circle" })).toBeVisible();
});

test("actions make a sound until the Sound switch turns it off", async ({
  page,
}) => {
  await page.addInitScript(() => {
    class CountingContext extends AudioContext {
      static count() {
        const root = document.documentElement;
        root.dataset["soundStarts"] = String(
          Number(root.dataset["soundStarts"] ?? 0) + 1
        );
      }

      override createOscillator() {
        CountingContext.count();

        return super.createOscillator();
      }

      override createBufferSource() {
        CountingContext.count();

        return super.createBufferSource();
      }
    }

    window.AudioContext = CountingContext;
  });

  const started = async () =>
    await page.evaluate(() =>
      Number(document.documentElement.dataset["soundStarts"] ?? 0)
    );

  await openPage(page, "/circle/");
  await page.keyboard.press(" ");
  await expect(resumeButton(page)).toBeVisible();
  await expect.poll(started).toBeGreaterThan(0);

  await openControls(page);
  await openTab(page, "General");
  await page.getByRole("switch", { name: "Sound" }).click();
  await expect(page.getByRole("switch", { name: "Sound" })).not.toBeChecked();
  await closeControls(page);
  await page.waitForTimeout(500);

  const silentFrom = await started();
  await expandIsland(page);
  await resumeButton(page).click();
  await expect(pauseButton(page)).toBeVisible();
  await page.waitForTimeout(200);
  expect(await started()).toBe(silentFrom);

  await page.reload();
  await page.keyboard.press(" ");
  await expect(resumeButton(page)).toBeVisible();
  await page.waitForTimeout(200);
  expect(await started()).toBe(0);
});

test("the island toolbar shares one tooltip that names each shortcut", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expandIsland(page);

  const controls = page.getByRole("button", { name: "Open controls" });
  const tooltip = page.locator(".morph-tip[data-open]");

  await expect(controls).toHaveAttribute("aria-keyshortcuts", "S");
  await page.getByRole("button", { name: "Open guide" }).hover();
  await expect(tooltip).toContainText("Open guide");
  await controls.hover();
  await expect(tooltip).toHaveCount(1);
  await expect(tooltip).toContainText("Open controls");
  await page.mouse.move(10, 700);
  await expect(tooltip).toHaveCount(0);
});

test("pause freezes the canvas and resume restarts motion", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  await expandIsland(page);
  await pauseButton(page).click();
  await expect(resumeButton(page)).toBeVisible();
  // Let the frame that was already scheduled finish drawing.
  await page.evaluate(async () => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });

    await promise;
  });
  const image = await canvasImage(page);
  await page.waitForTimeout(250);
  expect(await canvasImage(page)).toBe(image);
  await expandIsland(page);
  await resumeButton(page).click();
  await expectAnimation(page);
});

test("the trainer offers the controls the drill supports", async ({ page }) => {
  await openPage(page, "/circle/");

  const reverse = page.getByRole("button", {
    exact: true,
    name: "Reverse motion direction",
  });

  const pattern = page.locator('[data-hud-select="pattern"]');

  const speed = page.getByRole("slider", { name: "Header target speed" });

  const lilacColor = page.getByRole("radiogroup", {
    name: "Lilac Chaser ball color",
  });

  await expect(reverse).toBeVisible();

  await choose(page, "pattern", "Random");
  await expect(reverse).toBeHidden();
  await expect(pattern).toBeVisible();

  await choose(page, "drill", "Reaction Jumps");
  await expect(pattern).toBeHidden();

  await choose(page, "drill", "Lilac Chaser");
  await expect(lilacColor).toBeVisible();
  await expect(speed).toBeHidden();

  await choose(page, "drill", "Smooth Pursuit");
  await expect(pattern).toBeVisible();
  await expect(speed).toBeVisible();
  await expect(lilacColor).toHaveCount(0);
});

test("the controls fit the dialog", async ({ page }) => {
  await openPage(page, "/circle/");
  await openControls(page);
  expect(
    await page
      .getByRole("dialog")
      .evaluate(
        (node) => node.scrollLeft === 0 && node.scrollWidth <= node.clientWidth
      ),
    "The controls must not scroll sideways"
  ).toBe(true);
});

test("speed moves in whole steps and Done closes the controls", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await openControls(page);
  await openTab(page, "Drill");
  await adjustSlider(page, "Speed", "ArrowRight");
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject({ speed: 26 });
  await page.getByRole("button", { exact: true, name: "Done" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("settings redraw the paused drill, survive a reload, and reset", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  const initial = await readSettings(page);

  if (!initial) {
    throw new Error("The trainer did not save its settings.");
  }

  await expandIsland(page);
  await pauseButton(page).click();
  await openControls(page);
  await openTab(page, "Targets");
  const image = await canvasImage(page);
  await adjustSlider(page, "Target size", "ArrowRight");
  await page.getByRole("radio", { exact: true, name: "Ring" }).click();
  await page.getByRole("switch", { name: "Show target letters" }).click();

  const changed = {
    baseRadiusPx: initial.baseRadiusPx + 1,
    letterEnabled: true,
    targetForm: "ring",
  };

  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject(changed);
  await expect.poll(async () => await canvasImage(page)).not.toBe(image);

  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject(changed);
  await openControls(page);
  await openTab(page, "Targets");
  await expect(
    page.getByRole("switch", { name: "Show target letters" })
  ).toBeChecked();

  await resetToDefaults(page);
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject({
      baseRadiusPx: initial.baseRadiusPx,
      letterEnabled: initial.letterEnabled,
      targetForm: initial.targetForm,
    });
  await closeControls(page);

  await choose(page, "drill", "Multiple Distractions");
  await openControls(page);
  await openTab(page, "Targets");
  await adjustSlider(page, "Targets", "ArrowRight");
  await adjustSlider(page, "Distractors", "ArrowLeft");
  const distractions = createDefaultSettings(getDrill("mot"));
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject({
      distractorCount: distractions.distractorCount - 1,
      presetId: "mot",
      targetCount: distractions.targetCount + 1,
    });
});

test("the target color follows the color mode until a custom color is chosen", async ({
  page,
}) => {
  await openPage(page, "/circle/");
  await expectTrainer(page, "pursuit", "circle");
  await expandIsland(page);
  await pauseButton(page).click();
  await openControls(page);
  await openTab(page, "Targets");

  const color = page
    .getByRole("dialog")
    .getByRole("button", { exact: true, name: "Ball color" });

  /** The color picker shows the color mode's default target and the canvas draws it. */
  const expectThemeTarget = async (mode: ColorMode) => {
    const hex = getCanvasTheme(mode).targetColor;

    const rgb = [1, 3, 5].map((start) =>
      Number.parseInt(hex.slice(start, start + 2), 16)
    );

    await expect(color).toContainText(hex);
    await expect
      .poll(
        async () =>
          await page
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
            }, rgb)
      )
      .toBe(true);
    await expect
      .poll(async () => await readSettings(page))
      .toMatchObject({
        ballColor: null,
      });
  };

  await expectThemeTarget("light");
  await openTab(page, "General");
  await page.getByRole("radio", { exact: true, name: "Dark" }).click();
  await openTab(page, "Targets");
  await expectThemeTarget("dark");

  // The old default stays available as a chosen color.
  await color.click();
  const hexInput = page.getByRole("textbox", { name: "Hex" });
  await hexInput.fill("#76d900");
  await hexInput.press("Enter");
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject({
      ballColor: "#76d900",
    });
  await page.reload();
  await expectTrainer(page, "pursuit", "circle");
  await openControls(page);
  await openTab(page, "General");
  await page.getByRole("radio", { exact: true, name: "Light" }).click();
  await openTab(page, "Targets");
  await expect(color).toContainText("#76d900");

  await resetToDefaults(page);
  await openTab(page, "Targets");
  await expectThemeTarget("light");
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
    .poll(async () => await readSettings(page))
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

  await expandIsland(page);
  await pauseButton(page).click();
  await openControls(page);
  await openTab(page, "Targets");
  const image = await canvasImage(page);
  await adjustSlider(page, "Lilac Chaser scale", "ArrowRight");
  await page
    .getByRole("dialog")
    .getByRole("radiogroup", { name: "Lilac Chaser ball color" })
    .getByRole("radio", { name: "Blue" })
    .click();
  await expect.poll(async () => await canvasImage(page)).not.toBe(image);

  const changed = {
    lilacChaserBallColor: "#245cff",
    lilacChaserScale: initial.lilacChaserScale + 0.05,
  };

  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject(changed);
  await page.reload();
  await expectTrainer(page, "lilacChaser", "circle");
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject(changed);
});

interface AgentStep {
  action: string;
  args: (string | number)[];
  ref: string;
}

interface ToolInput {
  steps?: AgentStep[];
}

interface WebMcpTool {
  name: string;
  execute: (input: ToolInput) => Promise<object>;
}

declare global {
  interface Window {
    webMcpTools?: Map<string, WebMcpTool>;
  }
}

/** Records the tools a page registers with WebMCP, the way a browser agent would see them. */
const stubWebMcp = async (page: Page) => {
  await page.addInitScript(() => {
    const tools = new Map<string, WebMcpTool>();
    window.webMcpTools = tools;
    Object.defineProperty(document, "modelContext", {
      value: {
        registerTool: async (tool: WebMcpTool) => {
          await Promise.resolve();
          tools.set(tool.name, tool);
        },
        unregisterTool: async (name: string) => {
          await Promise.resolve();
          tools.delete(name);
        },
      },
    });
  });
};

const callTool = async (page: Page, name: string, input: ToolInput) =>
  await page.evaluate(
    async ({ toolInput, toolName }) => {
      const tool = window.webMcpTools?.get(toolName);

      if (!tool) {
        throw new Error(`No ${toolName} tool`);
      }

      return JSON.stringify(await tool.execute(toolInput));
    },
    { toolInput: input, toolName: name }
  );

test("a browser agent can read the trainer and change its drill", async ({
  page,
}) => {
  await stubWebMcp(page);
  await openPage(page, "/circle/");
  await expect(pauseButton(page)).toBeVisible();

  const snapshot = await callTool(page, "snapshot", {});

  for (const label of [
    "Language",
    "Open guide",
    "Open controls",
    "Pause motion",
    "Drill",
    "Motion path",
    "Header target size",
    "Header target speed",
  ]) {
    expect(snapshot, `${label} is missing from the snapshot`).toContain(
      `"label":"${label}"`
    );
  }

  const result = await callTool(page, "act", {
    steps: [
      { action: "setValue", args: ["Figure eight"], ref: "Motion path" },
      { action: "setValue", args: [30], ref: "Header target speed" },
    ],
  });

  expect(result).toContain('"ok":true');
  await expect(page).toHaveURL(/\/figure-eight\/$/u);
  await expect
    .poll(async () => await readSettings(page))
    .toMatchObject({ patternId: "figureEight", speed: 30 });
});

test("a browser agent cannot reset settings without the person", async ({
  page,
}) => {
  await stubWebMcp(page);
  await openPage(page, "/circle/");
  await openControls(page);
  await openTab(page, "General");

  const result = await callTool(page, "act", {
    steps: [
      {
        action: "press",
        args: ["Reset to defaults"],
        ref: "Reset to defaults",
      },
    ],
  });

  expect(result).toContain('"ok":false');
});

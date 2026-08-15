import { expect, test } from "@playwright/test";

const trainingModes = [
  { name: "Smooth Pursuit", path: "/smooth-pursuit/" },
  { name: "Reaction Jumps", path: "/reaction-jumps/" },
  { name: "Multiple Distractions", path: "/multiple-distractions/" },
  { name: "Lilac Chaser", path: "/lilac-chaser/" },
] as const;

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required.");
  }

  await context.addCookies([
    {
      name: "PARAGLIDE_LOCALE",
      url: baseURL,
      value: "en",
    },
  ]);
});

for (const mode of trainingModes) {
  test(`${mode.name} loads with active visuals`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.goto(mode.path);

    await expect(
      page.getByRole("main", { name: /eye trainer app/iu })
    ).toBeVisible();
    const selectedDesktopMode = page
      .getByRole("button", { exact: true, name: "Drill" })
      .filter({ hasText: new RegExp(mode.name, "iu") });
    const selectedMobileMode = page.getByRole("button", {
      name: new RegExp(`^Drill: ${mode.name}$`, "iu"),
    });
    await expect(selectedDesktopMode.or(selectedMobileMode)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pause motion" })
    ).toBeVisible();

    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    const initialFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
      element.toDataURL()
    );

    await expect
      .poll(
        () =>
          canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()),
        { timeout: 3000 }
      )
      .not.toBe(initialFrame);

    expect(pageErrors).toEqual([]);
  });
}

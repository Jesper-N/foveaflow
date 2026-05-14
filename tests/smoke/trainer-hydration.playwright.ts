import { expect, test } from "@playwright/test";

test("trainer hydrates without browser runtime errors", async ({ page }) => {
  const runtimeErrors: string[] = [];

  page.on("pageerror", (error) => {
    runtimeErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/");

  await expect(page.getByTestId("trainer-canvas")).toBeVisible();
  await expect(page.getByRole("main")).toHaveAttribute(
    "aria-label",
    "FoveaFlow eye trainer app",
  );

  expect(runtimeErrors).toEqual([]);
});

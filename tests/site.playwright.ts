import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { articles } from "../src/lib/content/articles";
import { legalPages } from "../src/lib/content/legal";
import { expectNoHorizontalScroll, openPage, test } from "./fixtures";

const contentPages = [
  "/guide/",
  ...Object.values(legalPages).map(({ path }) => path),
  ...articles.map(({ path }) => path),
];

/** Same-site links, without their query or fragment. */
const INTERNAL_LINK_PATTERN = /<a\b[^>]*\shref="(?<href>\/[^"#?]*)/gu;

const languageSelect = (page: Page) =>
  page.getByRole("combobox", { exact: true, name: "Language" });

for (const path of contentPages) {
  test(`${path} renders one heading and fits the screen`, async ({ page }) => {
    await openPage(page, path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expectNoHorizontalScroll(page);
  });
}

test("content pages link only to pages that exist", async ({ request }) => {
  const fetchHtml = async (path: string) => {
    const response = await request.get(path);

    return await response.text();
  };

  const pages = await Promise.all(contentPages.map(fetchHtml));

  const links = new Set(
    pages.flatMap((html) =>
      [...html.matchAll(INTERNAL_LINK_PATTERN)].map(
        ({ groups }) => groups?.["href"] ?? ""
      )
    )
  );

  expect(links.size, "The pages should have links to check").toBeGreaterThan(0);

  const statuses = await Promise.all(
    [...links].map(async (href) => {
      const response = await request.get(href);

      return `${href} ${response.status()}`;
    })
  );

  expect(statuses).toEqual([...links].map((href) => `${href} 200`));
});

// Preloads let a page download its scripts together instead of one import
// level at a time.
for (const path of ["/", "/guide/"]) {
  test(`${path} preloads exactly the scripts it loads at startup`, async ({
    page,
  }) => {
    await openPage(page, path);
    await page.waitForLoadState("networkidle");

    const { loaded, preloaded } = await page.evaluate(() => ({
      loaded: performance
        .getEntriesByType("resource")
        .map(({ name }) => new URL(name).pathname)
        .filter((pathname) => pathname.endsWith(".js")),
      preloaded: [
        ...document.querySelectorAll<HTMLLinkElement>(
          'link[rel="modulepreload"]'
        ),
      ].flatMap(({ href, media }) =>
        media === "" || matchMedia(media).matches
          ? [new URL(href).pathname]
          : []
      ),
    }));

    expect(loaded.length, "The page should load scripts").toBeGreaterThan(0);
    expect([...new Set(loaded)].toSorted()).toEqual(preloaded.toSorted());
  });
}

test("an unknown path shows the not found page", async ({ page }) => {
  const response = await page.goto("/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This path ends here");
  await expect(
    page.getByRole("link", { name: "Open FoveaFlow" }).last()
  ).toHaveAttribute("href", "/");
});

test.describe("in a German browser", () => {
  test.use({ locale: "de-DE" });

  test("the trainer starts in German until another language is saved", async ({
    page,
    baseURL,
  }) => {
    await page.context().clearCookies();
    await openPage(page, "/");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(
      page.getByRole("button", { exact: true, name: "Bewegung pausieren" })
    ).toBeVisible();

    await page
      .context()
      .addCookies([{ name: "PARAGLIDE_LOCALE", url: baseURL, value: "en" }]);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("button", { exact: true, name: "Pause motion" })
    ).toBeVisible();
  });
});

test("a language chosen in the menu is kept after a reload", async ({
  page,
}) => {
  await openPage(page, "/guide/");
  await expect(page.locator("h1")).toHaveText("FoveaFlow Guide");
  await languageSelect(page).click();
  await page.getByRole("option", { name: "Deutsch (German)" }).click();
  await expect(page.locator("h1")).toHaveText("FoveaFlow-Guide");
  await page.reload();
  await expect(page.locator("h1")).toHaveText("FoveaFlow-Guide");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("menus, panels and theme changes stay inside the content security policy", async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      sessionStorage.setItem(
        "csp-violation",
        `${event.violatedDirective} ${event.blockedURI}`
      );
    });
  });

  const violation = async () =>
    await page.evaluate(() => sessionStorage.getItem("csp-violation"));

  await openPage(page, "/circle/");
  await page.keyboard.press("d");
  await page.keyboard.press("d");
  await page.keyboard.press("s");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("p");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await violation()).toBeNull();

  await openPage(page, "/guide/");
  await languageSelect(page).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await violation()).toBeNull();
});

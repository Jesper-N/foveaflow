import { expect, test } from "bun:test";

import {
  drillRoutes,
  findDrillRoute,
  routeForDrill,
  slugFromPath,
} from "../../src/lib/content/drill-routes";
import { drills, getDrill } from "../../src/lib/trainer/settings/drills";
import { pursuitPatterns } from "../../src/lib/trainer/settings/patterns";
import {
  createDefaultSettings,
  withRoute,
} from "../../src/lib/trainer/settings/settings";

// Choosing a drill or path in the menus moves to its page.
test("every drill and Smooth Pursuit path has its own page", () => {
  const choices = [
    ...drills
      .filter(({ id }) => id !== "pursuit")
      .map(({ id, patternId }) => ({ drillId: id, patternId })),
    ...pursuitPatterns.map(({ id }) => ({
      drillId: "pursuit" as const,
      patternId: id,
    })),
  ];
  for (const { drillId, patternId } of choices) {
    const route = routeForDrill(drillId, patternId);
    expect(route?.drillId).toBe(drillId);
    expect(withRoute(createDefaultSettings(), route)).toMatchObject({
      drillId,
      patternId,
    });
  }
});

test("page slugs are unique and found from their URL", () => {
  const slugs = drillRoutes.map(({ slug }) => slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  for (const route of drillRoutes) {
    expect(route.path).toBe(`/${route.slug}/`);
    expect(findDrillRoute(slugFromPath(`${route.path}?ref=test`))).toBe(route);
  }
});

test("the home page opens the default drill", () => {
  const settings = createDefaultSettings(getDrill("lilacChaser"));
  expect(findDrillRoute(slugFromPath("/"))).toBeNull();
  expect(withRoute(settings, null)).toMatchObject({
    drillId: "pursuit",
    patternId: "randomWalk",
  });
});

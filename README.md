<a href="https://foveaflow.com/">
  <img src="docs/images/preview.avif" width="100%" alt="FoveaFlow open in a browser" />
</a>

# <img src="public/logo-render/logo.svg" width="32" height="32" alt="" align="absmiddle" /> FoveaFlow

Eye training in a browser tab. Four drills cover visual tracking, quick refocus, focus under distraction, and peripheral awareness. It's free and needs no account. Your settings stay in your browser.

**[Open FoveaFlow](https://foveaflow.com/)**, or read [the guide](https://foveaflow.com/guide/) first.

## Drills

| Drill | What you practice |
| :-- | :-- |
| [Smooth Pursuit](https://foveaflow.com/smooth-pursuit/) | Following one target along a path. There are 20, from an easy circle to hard turns and random routes. |
| [Reaction Jumps](https://foveaflow.com/reaction-jumps/) | Finding the target again each time it jumps somewhere new. |
| [Multiple Distractions](https://foveaflow.com/multiple-distractions/) | Staying on the bright target while dimmer copies cross its path. |
| [Lilac Chaser](https://foveaflow.com/lilac-chaser/) | Holding your gaze on the center cross while the ring around it changes. |

Each drill has its own URL, so bookmark the one you use most. Start with a big target at a slow speed. You can change both while the drill runs.

## Run it locally

You need [Bun](https://bun.com/) 1.4.5 and Node.js 26, the version in `.node-version`. Node 22.22.2 or 24.15.0 is the minimum.

```bash
git clone https://github.com/Jesper-N/foveaflow.git
cd foveaflow
bun install   # also points git at the hooks in .githooks
bun run dev   # http://127.0.0.1:4321
```

Other scripts run the same way, as `bun run <script>`:

| Script | What it does |
| :-- | :-- |
| `build` | Builds the site into `dist/` |
| `preview` | Builds, then serves `dist/` through Wrangler the way production does |
| `lint` | Checks code and formatting with Ultracite, including type-aware rules, then Svelte components with ESLint |
| `fix` | Applies Ultracite fixes and formats every file |
| `check` | Type-checks Astro, Svelte, and TypeScript with `astro check` and `svelte-check` |
| `check:i18n` | Checks that every UI string is translated into all 10 languages and still in use |
| `test:unit` | Runs the unit tests in `tests/unit/` |
| `test:browser` | Builds, then runs Playwright in desktop and mobile Chromium |
| `verify` | Runs everything CI runs: formatting, types, translations, Tailwind classes, all tests, and the dependency audit |

## Tests and deploys

The pre-commit hook runs `bun run lint`. The pre-push hook runs `bun run verify`. GitHub Actions runs the same checks as parallel jobs on every pull request, plus a weekly dependency audit. Each push to `main` deploys to Cloudflare Workers once every job passes.

- Install Chromium for the browser tests once with `bunx playwright install chromium`. They serve the build on port 4323. Set `TEST_PORT` if something else has it.
- A snapshot in `tests/unit/__snapshots__/` locks every motion path. If you meant to change how a target moves, update it with `bun test tests/unit --update-snapshots`. If you didn't, the snapshot caught a bug.
- UI text is keyed by its English wording. A new string needs an entry in all 10 files in `src/lib/i18n/dictionaries/`, and `check:i18n` names any it can't find.

## How it's built

[Astro](https://astro.build/) renders the pages. The controls are [Svelte 5](https://svelte.dev/) components built on [ui-sdk](https://ui-sdk.dev/) and styled with [Tailwind CSS 4](https://tailwindcss.com/). The design system is in [`docs/design/system.md`](docs/design/system.md). The drills run on a canvas engine in plain TypeScript, with no framework code inside it. [Cloudflare Workers](https://workers.cloudflare.com/) serves the site.

<details>
<summary>Where things live</summary>

```text
src/pages/                   Routes, plus the sitemap, robots.txt, and llms.txt endpoints
src/layouts/                 The page shell every route uses
src/lib/trainer/engine/      Motion paths, speed, and seeded randomness
src/lib/trainer/canvas/      Render loop, targets, trail, and grid
src/lib/trainer/settings/    Drills, options, and saved settings
src/lib/components/trainer/  The trainer app: state, controls, and guide
src/lib/components/ui/       Buttons, selects, sliders, and other parts built on ui-sdk
src/lib/components/icons/    Drill, path, and target glyphs and illustrations
src/lib/components/site/     Guide, article, and legal pages
src/lib/content/             Page copy, routes, and guides
src/lib/i18n/                Dictionaries for 10 languages
src/lib/seo/                 Structured data and machine-readable files
src/styles/                  Global styles
scripts/                     Build, lint, translation, glyph, and profiling scripts
docs/design/                 Design system and the references behind it
tests/unit/                  Unit tests, run by Bun
tests/*.playwright.ts        Browser tests, run by Playwright
```

</details>

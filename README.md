<p align="center">
  <a href="https://foveaflow.com/"><img src="public/logo-render/logo.svg" width="64" height="64" alt="foveaflow.com" /></a>
</p>

<h1 align="center">FoveaFlow</h1>

<p align="center">
  <strong>Eye training, right in your browser.</strong><br />
  Follow a moving target, practice quick refocus, or hold your gaze through distractions.<br />
  It's free, with no account or install.
</p>

<p align="center">
  <a href="https://foveaflow.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/buttons/open-dark.avif" /><img src="docs/images/buttons/open-light.avif" height="40" alt="Open FoveaFlow" /></picture></a>
  &nbsp;
  <a href="https://foveaflow.com/guide/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/buttons/guide-dark.avif" /><img src="docs/images/buttons/guide-light.avif" height="40" alt="Read the guide" /></picture></a>
</p>

<p align="center">
  <a href="https://github.com/Jesper-N/foveaflow/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/Jesper-N/foveaflow/deploy.yml?branch=main&style=flat-square&label=deploy" alt="Deploy status" /></a>
  <img src="https://img.shields.io/badge/languages-10-blue?style=flat-square" alt="Available in 10 languages" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Jesper-N/foveaflow?style=flat-square" alt="MIT license" /></a>
</p>

<br />

<a href="https://foveaflow.com/">
  <img src="docs/images/preview.avif" width="100%" alt="FoveaFlow open in a browser, with a yellow tracking target and floating controls on a dark grid, against an orange background" />
</a>

## Pick a drill

Each drill has its own URL, so you can bookmark the one you use most.

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://foveaflow.com/smooth-pursuit/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/drills/smooth-pursuit-dark.avif" /><img src="docs/images/drills/smooth-pursuit-light.avif" width="100%" alt="The Smooth Pursuit target traces a figure eight with its trail turned on" /></picture></a>
      <h3>Smooth Pursuit</h3>
      <p>Follow one target along a moving path. Choose a steady sweep, a figure eight, or random motion.</p>
      <a href="https://foveaflow.com/smooth-pursuit/">Try this drill ↗</a>
    </td>
    <td width="50%" valign="top">
      <a href="https://foveaflow.com/reaction-jumps/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/drills/reaction-jumps-dark.avif" /><img src="docs/images/drills/reaction-jumps-light.avif" width="100%" alt="The Reaction Jumps target jumps to a new spot on the grid" /></picture></a>
      <h3>Reaction Jumps</h3>
      <p>Find the target each time it jumps to a new position. Adjust the pace as you go.</p>
      <a href="https://foveaflow.com/reaction-jumps/">Try this drill ↗</a>
    </td>
  </tr>
</table>

<!-- Two one-row tables: GitHub stripes every second table row, which would tint the lower cards. -->
<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://foveaflow.com/multiple-distractions/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/drills/multiple-distractions-dark.avif" /><img src="docs/images/drills/multiple-distractions-light.avif" width="100%" alt="One bright target moves among darker distractors in Multiple Distractions" /></picture></a>
      <h3>Multiple Distractions</h3>
      <p>Keep track of the brightest target among moving distractors. Control their number and brightness.</p>
      <a href="https://foveaflow.com/multiple-distractions/">Try this drill ↗</a>
    </td>
    <td width="50%" valign="top">
      <a href="https://foveaflow.com/lilac-chaser/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/drills/lilac-chaser-dark.avif" /><img src="docs/images/drills/lilac-chaser-light.avif" width="100%" alt="A gap moves around a ring of magenta balls while the cross stays in the center, in Lilac Chaser" /></picture></a>
      <h3>Lilac Chaser</h3>
      <p>Hold your gaze on the center while noticing changes around it. Tune the ring's scale and color.</p>
      <a href="https://foveaflow.com/lilac-chaser/">Try this drill ↗</a>
    </td>
  </tr>
</table>

Start with a large target and a slow speed, then adjust both while the drill runs. Your settings stay in your browser.

> [!IMPORTANT]
>
> FoveaFlow is practice software, not medical care. Stop if you feel eye strain, dizziness, headache, nausea, or other discomfort. If you have an eye condition, light sensitivity, seizures, or recent eye surgery, ask a qualified clinician before using visual training tools.

## Run locally

| Requirement | Version |
| :-- | :-- |
| [Bun](https://bun.com/) | 1.4.1 |
| [Node.js](https://nodejs.org/) | 24, from `.node-version` (22.12.0 at minimum) |

```bash
git clone https://github.com/Jesper-N/foveaflow.git
cd foveaflow
bun install
bun run dev  # http://127.0.0.1:4321
```

## Built with

| Part | Tools |
| :-- | :-- |
| Site | [Astro](https://astro.build/) |
| Controls | [Svelte 5](https://svelte.dev/), [shadcn-svelte](https://www.shadcn-svelte.com/), [Bits UI](https://bits-ui.com/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Drills | A TypeScript canvas engine in `src/lib/trainer/` |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com/) |

## Commands

| Command                | What it does                                    |
| :--------------------- | :---------------------------------------------- |
| `bun run dev`          | Start the dev server                            |
| `bun run build`        | Build the production site and its CSP headers   |
| `bun run preview`      | Build and serve the site through Wrangler       |
| `bun run check`        | Type-check Astro, Svelte, and TypeScript        |
| `bun run check:i18n`   | Check every string is translated and used       |
| `bun run lint`         | Check code and formatting with Ultracite        |
| `bun run fix`          | Apply Ultracite fixes and format Astro files    |
| `bun run test`         | Run the unit tests, then the browser tests      |
| `bun run test:unit`    | Run the unit tests                              |
| `bun run test:browser` | Build the site and run the browser tests        |
| `bun run verify`       | Run all checks, tests, and the dependency audit |

## Tests and deployment

- `bun install` turns on the git hooks. Pre-commit checks formatting, and pre-push runs `bun run verify`.
- The unit tests in `tests/unit/` cover motion, settings, saved-settings migrations, drill routes, and shortcuts. A snapshot locks every motion path; update it with `bun test tests/unit --update-snapshots` only when a motion change is intended.
- The browser tests build the site and run it in desktop and mobile Chromium. `tests/trainer.playwright.ts` covers every trainer route and the controls; `tests/site.playwright.ts` covers the content pages, links, the 404 page, and languages. Install the browser once with `bunx playwright install chromium`, and set `TEST_PORT` if port 4323 is taken.
- GitHub Actions runs `bun run verify` on pull requests and deploys `main` to Cloudflare.

## Project structure

```text
src/pages/                   Astro routes and text endpoints (sitemap, llms.txt)
src/layouts/                 Page shell shared by every route
src/lib/trainer/engine/      Motion patterns, speed profiles, seeded randomness
src/lib/trainer/canvas/      Canvas loop and drawing
src/lib/trainer/settings/    Drills, options, and saved settings
src/lib/components/trainer/  Trainer app: state, island, controls, guide
src/lib/components/site/     Guide, article, and legal pages
src/lib/components/ui/       shadcn-svelte components
src/lib/content/             Page copy, routes, and guides
src/lib/i18n/                Translations for 10 languages
src/lib/seo/                 Structured data and machine-readable files
src/styles/                  Global styles and Tailwind setup
public/                      Logo, icons, and social image
tests/unit/                  Unit tests
tests/                       Desktop and mobile browser tests
docs/images/                 README images and drill clips
```

## Ideas for later

- Session history and basic progress stats.
- Guided routines for warmups, tracking, reaction drills, and cooldowns.
- Exportable presets.

---

<p align="center">
  <sub><a href="https://foveaflow.com/">foveaflow.com</a> &nbsp;·&nbsp; <a href="LICENSE">MIT license</a></sub>
</p>

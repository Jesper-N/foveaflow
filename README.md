<p align="center">
  <img src="public/logo-render/logo.svg" width="56" height="56" alt="" />
</p>

<h1 align="center">FoveaFlow</h1>

<p align="center">
  Eye training drills in your browser.<br />
  Free, no account, settings stay on your device.
</p>

<p align="center">
  <a href="https://foveaflow.com/"><b>Open FoveaFlow</b></a>
  &nbsp;·&nbsp;
  <a href="https://foveaflow.com/guide/">Guide</a>
  &nbsp;·&nbsp;
  <a href="docs/design/system.md">Design system</a>
</p>

<br />

<a href="https://foveaflow.com/">
  <img src="public/metadata/og-v2.jpg" width="100%" alt="FoveaFlow: train your eyes in the browser" />
</a>

<br />

## Drills

| Drill | Trains |
| :-- | :-- |
| [Smooth Pursuit](https://foveaflow.com/smooth-pursuit/) | Following one target along 20 paths, from a slow circle to hard turns |
| [Reaction Jumps](https://foveaflow.com/reaction-jumps/) | Finding the target again after it jumps |
| [Multiple Distractions](https://foveaflow.com/multiple-distractions/) | Staying on the bright target while dimmer ones cross it |
| [Lilac Chaser](https://foveaflow.com/lilac-chaser/) | Holding your gaze on the center while the ring changes |

## Development

Needs [Bun](https://bun.com/) 1.4.5 and Node.js 26 (see `.node-version`).

```bash
git clone https://github.com/Jesper-N/foveaflow.git
cd foveaflow
bun install
bun run dev    # http://127.0.0.1:4321
```

| Command | Does |
| :-- | :-- |
| `bun run dev` | Starts the dev server |
| `bun run build` | Builds the static site into `dist/` |
| `bun run preview` | Serves the build through Wrangler, like production |
| `bun run fix` | Applies lint fixes and formatting |
| `bun run verify` | Runs everything CI runs: lint, types, translations, tests, audit |

### Before you push

- Browser tests need Chromium once: `bunx playwright install chromium`. They serve the build on port 4323; set `TEST_PORT` to change it.
- New UI text needs an entry in all 10 dictionaries in `src/lib/i18n/dictionaries/`.
- `tests/unit/__snapshots__/` locks every motion path. Update it with `bun test tests/unit --update-snapshots` only when a path should move differently.
- Commits run `lint`, pushes run `verify`, and `main` deploys to Cloudflare Workers once CI passes.

## Stack

[Astro](https://astro.build/), [Svelte 5](https://svelte.dev/), [ui-sdk](https://ui-sdk.dev/), [Tailwind CSS 4](https://tailwindcss.com/) and [Cuelume](https://github.com/danielwh2/cuelume) sounds, served by [Cloudflare Workers](https://workers.cloudflare.com/). The drills run on a canvas engine in plain TypeScript.

## License

[MIT](LICENSE)

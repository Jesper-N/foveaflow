# Eye Trainer

[![Astro](https://img.shields.io/badge/Astro-6.1-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![Svelte](https://img.shields.io/badge/Svelte-5.55-ff3e00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-ready-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Eye Trainer](https://eye-trainer.app/) is a free browser visual tracking tool for gamers, IT workers, and heavy screen users. It includes smooth pursuit paths, reaction jumps, random motion, peripheral awareness, and distractor tracking.

It runs without an account or install. The app keeps the canvas full screen, gives direct control over target motion, and stores settings on the current device with `localStorage`.

## What it does

- Runs three drills: Smooth Pursuit, Reaction jumps, and Multiple Distractions.
- Includes motion paths such as random, figure eight, bounce, sweeps, lissajous, shifting orbit, and corner tour.
- Supports speed controls in `deg/s`, `cm/s`, and `screen/s`.
- Lets you tune target size, shape, color, opacity, trail behavior, distractor count, and distractor brightness.
- Includes calibration settings for viewing distance and CSS pixels per centimeter.
- Persists settings in `localStorage`.
- Uses a canvas renderer with light and dark themes.
- Keeps safety checks close to the engine, including saturated-red replacement and flash-frequency helpers.

## Good search matches

- free eye tracking trainer
- smooth pursuit practice
- visual tracking exercise
- reaction time trainer
- multiple object tracking trainer
- peripheral vision practice
- browser eye trainer
- eye tracking trainer for gamers
- FPS eye training warmup
- visual tracking practice for IT workers
- screen work eye tracking practice
- eye tracking practice for screen fatigue
- visual tracking practice for tired eyes

## Background reading

- [Visual guidance of smooth pursuit eye movements](https://pmc.ncbi.nlm.nih.gov/articles/PMC2887486/)
- [Visual learning in multiple-object tracking](https://pmc.ncbi.nlm.nih.gov/articles/PMC2375111/)
- [FPS Eye Training Warmup (HIGH FPS)](https://www.youtube.com/watch?v=WAPKAZhOFM4)

## Tech stack

- [Astro](https://astro.build/) for the app shell.
- [Svelte 5](https://svelte.dev/) for the trainer UI.
- [TypeScript](https://www.typescriptlang.org/) for application and engine code.
- [Tailwind CSS 4](https://tailwindcss.com/) for styling.
- [shadcn-svelte](https://www.shadcn-svelte.com/) and [bits-ui](https://bits-ui.com/) for UI primitives.
- [Bun](https://bun.sh/) for dependency management and scripts.

## Quick start

Requirements:

- Bun
- Node.js `>=22.12.0`

Install dependencies:

```bash
bun install
```

Start the local dev server:

```bash
bun run dev
```

Astro serves the app at:

```text
http://127.0.0.1:4321
```

## Scripts

| Command                 | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `bun run dev`           | Starts the Astro dev server on `127.0.0.1`.           |
| `bun run build`         | Builds the production app.                            |
| `bun run preview`       | Serves the built app locally.                         |
| `bun run lint`          | Runs `astro check`.                                   |
| `bun run check`         | Runs `astro check`.                                   |
| `bun run format`        | Formats the whole project with Prettier.              |
| `bun run format:svelte` | Formats Svelte, Astro, TypeScript, and CSS src files. |

## Project structure

```text
src/pages/                 Astro routes
src/lib/components/        Svelte app and UI components
src/lib/engine/            Training patterns, profiles, metrics, safety, storage
src/styles/                Global styles and Tailwind setup
public/metadata/           Generated icons and social images
```

## Quality checks

Run the same checks before shipping changes:

```bash
bun run lint
bun run format
bun run check
```

Use `bun run format:svelte` when you only need to format source files after Svelte, Astro, TypeScript, or CSS edits.

## Safety note

Eye Trainer is practice software, not medical care. Stop if you feel eye strain, dizziness, headache, nausea, or any other discomfort. If you have an eye condition, light sensitivity, seizures, or recent eye surgery, ask a qualified clinician before using visual training tools.

## Roadmap

- Session history with basic progress stats.
- Guided routines for warmups, tracking, reaction drills, and cooldowns.
- Keyboard controls for common actions.
- Better calibration flow for screen size and viewing distance.
- Exportable presets.
- Demo GIF and short usage clips.

## License

MIT. See [LICENSE](LICENSE).

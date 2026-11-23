# FoveaFlow

Browser app for vision training: visual tracking, focus, reaction speed, and peripheral awareness. No account or install; settings stay in the browser.

## How to work

- Deliver what was asked, at the scope asked. Put any bug, cleanup, or improvement the task doesn't need in your final report as a suggestion, and leave it out of the diff.
- Fight for the obvious solution: the one a good engineer or agent would expect first, even when it is not the shortest path.
- Prefer explicit, boring, easy-to-debug code that feels almost too plain. Use local patterns before new abstractions.
- Add deps, wrappers, compat layers, or refactors only when the task needs them.
- Push back when a request points toward cleverness, hidden behavior, or needless indirection.
- Keep performance and security in first priority.
- Never bypass, disable, or weaken an Ultracite, Oxlint, Oxfmt, or anti-slop rule, and never commit with `--no-verify`. Fix the root cause.
- Work is done when lint passes and the checks that exercise your change pass. If one can't run, say which and why.
- Report what changed, what you ran, and what's left. No theater.
- GitHub Actions deploys `main`. Don't deploy from a local session unless asked.

## UI

- `docs/design/system.md` is the source of truth for tokens, components, motion, and page layouts. Keep it in sync with `src/styles/global.css` and `src/lib/components/ui/`.
- Interactive parts use ui-sdk (`@ui-sdk/svelte`). Before changing one, read `node_modules/@ui-sdk/svelte/docs/llms.txt` and the component's page in `docs/components/`.
- Use Tailwind utilities for all supported styling, including responsive layouts and interaction states. Keep custom CSS for unsupported styling and keyframes.
- Reuse repeated utility groups through component variants, shared class constants, or Tailwind utilities. Keep one-off layouts local to their component.
- Check UI changes in a browser at desktop and mobile widths, in light and dark themes.

## Gotchas

- The strict CSP lives in `security.csp` in `astro.config.mjs`, and Astro only writes it into built pages. So a new third-party script, font, image host, or API works in dev and breaks in prod. Ask before adding one. Astro hashes the scripts it bundles, but an `is:inline` script must register its own hash with `Astro.csp?.insertScriptHash(inlineScriptHash(script))` from `src/lib/csp.ts`.
- If controls do nothing in dev and the console shows `504 Outdated Optimize Dep`, the Vite dependency cache is stale. Stop the server, delete `node_modules/.vite`, restart, and hard-reload.

## Quality pass

Before finishing a code task, say the pass started, then make the code you touched simpler, clearer, faster, and safer where the change reasonably allows. Remove temp code, dead code, unused helpers, redundant wrappers, needless abstraction, and "works but ugly" shortcuts. Then run the checks that cover the change and report the results.

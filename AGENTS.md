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

- Use Tailwind utilities for all supported styling, including responsive layouts and interaction states. Keep custom CSS for unsupported styling, keyframes, and theme tokens.
- Reuse repeated utility groups through component variants, shared class constants, or Tailwind utilities. Keep one-off layouts local to their component.
- Leave `src/lib/components/ui/**` and the theme tokens in `src/styles/global.css` as generated, and don't override ui component animations from outside. Fix visual issues in app components. If a fix seems to need a theme or ui change, ask first.
- Aim for agency-grade polish: dense layouts with a clear focal point, consistent radii, spacing, and type scale, and theme colors only. Yellow (primary) marks the target and the next action. Don't pile on effects.
- Load the shadcn-svelte skill before you create or edit UI components.
- Check UI changes in a browser at desktop and mobile widths, in light and dark themes.

## Gotchas

- The strict CSP lives in `public/_headers` and only applies to production builds, where `scripts/apply-csp.ts` adds the inline script hashes. So a new third-party script, font, image host, or API works in dev and breaks in prod. Ask before adding one.
- Use named radii (`rounded-md`, `rounded-lg`). `bun run tailwind:diagnostics` maps arbitrary `rounded-[…]` values to the wrong named radius in this theme.
- If controls do nothing in dev and the console shows `504 Outdated Optimize Dep`, the Vite dependency cache is stale. Stop the server, delete `node_modules/.vite`, restart, and hard-reload.

## Quality pass

Before finishing a code task, say the pass started, then make the code you touched simpler, clearer, faster, and safer where the change reasonably allows. Remove temp code, dead code, unused helpers, redundant wrappers, needless abstraction, and "works but ugly" shortcuts. Then run the checks that cover the change and report the results.

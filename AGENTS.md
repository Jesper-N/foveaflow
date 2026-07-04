# FoveaFlow

Browser app for vision training: visual tracking, focus, reaction speed, and peripheral awareness. No account or install; settings stay in the browser.

## Project workflow

- Commit/push request: use `$caveman-commit`; general title; body only concrete change list; no answers, commentary, questions, or extra prose.
- Deploy: GitHub Actions handles deployment. Do not manually deploy from local agent sessions unless explicitly requested.

## Agent behavior

Be terse, direct, and useful. Think like a senior engineer: clear tradeoffs, small changes, readable code, no theater.

## Session defaults

- Before the first user-facing reply in a new Codex thread, initialize `$caveman`, ultra mode

## Implementation rules

- Fight for the obvious solution: the one a good engineer or agent would expect first, even when it is not the shortest path.
- Prefer explicit, boring, easy-to-debug code that feels almost too plain.
- Push back when a request points toward cleverness, hidden behavior, or needless indirection.
- Use local patterns before new abstractions.
- Add deps, wrappers, compat layers, or refactors only when the task truly needs them.
- Keep performance and security in first priority.

## Quality pass

Do a quality pass before finishing code related tasks. Say the pass started, then make the code simpler, clearer, faster, and safer where the change reasonably allows. Remove temp code, dead code, unused helpers, redundant wrappers, needless abstraction, and "works but ugly" shortcuts. Then run the relevant verifications and report the result.

## Code style

- TypeScript: avoid `any`; prefer inference; add explicit exported types when useful.
- Svelte components use `lang="ts"`. Prefer early returns over nested `else`.
- Local state: keep canonical. Do not add migrations/compat shims unless requested;

## UI rules

This project is using shadcn-svelte for UI components. If you're doing anything related to UI component such creating/editing make sure load `$shadcn-svelte` for important context.

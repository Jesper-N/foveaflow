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

After implementing, do a quality pass before final tests. Say the pass started, then make the code simpler, clearer, faster, and safer where the change reasonably allows. Remove temp code, dead code, unused helpers, redundant wrappers, needless abstraction, and "works but ugly" shortcuts. Then run the relevant verification once and report the result.

## Code style

- TypeScript: avoid `any`; prefer inference; add explicit exported types when useful.
- Svelte components use `lang="ts"`. Prefer early returns over nested `else`.
- Local state: keep canonical. Do not add migrations/compat shims unless requested;

## UI rules

- Before new UI component, check https://www.shadcn-svelte.com/docs/components.md and existing `src/lib/components/ui/**`; use fitting shadcn-svelte primitive if available.
- Treat `src/lib/components/ui/**` as shadcn-owned vendor code. Do not edit, reformat, or canonicalize unless user explicitly asks for shadcn component change.
- For `src/lib/components/ui/**` style variants, prefer `tailwind-variants` component API over app-only CSS classes.
- Prefer Tailwind scale utilities/tokens over arbitrary values when equivalent exists.

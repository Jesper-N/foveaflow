## Project

- Eye trainer with the goal of improving eye muscles, vision, peripheral vision, all kinds of visual perception stuff like colors etc and improve reaction time.

## Project guidelines

- Use `bun`.
- Add packages with `bun add`. Do not hand-edit `package.json`.
- Use modern Astro/Svelte/Typescript patterns + primitives.
- Avoid `as any`. Infer types where possible.
- Every Svelte component uses `lang="ts"`.
- After edits run `bun run lint`, `bun run format`, `bun run check`.

## Core Principles

- **Priority:** Performance, security, simplicity, readability first, maintainability. Prefer clear code over clever abstractions. Make implementations secure + fast by default.

## Code Style

- **Formatting:** After edits run `bun run format`. If Svelte changed, use `bun run format:svelte`, not `oxfmt` alone.
- **Functions:** Keep code in one fn unless composable or reusable.
- **Error Handling:** Fail fast. In SvelteKit load fns and server actions, use `throw error(status, message)` from `@sveltejs/kit`, not raw JS `Error`.
- **TypeScript:**
  - No `any`.
  - Prefer inference. Add explicit types or interfaces only when needed for exports or clarity.
  - Prefer `flatMap`, `filter`, `map` over `for` loops. Use type guards on `filter` to keep downstream inference.
  - Avoid unnecessary destructuring in TS logic; use dot notation for context. **(Exception: Svelte component `$props()` destructuring allowed and expected).**
  - Prefer early returns over nested `else`.

## Naming Conventions

- Use descriptive `camelCase` for variables, params, functions like `config`, `processId`, `options`.
- Use `PascalCase` for Svelte components, Types, Interfaces.
- Avoid generic or over-short names unless context is very narrow, like short map fn.

## Hard-Cut Product Policy

- No external installed user base. Optimize for one canonical current-state impl, not historical local-state compatibility.
- Do not keep or add compatibility bridges, migration shims, fallback paths, compact adapters, dual behavior for old local states unless user explicitly asks.
- Prefer:
  - one canonical current-state codepath
  - fail-fast diagnostics
  - explicit recovery steps
    over:
  - automatic migration
  - compatibility glue
  - silent fallbacks
  - "temporary" second paths
- If temporary migration or compatibility code is added for debugging or narrow transition, call out in same diff:
  - why it exists
  - why canonical path is insufficient
  - exact deletion criteria
  - ADR/task tracking removal
- Default stance: delete old-state compatibility code, do not carry it forward.

## shadcn-svelte

- Before new UI component, check https://www.shadcn-svelte.com/docs/components. If component exists, use it instead of building from scratch.
- When styling `src/lib/components/ui/**`, add supported options to component API with `tailwind-variants` (`tv`), for example variant `'rose'`.
- Do not use app-level CSS classes like `rose-cta` for shadcn component styling when style belongs in component.
- Barrel exports live in `src/lib/components/ui/<name>/index.ts`.

## Tailwind CSS

- Prefer canonical Tailwind utilities + scale tokens over arbitrary values when exact equivalent exists.
- Prefer existing shared utilities before new class bundles.
- Check `src/routes/layout.css` for shared `@utility` blocks like `shell` or `frame`. If same UI pattern appears multiple places, prefer shared utility there.
- Create shared utility only when abstraction is clear and CSS would otherwise duplicate.

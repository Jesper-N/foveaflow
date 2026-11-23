# FoveaFlow design system

The source of truth for how FoveaFlow looks, moves, and is built. Tokens live in [`src/styles/global.css`](../../src/styles/global.css), shared class groups in [`src/lib/components/ui/styles.ts`](../../src/lib/components/ui/styles.ts) and [`button-variants.ts`](../../src/lib/components/ui/button-variants.ts). Change a value here and in code together.

Values come from measuring [bencho.dev](https://bencho.dev/) in both themes (see [`inspiration.md`](./inspiration.md) for every block and its link). designbookmark.com/motion only informed component ideas, not tokens.

## Principles

- **Fill tiers, not borders.** Surfaces separate by background shade. There are no borders; a hairline (`border`) is for table rows and dividers only.
- **Pills and concentric corners.** Every button, chip, select trigger, and segmented track is a full pill. Nested surfaces keep corners concentric: an inner radius equals the outer radius minus the padding between them (28 → 8 px padding → 20).
- **The drill is the content.** On trainer pages the canvas fills the screen, controls float above it, and they fade out while the target moves and the pointer rests.
- **Quiet motion.** Short, ease-out, interruptible transitions on transform and opacity. Nothing animates on a keyboard shortcut. Everything respects reduced motion.

## Color

Semantic tokens follow shadcn naming. `fill*` and `border` are alpha overlays of the text color, so they read the same on any surface below them (bencho mixes text into the surface at 6/10/12%).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#ffffff` | `#0a0a0a` | Page |
| `foreground` | `#17181a` | `#ffffff` | Text, icons |
| `canvas` | `#f7f7f6` | `#0a0a0a` | Trainer stage, illustration plates |
| `card` | `#f1f1f0` | `#181818` | Large page cards (grid-card tier) |
| `popover` | `#ffffff` | `#262626` | Floating surfaces: HUD, dialogs, menus (component "slab") |
| `primary` / `primary-foreground` | `#17181a` / `#fff` | `#fff` / `#0a0a0a` | Primary buttons, selected tiles, tooltips |
| `muted-foreground` | `#646568` | `#a1a1a1` | Secondary text |
| `faint` | `#b5b5b6` | `#6b6b6b` | Decorative strokes only, never text |
| `fill` | ink 6% | white 6% | Secondary buttons, chips, tracks, rows, settings groups |
| `fill-hover` | ink 10% | white 10% | Hover of anything on `fill` |
| `fill-active` | ink 12% | white 12% | Empty slider ticks, switch track off |
| `border` | ink 12% | white 12% | Table dividers, text-link underline |
| `ring` | `#2231dd` | `#3aa9ff` | Focus outline, selection tint |
| `target` | `#fdc700` | `#f0b100` | The drill target. Same values as `getCanvasTheme().targetColor` |
| `grid` | `rgb(16 18 22 / .075)` | `rgb(255 255 255 / .045)` | Canvas grid lines. Same values as the canvas theme |
| `thumb` | `#ffffff` | white 16% | Segmented and tab indicator |

Contrast (WCAG): text on `background`/`popover` is 15:1 or more. `muted-foreground` is at least 4.5:1 on every surface it sits on, including `fill` nested inside `card` (light 4.54:1, dark 4.89:1). bencho's own 52% muted mix (`#868788`) is 3.6:1 on white, so it was darkened. `ring` is 5.9:1 or more.

The target stays the brand yellow from the logo rather than a bencho accent: it is the one color that must win on the canvas.

## Typography

Inter variable (weights 300–700), self-hosted from `src/assets/fonts/` with the OFL license next to it. Latin loads first and is preloaded; Latin Extended loads only when a page needs those characters. Other scripts (Bengali, Hindi, Chinese) fall back to system fonts. No `font-feature-settings`. Numbers that change while you watch them use `tabular-nums`.

bencho sets its marketing headings in Plus Jakarta Sans; FoveaFlow uses Inter 600 everywhere to keep one font file.

| Class | Size / line height | Tracking | Role |
| --- | --- | --- | --- |
| `text-2xs` | 11 / 16 | 0 | Tooltip text (+0.01em, `tracking-wide`), shortcut keys, tile captions |
| `text-xs` | 12 / 16 | 0 | Group labels, table headers, "On this page" |
| `text-sm` | 13 / 19.5 | 0 | Secondary text, small buttons, tabs, segmented items, descriptions |
| `text-md` | 14 / 20 | −0.01em | Labels, buttons, list rows, body inside panels |
| `text-base` | 16 / 24 | 0 | Body copy, ledes, card titles (`font-medium tracking-tight`) |
| `text-lg` | 20 / 24 | −0.02em | Dialog titles, drill names in guide cards, h2 of small sections |
| `text-xl` | 30 / 36 | −0.02em | Section headings (h2), guide dialog title |
| `text-2xl` | 36 / 40 | −0.02em | Page title on phones |
| `text-3xl` | 52 / 56 | −0.02em | Page title from `sm` up |

Weights: 400 body, 500 labels and titles, 600 headings. Larger Tailwind sizes are removed so nothing drifts off the scale.

## Spacing

Tailwind's 4 px scale. The values in use, so new work picks from these:

- **2 / 4 px** — segmented track padding, icon-button gaps in a toolbar.
- **6 / 8 px** — popup padding, gaps between pills, list gaps, the inset between a floating panel and the screen edge on phones.
- **12 / 16 px** — gaps between rows in a settings group, card padding, page gutter on phones.
- **20 / 24 px** — dialog padding, page gutter from `sm`.
- **40 / 64 / 80 px** — hero gaps, gap between TOC and content, gap between page sections.

## Radius

| Class | px | Use |
| --- | --- | --- |
| `rounded-xs` | 6 | Shortcut key chip |
| `rounded-sm` | 8 | Tooltip |
| `rounded-lg` | 12 | Brand mark tile |
| `rounded-xl` | 14 | List rows, tiles, small plates |
| `rounded-2xl` | 20 | Cards inside a surface, popups, settings groups |
| `rounded-3xl` | 24 | Illustration plates inside big cards, comparison table |
| `rounded-4xl` | 28 | Floating HUD dock, dialogs, page cards |
| `rounded-full` | — | Buttons, triggers, chips, tracks, switches, avatars |

## Elevation

Only floating surfaces get a shadow: `shadow-popover` (a 1 px 6% ring plus a soft 32 px drop). Segmented and tab thumbs get `shadow-thumb`. Nothing else casts a shadow. Backdrops dim the page to black 24% (48% dark); the controls panel dims less (8% / 32%) so the drill stays readable while you tune it.

## Sizes

| Element | Height | Touch (`pointer: coarse`) |
| --- | --- | --- |
| Small button | 28 | 28 (never the only way to an action) |
| Button, select trigger, icon button | 36 | 44 |
| Large button | 40 | 44 |
| Play / pause | 44 | 44 |
| Segmented item | 32 in a 36 track | 40 |
| List row | 36 | 44 |
| Slider hit area | 32 | 44 |
| Color swatch | 32 | 44 |

## Icons

[Lucide](https://lucide.dev) via `@lucide/svelte`, stroke 2 (Lucide's default, as on bencho), `currentColor`. Sizes: 16 in buttons and rows, 18 in icon buttons, 20 for tile glyphs. Icons beside text are `aria-hidden`; icon-only buttons are named by their tooltip.

Custom SVGs live in `src/lib/components/icons/`:

- `drill-icon` — 24 px glyph per drill, stroke 1.5, faded strokes for "history" (trail, ghost positions, distractors).
- `pattern-glyph` — the real route of each motion path in a 32 × 24 box, generated from the engine by `scripts/generate-pattern-glyphs.ts` into `src/lib/trainer/glyphs/pattern-glyphs.ts`. A unit test fails when a path changes and the data is stale.
- `target-form-glyph` — the six target forms, drawn like the canvas draws them.
- `drill-illustration` — a 160 × 100 scene per drill on the canvas grid, used on drill cards and guide sections. It animates only while its card is hovered or focused.
- `path-end-art` — the 404 scene: a path that runs out before the missing target.
- `brand-mark` — the logo emblem.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default for everything entering or reacting |
| `ease-spring` | `cubic-bezier(0.24, 1.34, 0.38, 1)` | Small things that should feel alive: switch thumb, swatch ring |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Side panel |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.2, 1)` | Movement across the screen (illustrations) |
| `duration-160` | 160 ms | Color and opacity changes, popups in |
| `duration-220` | 220 ms | Thumbs, indicators, chevrons, switch |
| `duration-300` | 300 ms | Side panel in (200 ms out) |
| `animate-rise` | 620 ms, 10 px | One entrance per page: hero text, trainer dock |

Rules:

- **Press:** pressables scale to 0.96 (`motion-safe:active:scale-96`), the press itself runs at 100 ms. Small swatches dip to 0.9, big cards to 0.98.
- **Hover** only on devices that hover (Tailwind's `hover:` already checks). Touch gets `:active` feedback instead.
- **Popups** (select, tooltip) grow from `--transform-origin`: opacity 0 → 1 and scale 0.96 → 1 in 160 ms, out in 120 ms. Tooltips wait 420 ms, then appear instantly on neighbouring buttons (ui-sdk does this), sliding 4 px from their side.
- **Dialogs:** the guide scales from the center (0.96, 260 ms in, 180 ms out). The controls slide 24 px from the right edge (300 ms in, 200 ms out). On touch screens both become bottom sheets that follow the finger and dismiss with a swipe (ui-sdk sheet presentation).
- **Indicators** (segmented, tabs) slide between items in 220 ms; text color crossfades in 160 ms.
- **Idle HUD:** while the target moves and a mouse rests for 2 s, the HUD fades out over 700 ms and comes back in 160 ms on movement or keyboard focus. Touch screens never hide it.
- **No animation** on keyboard shortcuts' effects beyond the component's own state change, and no stagger on menus or lists.
- **Reduced motion:** a global rule turns animations into a 1 ms jump and limits transitions to color, opacity, and shadow, so nothing slides or scales. The trainer also starts paused. Illustrations stay still.

## Components

`src/lib/components/ui/` holds the kit. Interactive parts are [ui-sdk](https://ui-sdk.dev) (`@ui-sdk/svelte`) components with our classes; read `node_modules/@ui-sdk/svelte/docs/llms.txt` and the component page before changing one. Don't hand-roll a role that ui-sdk ships.

| Component | Built on | Use |
| --- | --- | --- |
| `button-variants.ts` | — | `buttonClass(variant, size)` for links that look like buttons and for ui-sdk parts that render buttons (Dialog close, Alert Dialog actions) |
| `button.svelte` | ui-sdk Button | Actions. Variants `primary`, `secondary`, `ghost`; sizes `sm`, `md`, `lg`, `icon` |
| `icon-button.svelte` | Button + Tooltip | Icon-only actions. The tooltip names the button and shows its shortcut key |
| `select.svelte` | ui-sdk Select | Every choice from a list. Groups, leading icon per option, check on the chosen one. Presents as a bottom sheet on touch screens; `compact` keeps a popover and hides the chevron on phones |
| `slider.svelte` | ui-sdk Slider | Every number. Tick track from bencho's wake slider: filled ticks up to the value, a 3 px marker as the thumb, the formatted value above |
| `switch.svelte` | ui-sdk Switch | On/off settings, as a whole-row label |
| `segmented.svelte` | ui-sdk Segmented Control | Two or three visible choices (direction, theme) |
| `brand-mark.svelte` | — | Logo |
| `styles.ts` | — | Shared class groups: `pressable`, popup surface and motion, list rows, dialog surface, sheet presentation, settings group, segment track/thumb/item, backdrop |

Also from ui-sdk, used directly: Dialog (controls, guide), Alert Dialog (reset), Tabs (control sections), Radio Group (target form tiles, Lilac swatches).

Usage rules:

- Name every control. Visible labels come from the label part; icon buttons from their tooltip; sliders and groups from `aria-label` when the visible label is shorter than the setting (`Header target size`).
- Keep labels unique per surface so agents and screen-reader users can tell controls apart.
- Change state through the trainer's methods in `onValueChange`, never in DOM listeners, so agent changes take the same path.
- Mark anything an agent must not do alone with `data-agent-confirm` (the reset confirmation does).
- Popups render in the top layer. Never put one inside a link or a clickable card.
- Class lists use tokens only. A value that is not on a scale above needs a reason in this file first.

### Agents

`src/lib/components/agent-bridge.ts` creates one ui-sdk agent bridge per page and registers its `snapshot`, `act`, and `query` tools with WebMCP (`document.modelContext`) when the browser has it. Steps marked for a person are refused. The site's own WebMCP tools in `agent-tools.astro` stay as they were.

## Layouts

### Trainer (`/` and every drill route)

- Full-screen `canvas` stage with the drill.
- **Top bar**, floating 8 px (16 px from `sm`) from the edges: brand pill on the left; an action pill on the right with Language (compact), Guide (G), and Controls (S).
- **Dock**, floating at the bottom center, `popover` surface, radius 28, 8 px padding:
  - Desktop (`lg`): one row — play/pause (Space), reverse, drill select (M), path select (P), then Size and Speed sliders (or Ball color swatches and Scale for Lilac Chaser).
  - Below `lg`: two rows, full width up to 576 px — buttons and selects, then the two sliders side by side. Lilac Chaser stacks swatches over Scale on phones. Select triggers drop their icon on phones to fit the names.
- **Controls** (S): right-side panel 416 px wide, inset 8 px, with title, close, and three tabs — Drill, Targets, General — each opening with its one-line description and grouped settings on `fill` cards. Footer: "Settings save automatically." and Done. On touch screens it is an 85 dvh bottom sheet.
- **Guide** (G): centered 640 px dialog (sheet on touch) with the home or drill guide and a footer of updated date, Read full guide, Source, Privacy, Terms.
- **Reset**: an alert dialog over the controls.

### Content pages

- Sticky 64 px header on a blurred `background`: brand, Guide (not on `/guide/`), Open FoveaFlow (primary), Language and Theme (compact).
- Page width 1152 px with 16 / 24 px gutters.
- Hero: optional breadcrumb, title (36 → 52), lede, actions, updated date, then drill cards in 2 columns (4 from `lg`).
- Below: a 208 px sticky table of contents beside a 672 px reading column from `lg`; on smaller screens the table of contents sits above as a `fill` card.
- Sections 80 px apart (64 on legal pages). Section heading 30 px, intro in `muted-foreground`, content below.
- Closing call to action: `card` with title, line, primary button, and the Smooth Pursuit illustration from `sm`.
- Comparison pages put the feature table under the hero, in a `card` with alternating `popover` rows.
- Footer: brand mark with the free-use line, and Guide, Privacy, Terms.

### Not found

Centered 404 scene, title, line, and two buttons.

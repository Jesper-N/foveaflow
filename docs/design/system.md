# FoveaFlow design system

The source of truth for how FoveaFlow looks, moves, and is built. Tokens live in [`src/styles/global.css`](../../src/styles/global.css), shared class groups in [`src/lib/components/ui/styles.ts`](../../src/lib/components/ui/styles.ts) and [`button-variants.ts`](../../src/lib/components/ui/button-variants.ts). Change a value here and in code together.

Values come from measuring [bencho.dev](https://bencho.dev/) in both themes (see [`inspiration.md`](./inspiration.md) for every block and its link). designbookmark.com/motion only informed component ideas, not tokens.

## Principles

- **Fill tiers, not borders.** Surfaces separate by background shade. A hairline (`border`) is for dividers only: accordion rows, table rows, the guide footer.
- **Pills and concentric corners.** Buttons, triggers, chips and tracks are full pills. Nested surfaces keep corners concentric: inner radius = outer radius − padding (28 → 8 → 20).
- **The drill is the content.** On trainer pages the canvas fills the screen and the controls live in one island that stays out of the way: a small black notch at rest, hidden with the cursor while the target moves.
- **Motion has a job or it doesn't ship.** Every animation below names its purpose. Nothing loops in the corner of your eye while you train, nothing animates on a keyboard shortcut, and everything respects reduced motion.

## Color

Semantic tokens follow shadcn naming. `fill*` and `border` are alpha overlays of the text color, so they read the same on any surface below them (bencho mixes text into the surface at 6/10/12%).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#ffffff` | `#0a0a0a` | Page |
| `foreground` | `#17181a` | `#ffffff` | Text, icons |
| `canvas` | `#f7f7f6` | `#0a0a0a` | Trainer stage, illustration plates |
| `card` | `#f1f1f0` | `#181818` | Large page cards (bencho's wall-card tier) |
| `popover` | `#ffffff` | `#262626` | Floating surfaces: HUD, dialogs, menus (component "slab") |
| `primary` / `primary-foreground` | `#17181a` / `#fff` | `#fff` / `#0a0a0a` | Primary buttons, selected tiles, tooltips |
| `muted-foreground` | `#646568` | `#a1a1a1` | Secondary text |
| `faint` | `#b5b5b6` | `#6b6b6b` | Decorative strokes and empty slider ticks, never text |
| `fill` | ink 6% | white 6% | Secondary buttons, chips, tracks, rows, settings groups |
| `fill-hover` | ink 10% | white 10% | Hover of anything on `fill` |
| `fill-active` | ink 12% | white 12% | Setting icon tiles, switch track off |
| `border` | ink 12% | white 12% | Table dividers, text-link underline |
| `ring` | `#2231dd` | `#3aa9ff` | Focus outline, selection tint |
| `target` | `#fdc700` | `#f0b100` | The drill target. Same values as `getCanvasTheme().targetColor` |
| `grid` | `rgb(16 18 22 / .075)` | `rgb(255 255 255 / .045)` | Canvas grid lines. Same values as the canvas theme |
| `thumb` | `#ffffff` | white 16% | Segmented and tab indicator |
| `lilac-stage` | `#d8d8da` | `#d8d8da` | Lilac Chaser previews (the illusion needs its grey) |

Contrast (WCAG): text on `background`/`popover` is 15:1 or more. `muted-foreground` is at least 4.5:1 on every surface it sits on, including `fill` nested inside `card` (light 4.54:1, dark 4.89:1). bencho's own 52% muted mix (`#868788`) is 3.6:1 on white, so it was darkened. `ring` is 5.9:1 or more.

The island and the closing call to action are always dark: they carry the `dark` class, which switches every token inside them (the dark token set applies to `.dark`, not only to `html.dark`). Menus opened from the island are dark too.

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
- **20 / 24 / 32 px** — dialog padding, card padding on large cards, page gutters from `sm` and `lg`.
- **56 / 80 px** — hero gaps, the gap between the editorial heading column and its content.
- **96 / 128 px** — gap between page sections (`sectionGap`), phones / desktop.

## Radius

| Class | px | Use |
| --- | --- | --- |
| `rounded-xs` | 6 | Shortcut key chip |
| `rounded-sm` | 8 | Tooltip |
| `rounded-lg` | 12 | Brand mark tile |
| `rounded-xl` | 14 | List rows, tiles, small plates |
| `rounded-2xl` | 20 | Cards inside a surface, popups, settings groups |
| `rounded-3xl` | 24 | Illustration plates inside big cards, comparison table |
| `rounded-4xl` | 28 | The open island, dialogs, page cards, drill tiles |
| `rounded-full` | — | Buttons, triggers, chips, tracks, switches, avatars |

## Elevation

Only floating surfaces get a shadow: `shadow-popover` (a 1 px 6% ring plus a soft 32 px drop). The island uses a `drop-shadow` filter so the shadow follows its morphing shape, plus a 0.5 px light edge so the black notch reads on a dark canvas. Segmented and tab thumbs and small raised chips get `shadow-thumb`. Nothing else casts a shadow. Backdrops dim the page to black 24% (48% dark); the controls panel dims less (8% / 32%) so the drill stays readable while you tune it.

## Sizes

| Element | Height | Touch (`pointer: coarse`) |
| --- | --- | --- |
| Small button | 28 | 28 (never the only way to an action) |
| Button, select trigger, icon button | 36 | 44 |
| Large button | 40 | 44 |
| Play / pause (island) | 48 | 48 |
| Segmented item | 32 in a 36 track | 40 |
| Menu row | 40 | 48 |
| Setting icon tile | 28 | 28 (the whole row is the target) |
| Slider hit area | 40 | 44 |
| Island notch | 36 × 120 | 44 × 136 |
| Color swatch | 32 | 44 |

## Icons

[Lucide](https://lucide.dev) via `@lucide/svelte`, stroke 2, `currentColor`. Sizes: 16 in buttons and rows, 18 in icon buttons, 20 in tiles. Icons beside text are `aria-hidden`; icon-only buttons are named by their tooltip.

Custom SVGs in `src/lib/components/icons/`:

- `drill-icon` — one 24 px glyph per drill in Lucide's stroke (2, round caps and joins), with the target drawn as a filled `target`-yellow dot. Smooth Pursuit: a curve that lands on the target. Reaction Jumps: a dashed jump arc from a ring to the target. Multiple Distractions: the target among rings. Lilac Chaser: a ring of dots around a fixation cross, the moving gap in yellow.
- `drill-preview` — a live miniature of each drill on the canvas grid, drawn from the real motion data:
  - Smooth Pursuit runs the engine's Figure eight route with a fading trail.
  - Reaction Jumps pops between four spots with a landing ripple.
  - Multiple Distractions moves the target along one route and six darker distractors along six others.
  - Lilac Chaser blurs twelve dots on grey and hides one per 100 ms step, like the drill. It plays while visible, or only while its host is explored (`playing` prop). Reduced motion shows a still frame.
- `pattern-glyph` — each motion path's real route in a 32 × 24 box, generated from the engine by `scripts/generate-pattern-glyphs.ts`. A unit test fails when the data is stale.
- `target-form-glyph` — the six target forms as the canvas draws them.
- `path-end-art` — the 404 scene: the target runs its route once and stops where the path breaks, beside a dashed ring where the next target should be.
- `brand-mark` — the logo emblem.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entering, reacting, fades |
| `ease-spring` | `cubic-bezier(0.24, 1.34, 0.38, 1)` | Small things with a little life: switch thumb, hover fills, arrows, swatches |
| `ease-spring-soft` | spring `linear()`, damping 0.78, response 0.42 s | Soft settles |
| `ease-spring-settle` | spring `linear()`, damping 1, response 0.32 s | Settles with no overshoot |
| `ease-edge-lead` / `ease-edge-trail` | springs `linear()`: stiffness 620 damping 46 (330 ms, no overshoot) / stiffness 190 damping 19 (790 ms) | The two edges of a sliding highlight (`stretch-indicator`) |
| `ease-spring-pop` | spring `linear()`, stiffness 500, damping 18, mass 0.6 (peaks at 1.14) | Menus and the color popover unfolding from their trigger |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Side panel |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.2, 1)` | Movement across the screen (404 runner, equal-speed loops) |
| `duration-160` | 160 ms | Color and opacity, popups in |
| `duration-220` | 220 ms | Indicators, chevrons |
| `duration-260` | 260 ms | Springy details, accordion height, guide dialog |
| `duration-300` | 300 ms | Side panel in (200 ms out), section-nav pill, segmented and tab thumbs |
| `animate-rise` | 620 ms, 10 px | One entrance per page: the hero text |

The spring curves are generated from Apple's damping/response model, not eyeballed. CSS transitions retarget from the current value, so every interactive animation can be interrupted mid-flight.

### Every interaction and why it moves

| Interaction | What happens | Why |
| --- | --- | --- |
| Press | Pressables dip to 0.96 in 100 ms (swatches 0.9, cards 0.98) | Instant proof the press landed, before any result |
| Hover on ghost buttons and nav pills | A fill grows in from 0.86 (bencho's header buttons) | Says "this is pressable" without shouting; mouse only |
| Hover on links with arrows | The arrow nudges toward where the link goes | Previews direction; no other motion |
| Island opens (hover 80 ms, tap, or keyboard focus) | Width and height are two springs (`island-morph.ts`, after designbookmark's morph island): width is stiffer, so the notch spreads sideways first and then drops open; while height moves fast the width gives back a little, and the overshoot shows as a 2 % stretch. Controls fade in from a 6 px blur 70 ms later | The controls come out of the thing you touched, so you always know where they live. One body changing shape, not a box appearing |
| Island closes (pointer away 320 ms, outside tap, Escape) | Panel fades out fast; both springs run near-critical (0.92) so the notch tucks back with no squash | Leaving is quicker than arriving; the grace delay forgives a pointer that slips off |
| Island content changes size (switching drills while open) | The same springs retarget to the new size | The island grows or shrinks around new content instead of jumping |
| Island at rest | A blank black notch, no text, icon or motion | Nothing to read or watch while you track the target |
| Island while training | Fades out over 700 ms with the cursor (mouse only), back in 160 ms on movement | The drill gets the whole screen; the way back is instant |
| Slider wake | Drag fast and every tick the value sweeps past jumps up (to 2.3×, scaled by drag speed) and decays back, so the run tails off behind your hand; a slow drag or a click only fills; an arrow key leaves a small wake. Label, value and icon tile brighten while you adjust | bencho's wake slider: the speed of your hand becomes visible, so the control feels physical without moving when you don't |
| Switch | Thumb springs across; it stretches while pressed | The iOS feel of something you're physically pushing |
| Segmented control, tabs, section nav | The highlight's two edges ride two springs: the edge facing the new option is stiff, the trailing edge soft, so it stretches across and lands with a small squash. Direction is written to the track before ui-sdk measures, so the right edge always leads | designbookmark's plan switch: reads as one object travelling, not a box swapped |
| Select menu, color popover | Unfolds out of the trigger's corner: from 0.86 × 0.72 and 10 px up on `ease-spring-pop`, opacity in 160 ms; rows deal in 35 ms apart (first six only). Out in 120–160 ms with no bounce. Opened from the keyboard it only fades | bencho's picker: the list comes from the thing you pressed and is handed to you row by row; the overshoot is the character. Keyboard use gets no delay |
| Tooltip | After 420 ms it scales in from its trigger (160 ms); a neighbour's tooltip (`data-instant`) appears with no animation; island tooltips open below the island | Teaches shortcuts without delaying repeat use or covering the controls |
| Accordion | Height and fade in 260 ms, plus turns into × | State change you can follow |
| Drill tile | Its preview plays and the open button scales in while hovered or focused | You explore a drill before you open it; still otherwise, so a page of tiles stays calm |
| Guide drill list | Hovering or focusing a drill crossfades the stage to its preview and plays it | Maps each name to its motion |
| Controls playground (guide) | Real Speed and Size sliders drive a target on a figure eight | Explains the two settings that matter most by letting you feel them |
| Drill showcase | The sticky stage crossfades (blur 8 px, 0.96) to the drill you're reading; the other write-ups dim to 40 % until hovered or focused | One focal motion that follows the reading, and the page tells you which text belongs to it |
| Motion path tile | A dot runs the route while hovered | Shows the path's speed and shape, which a still line can't |
| Target preview (Controls › Targets) | Form, color, size, opacity and letters update live on a spring | The canvas is dimmed behind the panel; this is the feedback |
| Target form tile | The selected glyph pops to 1.15 | Confirms the pick |
| 404 | The target runs its route once and stops at the break | Tells the "path ends here" story; plays once |
| Hero | Text rises once on load | First impression only |

Never: animation on keyboard shortcuts beyond the state change itself, staggers longer than six rows, looping motion in the trainer chrome, `transition: all`.

**Reduced motion:** a global rule turns animations into a 1 ms jump and limits transitions to color, opacity and shadow. Components also opt out explicitly: the island swaps its morph for a fade, previews and path tiles stay still (Lilac Chaser keeps its gap), the showcase only fades, and the trainer starts paused.

## Components

`src/lib/components/ui/` holds the kit. Interactive parts are [ui-sdk](https://ui-sdk.dev) (`@ui-sdk/svelte`) components with our classes; read `node_modules/@ui-sdk/svelte/docs/llms.txt` and the component's page before changing one. Don't hand-roll a role that ui-sdk ships.

| Component | Built on | Use |
| --- | --- | --- |
| `button-variants.ts` | — | `buttonClass(variant, size)` for links that look like buttons and for ui-sdk parts that render buttons |
| `button.svelte` | ui-sdk Button | Actions. `primary`, `secondary`, `ghost`; sizes `sm`, `md`, `lg`, `icon` |
| `icon-button.svelte` | Button + Tooltip | Icon-only actions, named by a tooltip that shows the shortcut |
| `select.svelte` | ui-sdk Select | Every choice from a list. Groups, leading icon, an 18 px filled check badge on the chosen row, 40 px rows (48 on touch). `appearance`: `field` (filled pill), `ghost` (header and island icon triggers), `text` (the island's title and byline). `labelIcon` adds a row icon tile. Sheet on touch; `compact` stays a popover and hides the chevron on phones |
| `slider.svelte` | ui-sdk Slider | Every number: thumbless 3 × 16 px tick bars with bencho's speed wake, the formatted value; optional `icon` tile |
| `row-label.svelte` | — | A setting's label with its optional 28 px icon tile (inverts while the setting is being adjusted) |
| `color-field.svelte` | ui-sdk Color Picker + Popover | Colors: swatch + hex trigger; popover with saturation area, hue slider, presets and a hex field |
| `switch.svelte` | ui-sdk Switch | On/off settings as a whole-row label. 48 × 28, after bencho's toggle: off is a slab track with a grey thumb, on inverts to an ink track with a slab thumb, so the track carries the state; the thumb stretches while pressed |
| `segmented.svelte` | ui-sdk Segmented Control | Two or three visible choices (direction, theme) |
| `accordion-list.svelte` | ui-sdk Accordion | Questions and answers (guide FAQ, quick answers) |
| `brand-mark.svelte` | — | Logo |
| `styles.ts` | — | Shared class groups: `pressable`, popup surface, list rows, dialog surface, sheet presentation, settings group (rows marked `data-setting-row` get 12 px padding and hairlines between them), segment track/thumb/item, backdrop. Popup motion lives in the `popup-unfold` and `list-deal` utilities in `global.css` |

Also from ui-sdk, used directly: Dialog (controls, guide), Alert Dialog (reset), Tabs (control sections), Radio Group (target forms, Lilac swatches).

Usage rules:

- Name every control. Visible labels come from the label part; icon buttons from their tooltip; sliders and groups from `aria-label` when the visible label is shorter than the setting (`Header target size`).
- Keep labels unique per surface so agents and screen-reader users can tell controls apart.
- Change state through the trainer's methods in `onValueChange`, never in DOM listeners, so agent changes take the same path.
- Mark anything an agent must not do alone with `data-agent-confirm` (the reset confirmation does).
- Popups render in the top layer. Never put one inside a link or a clickable card.
- Class lists use tokens only. A value that is not on a scale here needs a reason in this file first.

### Agents

`src/lib/components/agent-bridge.ts` creates one ui-sdk agent bridge per page and registers its `snapshot`, `act`, and `query` tools with WebMCP when the browser has it. Steps marked for a person are refused. The site's own WebMCP tools in `agent-tools.astro` stay as they were.

## Layouts

### Trainer (`/` and every drill route)

- Full-screen `canvas` stage with the drill.
- **The island**, top center, always dark:
  - At rest: a 120 × 36 px black notch (136 × 44 on touch).
  - Open, up to 432 px wide, laid out like a now-playing card: a still thumbnail of the drill, the drill (M) as the title and the path (P) as the byline (both plain-text selects), reverse, and a 48 px white play/pause (Space). Below: Size and Speed side by side (or Lilac's Ball color and Scale). Footer behind a hairline: brand, Language, Guide (G), Controls (S).
  - On phones it opens full width with the same layout.
- **Controls** (S): right-side panel 416 px wide, inset 8 px, with tabs Drill / Targets / General. Each tab is grouped settings rows in `fill` cards, iOS-style: a 28 px icon tile, the label, the control on the right (sliders run under the label, aligned with it), hairlines between rows, small section titles above a card. Targets opens with the live target preview. Footer: "Settings save automatically." and Done. On touch screens it is an 85 dvh bottom sheet.
- **Guide** (G): 928 px dialog (sheet on touch). Left: the drill's live preview with its name pill; on `/` one stage that crossfades to whichever drill in the list you point at or focus. Right: title, lede, steps, what it trains, quick answers, overview. Footer: updated date, Source, Privacy, Terms, and the primary Read full guide.
- **Reset**: an alert dialog over the controls.

### Content pages

- Sticky 64 px header on a blurred `background` (94%): brand, Guide (not on `/guide/`), Open FoveaFlow, Language, Theme. On phones the brand and language code collapse to icons.
- Page width 1280 px with 16 / 24 / 32 px gutters.
- Hero, centered: breadcrumb chips, title (36 → 52), lede (16 → 20), actions, updated date. Below it, full width: the drill wall (four tiles, 1 → 2 → 4 columns) or the comparison table.
- Section nav: a sticky chip bar under the header ("On this page") with a sliding pill for the current section.
- Sections 96–128 px apart, in an editorial split from `lg`: heading and intro sticky on the left (352 px), content on the right.
- Guide extras: the drill showcase (sticky live stage beside the four drill write-ups), the motion path gallery (one grid of 20 route tiles, 2 → 4 → 5 columns, the two unpredictable paths first with a badge), audience cards with icons, the controls playground, article cards, FAQ accordion, reference list.
- Closing call to action: a dark band with the title, line, button and a live pursuit preview.
- Comparison table: FoveaFlow's column is raised on `popover`, the competitor's stays muted.
- Footer: a `card` with brand and the free-use line, a Drills column (icon + name) and a FoveaFlow column (Guide, Privacy, Terms).
- References list: numbered rows with each source's domain under the title.

### Not found

Centered 404 scene, title, line, and two buttons.

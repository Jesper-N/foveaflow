# UI inventory

What the app's pages and core components do and what text they show. Function and content only, no visual design. All visible text is translated into 10 languages (keyed by the English wording in `src/lib/i18n/dictionaries/`).

## Pages

| Route | What it is |
| --- | --- |
| `/` | Trainer app, Smooth Pursuit with the Random path. |
| `/smooth-pursuit/`, `/reaction-jumps/`, `/multiple-distractions/`, `/lilac-chaser/` | Trainer app opened on that drill. Indexable. |
| `/circle/`, `/figure-eight/`, … (one per motion path) | Trainer app opened on Smooth Pursuit with that path. Not indexed. |
| `/guide/` | Long-form guide to every drill, path, and control. |
| `/fps-eye-training/` | Article: "FPS eye training warmup". |
| `/blinkcamp-alternative/` | Article: "FoveaFlow vs BlinkCamp", with a feature comparison table. |
| `/eyetrainer-gg-alternative/` | Article: "FoveaFlow vs EyeTrainer.gg", with a feature comparison table. |
| `/privacy/` | Privacy Policy. |
| `/terms/` | Terms of Use. |
| `/404` | Not-found page. |

Non-visual endpoints: `sitemap.xml`, `robots.txt`, `llms.txt`, `index.md`, `pricing.md`, `/.well-known/agent-skills/`.

## Trainer app (`/` and every drill route)

### Trainer stage (`trainer/trainer-app.svelte`)

- Full-screen canvas that animates the drill: one or more moving targets over a faint grid, an optional trail.
- Hidden page heading (the drill's name, for example "Free online eye trainer" or "Circle Smooth Pursuit Drill").
- Screen-reader live status: "Motion playing/paused. Direction forward/reverse."
- Mouse cursor hides after a moment of no movement.
- Keyboard shortcuts: Space pause/resume, ↑/↓ target size, ←/→ speed, D toggle light/dark, G open guide, M open drill select, P open motion path select, S open controls.
- Mounts the control panel, guide dialog, and controls dialog.

### Control panel (`trainer/hud/trainer-hud.svelte`)

Floating panel at the top of the stage. Auto-hides after a few seconds idle; comes back when the pointer nears the top, on tap, or when keyboard focus enters. Stays up while the pointer, keyboard focus, a select, or a dialog is in use. When hidden, an invisible "Reveal controls" button holds its place.

- Logo + "FoveaFlow" link home.
- Action buttons, each with a tooltip:
  - "Pause motion" / "Resume motion"
  - "Reverse motion direction" / "Use forward motion direction" (only for paths that can reverse)
  - Guide: "Open guide" on drill routes, "About FoveaFlow" on `/`
  - "Open controls"
  - Language select ("Change language: English")
- Drill select ("Drill"): Smooth Pursuit, Reaction Jumps, Multiple Distractions, Lilac Chaser. Changing it updates the URL.
- Motion path select ("Motion path", Smooth Pursuit only), grouped:
  - Unpredictable: Random, Hard turns
  - Predictable: Circle, Ellipse, Figure eight, Wave, Diagonal, Bounce, Horizontal sweep, Vertical sweep, Down-right sweep, Down-left sweep, Edge loop, Diamond loop, Clover, Zigzag, Stair steps, Lissajous, Hourglass, Corner tour
- Quick adjustments, swapped by drill:
  - Moving drills: "Size" slider (px) and "Speed" slider, each showing its value.
  - Lilac Chaser: "Ball color" select (Magenta, Red, Blue, Gold, Cyan) and "Scale" slider (e.g. 1.00x).

### Controls dialog (`trainer/controls/controls-dialog.svelte`)

Modal titled "Controls", subtitle (screen reader) "Change your saved FoveaFlow settings." Three section tabs; the last one used reopens next time. Close button, footer "Settings save automatically." and "Done".

- **Drill** — "Choose your exercise and how it moves."
  - Drill select; Motion path select (Smooth Pursuit only).
  - "Motion" group (not for Lilac Chaser): "Motion feel" select (Steady speed, Speed wave, Short bursts, Alternating pace, Build and reset, Size pulse); "Speed" slider; "Direction" Forward/Reverse choice and "Show trail" switch (reversible paths only).
- **Targets** — "Fine-tune what you follow."
  - Moving drills: "Ball color" color picker with a live preview of the target and its hex value; "Target form" choice (Circle, Ring, Square, Diamond, Triangle, Cross) shown as shape icons; "Size" and "Opacity" sliders; "Show target letters" switch, which reveals "Letter color" picker (preview of a letter on the ball), "Weight" select (Regular, Medium, Semibold, Bold, Heavy), "Text size" slider.
  - Lilac Chaser: "Ball color" select and "Scale" slider.
  - Multiple Distractions adds a "Distractions" group: "Targets", "Distractors", "Distractor color" sliders.
- **General** — "Language, theme, and saved preferences."
  - "Language" select; "Theme" choice (Light, Dark, System, with icons).
  - "Defaults": "Restore the selected drill to its default behavior, visuals, and saved local settings." + "Reset to defaults" button, which opens a confirm dialog "Reset to defaults?" with Cancel / Reset to defaults.

### Guide dialog (`trainer/guide/guide-dialog.svelte`)

Modal opened from the panel or with G. Closes with the close button, Escape, or a click outside. Footer: "Updated <date>", "Source" (GitHub), Privacy, Terms, and a "Read full guide" link to `/guide/`.

- On `/` — **Home guide** (`home-guide.svelte`): title "Free online eye trainer" + hero line; "Drills" list of four drill cards (illustration, name, one-line summary, link to the drill); "Overview" paragraphs and a free-use note.
- On a drill route — **Drill guide** (`drill-guide.svelte`): drill title, hero line, and illustration; "How to practice" numbered steps; "What it trains:" callout; "Quick answers" FAQ accordion (one open at a time); "Overview" paragraphs and the free-use note.

## Content pages

### Site shell (`site/site-shell.svelte`), wraps every content page

- "Skip to content" link.
- Header: logo + "FoveaFlow" home link; "Guide" link (except on `/guide/`); language select; "Open FoveaFlow" link; theme select (Light, Dark, System).
- Footer: "FoveaFlow" link, "FoveaFlow is free. No account, no paid plan.", links to Guide, Privacy, Terms.

### Shared page parts

- **Page hero** (`page-hero.svelte`): optional breadcrumb (e.g. Guide › Comparison), title, lede, action links, optional "Updated <date>", optional illustration, optional content slot below.
- **Reading layout + table of contents** (`reading-layout.svelte`, `page-toc.svelte`): "On this page" list of section links; collapsible on small screens.
- **Page section** (`page-section.svelte`): heading, optional intro paragraph, content.
- **Step list** (`step-list.svelte`): numbered steps.
- **Closing call to action** (`page-cta.svelte`): heading, line ("Start slow. Adjust as you go."), action link, drill illustration.
- **Feature comparison** (`feature-comparison.svelte`): table "Feature / FoveaFlow / <other app>", rows become stacked cards on phones; note "Checked against the public browser interface on <date>. Features may change. …" and a source link.
- **Drill illustration** (`drills/drill-illustration.svelte`) and **drill/pattern icons** (`drills/drill-icon.svelte`, `drills/pattern-icon.svelte`): small line drawings of each drill and path.
- **No-JavaScript fallback** (`site/noscript-fallback.astro`): replaces the trainer: heading, description, "FoveaFlow needs JavaScript to run its moving-target drills. The guide works without it.", links to home and guide.

### Guide (`/guide/`, `site/guide-page.svelte`)

- Hero: "FoveaFlow Guide", lede about choosing a drill; actions "Try Smooth Pursuit" and "How to practice"; four drill cards ("Choose a drill") that jump to each drill's section.
- Table of contents: Choose a drill, How to practice, Motion paths, Controls, More guides, Guide FAQ, References.
- "How each drill works" (`guide-drill-sections.svelte`): intro about keeping the head still; per drill: icon, name, summary, "Try this drill" link, numbered steps, "What it trains:" callout.
- "Motion paths": grid of links, one per path, each opening Smooth Pursuit with that path.
- "A short break from the usual screen": three audience cards — Gamers, IT professionals, People on screens all day.
- "Controls" (`guide-resource-sections.svelte`): "Motion and target" callout explaining speed, size, shape, color, opacity, trail, and Lilac Chaser's own controls.
- "More guides": list of the three articles (title, description, link).
- "Guide FAQ": expandable questions (Which drill is best for steady tracking / quick refocus / a busy screen / fixation and edge-of-vision awareness? Which settings should I change first? How long should a session be?).
- "Research and background reading": numbered external references, with a disclaimer that they do not show FoveaFlow improves eyesight or game performance.
- Closing call to action: "Ready to try a drill?" → "Open FoveaFlow".

### Articles (`site/article-page.svelte`)

Hero with breadcrumb, title, summary, primary and optional secondary action, "Updated <date>". Guide-style pages show four drill links under the hero; comparison pages show the feature comparison table instead. Then table of contents, sections (paragraphs, numbered steps, or checkmark lists), and a closing "Try it with your own settings" call to action.

- **FPS eye training warmup**: "A 7-minute FPS eye warmup", "Adjust the drill, not your posture", "What this warmup can and cannot tell you". Actions: "Start the warmup", "Read the guide".
- **FoveaFlow vs BlinkCamp**: "More control, when you want it", "Four ways to practice", "When BlinkCamp may be enough". Actions: "Try FoveaFlow", "Explore the drills".
- **FoveaFlow vs EyeTrainer.gg**: "A warmup you can adjust", "What is available today", "Choose by the controls you need".

### Legal pages (`site/legal-page.svelte`)

Hero with breadcrumb (FoveaFlow › Privacy/Terms), title, summary, "Updated <date>", table of contents, sections of paragraphs with optional external links.

- **Privacy Policy**: Data we do not collect, Settings saved in your browser, Cloudflare hosting and analytics, Cookies, How data is used, Your choices, Children, Contact.
- **Terms of Use**: Agreement, What the app is, Not medical care, Use safely, Free access, Acceptable use, Source code, Availability and warranty, Changes to these terms.

### Not found (`site/not-found-page.svelte`)

"This path ends here", "The page you're looking for does not exist. Open the trainer or use the guide to find your next drill.", actions "Open FoveaFlow" and "Read the guide", illustration of a path that trails off.

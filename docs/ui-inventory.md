# UI inventory

What the app's pages and core components do and what text they show. Function, content, and grouping only: no visual design, layout, or interaction pattern is prescribed. The current markup is deliberately bare HTML. All visible text is translated into 10 languages (keyed by the English wording in `src/lib/i18n/dictionaries/`).

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

- Canvas that animates the drill: one or more moving targets over a faint grid, an optional trail. It is the main content of the page.
- Hidden page heading (the drill's name, for example "Free online eye trainer" or "Circle Smooth Pursuit Drill").
- Screen-reader live status: "Motion playing/paused. Direction forward/reverse."
- Mouse cursor hides after a moment of no movement.
- Keyboard shortcuts: Space pause/resume, ↑/↓ target size, ←/→ speed, D toggle light/dark, G open guide, M open drill select, P open motion path select, S open controls.
- Holds the trainer controls, the guide, and the full controls.

### Trainer controls (`trainer/hud/trainer-hud.svelte`)

The controls that sit with the running drill.

- "FoveaFlow" link home.
- Actions:
  - "Pause motion" / "Resume motion"
  - "Reverse motion direction" / "Use forward motion direction" (only for paths that can reverse)
  - Guide: "Open guide" on drill routes, "About FoveaFlow" on `/`. Opens the guide.
  - "Open controls". Opens the full controls.
  - "Language" select.
- Drill select ("Drill"): Smooth Pursuit, Reaction Jumps, Multiple Distractions, Lilac Chaser. Changing it updates the URL.
- Motion path select ("Motion path", Smooth Pursuit only), grouped:
  - Unpredictable: Random, Hard turns
  - Predictable: Circle, Ellipse, Figure eight, Wave, Diagonal, Bounce, Horizontal sweep, Vertical sweep, Down-right sweep, Down-left sweep, Edge loop, Diamond loop, Clover, Zigzag, Stair steps, Lissajous, Hourglass, Corner tour
- Quick adjustments, depending on the drill:
  - Moving drills: "Size" slider (px) and "Speed" slider, each showing its value.
  - Lilac Chaser: "Ball color" select (Magenta, Red, Blue, Gold, Cyan) and "Scale" slider (e.g. 1.00x).

### Full controls (`trainer/controls/controls-dialog.svelte`)

Titled "Controls", with "Change your saved FoveaFlow settings.", three groups below, "Settings save automatically.", and "Done" to leave.

- **Drill** — "Choose your exercise and how it moves."
  - Drill select; Motion path select (Smooth Pursuit only).
  - "Motion" group (not for Lilac Chaser): "Motion feel" select (Steady speed, Speed wave, Short bursts, Alternating pace, Build and reset, Size pulse); "Speed" slider; "Direction" Forward/Reverse choice and "Show trail" switch (reversible paths only).
- **Targets** — "Fine-tune what you follow."
  - Moving drills: "Ball color" color picker; "Target form" choice (Circle, Ring, Square, Diamond, Triangle, Cross); "Size" and "Opacity" sliders; "Show target letters" on/off, which reveals "Letter color" picker, "Weight" select (Regular, Medium, Semibold, Bold, Heavy), "Text size" slider.
  - Lilac Chaser: "Ball color" select and "Scale" slider.
  - Multiple Distractions adds a "Distractions" group: "Targets", "Distractors", "Distractor color" sliders.
- **General** — "Language, theme, and saved preferences."
  - "Language" select; "Theme" choice (Light, Dark, System).
  - "Defaults": "Restore the selected drill to its default behavior, visuals, and saved local settings." + "Reset to defaults", which asks for confirmation first: "Reset to defaults?" with Cancel / Reset to defaults.

### Guide (`trainer/guide/guide-dialog.svelte`)

Opened from the trainer controls or with G; "Close" or Escape leaves it. Ends with "Updated <date>", "Read full guide" (`/guide/`), "Source" (GitHub), Privacy, Terms.

- On `/` — **Home guide** (`home-guide.svelte`): title "Free online eye trainer" + hero line; "Drills": the four drills, each a name linking to the drill plus a one-line summary; "Overview" paragraphs and a free-use note.
- On a drill route — **Drill guide** (`drill-guide.svelte`): drill title and hero line; "How to practice" numbered steps; "What it trains:" note; "Quick answers" questions with answers; "Overview" paragraphs and the free-use note.

## Content pages

### Site shell (`site/site-shell.svelte`), wraps every content page

- "Skip to content" link.
- Header: "FoveaFlow" home link; "Guide" link (except on `/guide/`); "Open FoveaFlow" link; "Language" select; "Theme" select (Light, Dark, System).
- Footer: "FoveaFlow is free. No account, no paid plan.", links to Guide, Privacy, Terms.

### Shared page parts

- **Page hero** (`page-hero.svelte`): optional breadcrumb (e.g. Guide › Comparison), title, lede, action links, optional "Updated <date>", optional extra content (drill links).
- **Table of contents** (`page-toc.svelte`): "On this page" list of section links.
- **Page section** (`page-section.svelte`): heading, optional intro paragraph, content.
- **Step list** (`step-list.svelte`): numbered steps.
- **Closing call to action** (`page-cta.svelte`): heading, line ("Start slow. Adjust as you go."), action link.
- **Feature comparison** (`feature-comparison.svelte`): table "Feature / FoveaFlow / <other app>"; note "Checked against the public browser interface on <date>. Features may change. …" and a source link.
- **No-JavaScript fallback** (`site/noscript-fallback.astro`): replaces the trainer: heading, description, "FoveaFlow needs JavaScript to run its moving-target drills. The guide works without it.", links to home and guide.

### Guide (`/guide/`, `site/guide-page.svelte`)

- Hero: "FoveaFlow Guide", lede about choosing a drill; actions "Try Smooth Pursuit" and "How to practice"; "Choose a drill": the four drills, each a name linking to its section plus a summary.
- Table of contents: Choose a drill, How to practice, Motion paths, Controls, More guides, Guide FAQ, References.
- "How each drill works" (`guide-drill-sections.svelte`): intro about keeping the head still; per drill: name, summary, "Try this drill" link, numbered steps, "What it trains:" note.
- "Motion paths": one link per path, each opening Smooth Pursuit with that path.
- "A short break from the usual screen": three audiences, each a title plus a line: Gamers, IT professionals, People on screens all day.
- "Controls" (`guide-resource-sections.svelte`): "Motion and target" note explaining speed, size, shape, color, opacity, trail, and Lilac Chaser's own controls.
- "More guides": list of the three articles (title, description, link).
- "Guide FAQ": questions with answers (Which drill is best for steady tracking / quick refocus / a busy screen / fixation and edge-of-vision awareness? Which settings should I change first? How long should a session be?).
- "Research and background reading": numbered external references, with a disclaimer that they do not show FoveaFlow improves eyesight or game performance.
- Closing call to action: "Ready to try a drill?" → "Open FoveaFlow".

### Articles (`site/article-page.svelte`)

Hero with breadcrumb, title, summary, primary and optional secondary action, "Updated <date>". Guide-style pages show four drill links under the hero; comparison pages show the feature comparison table instead. Then table of contents, sections (paragraphs, numbered steps, or bullet lists), and a closing "Try it with your own settings" call to action.

- **FPS eye training warmup**: "A 7-minute FPS eye warmup", "Adjust the drill, not your posture", "What this warmup can and cannot tell you". Actions: "Start the warmup", "Read the guide".
- **FoveaFlow vs BlinkCamp**: "More control, when you want it", "Four ways to practice", "When BlinkCamp may be enough". Actions: "Try FoveaFlow", "Explore the drills".
- **FoveaFlow vs EyeTrainer.gg**: "A warmup you can adjust", "What is available today", "Choose by the controls you need".

### Legal pages (`site/legal-page.svelte`)

Hero with breadcrumb (FoveaFlow › Privacy/Terms), title, summary, "Updated <date>", table of contents, sections of paragraphs with optional external links.

- **Privacy Policy**: Data we do not collect, Settings saved in your browser, Cloudflare hosting and analytics, Cookies, How data is used, Your choices, Children, Contact.
- **Terms of Use**: Agreement, What the app is, Not medical care, Use safely, Free access, Acceptable use, Source code, Availability and warranty, Changes to these terms.

### Not found (`site/not-found-page.svelte`)

"This path ends here", "The page you're looking for does not exist. Open the trainer or use the guide to find your next drill.", actions "Open FoveaFlow" and "Read the guide".

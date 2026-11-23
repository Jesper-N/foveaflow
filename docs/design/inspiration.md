# Design inspiration

Where FoveaFlow's look comes from. Open these links and use the real components while designing, instead of working only from this summary.

- **bencho.dev** sets the theme: colors, Inter, Lucide icons, spacing, radii, and motion. Tokens in [`system.md`](./system.md) come from measurements of these blocks.
- **designbookmark.com/motion** gives ideas for components and interactions only. Don't take its colors, type, or radii.

Bencho has light and dark themes. Use the sun/moon button in its header to compare both.

## bencho.dev blocks (43)

Each block also renders live on the home page wall, https://bencho.dev/ (press "See more" to load all of them).

### Buttons, chips, and toggles

- "Huddle": https://bencho.dev/blocks/huddle — Basic card: 20px radius, 16px padding, 16/22 medium title, 12px muted names, full-width 40px pill primary button that scales to 0.96 on press.
- "Like": https://bencho.dev/blocks/like — 44px pill with an icon and a count, tabular digits, and a pop keyframe when liked. Padding is 4px tighter on the icon side.
- "Emoji reactions": https://bencho.dev/blocks/emoji-reactions — 36px reaction chips with a 36px round add button. Selecting a chip shows a ring and a rotate-pop animation.
- "Liquid toggle": https://bencho.dev/blocks/liq-toggle — 92×46 switch with a 36px thumb inset 5px. On, the track fills with ink and the thumb takes the surface color, animated over 0.42s.
- "Slide to confirm": https://bencho.dev/blocks/slide-confirm — 56px track with a 48px grip. Drag tracks the pointer 1:1 and the muted label fades as the grip covers it.
- "Generate": https://bencho.dev/blocks/generate — 42px button that turns into a progress state, with a small percent badge (11px, tabular digits).
- "Magnetic select": https://bencho.dev/blocks/magnet-select — 44px round buttons that pull toward the cursor, with a 0.22s ease-out return.
- "Step player": https://bencho.dev/blocks/step-player — Pagination as pill dots (36×8 when active) on a 36px slab.

### Inputs and selection

- "Label input": https://bencho.dev/blocks/label-input — 280×52 field. The label floats out of the placeholder and an SVG ring draws the outline. Shows type rhythm at 16px.
- "One-time code": https://bencho.dev/blocks/one-time-code — 36×44 cells with 12px radius, a 2px blinking caret, and a blurred rise into the "Verified" state.
- "Assignees" (picker): https://bencho.dev/blocks/picker — Popover list. The 44px trigger pill has a chevron that rotates over 0.22s. The menu card has 20px radius and 8px padding. Rows are 48px with 14px radius and a 6% ink hover. The 18px check mark has 6px radius.
- "Checklist": https://bencho.dev/blocks/checklist — 18px checkboxes with a 1.5px inset ring at 28% ink, a 12px tick drawn at stroke 2.6, and an "Add new task" row. The card height animates over 0.42s.
- "Todo tower": https://bencho.dev/blocks/todo-tower — 46px row cards with 10px radius and a 19px check. Completed rows translate and rotate away.
- "Search" (seek): https://bencho.dev/blocks/seek — 48px round button that grows into a search field. The lens icon's stroke animates.
- "Aspect ratio": https://bencho.dev/blocks/aspect — Segmented icon control: 36px track with 2px padding and a 32px sliding thumb in the surface color with a 0 1px 2px shadow. The image resizes over 0.52s.
- "Palette": https://bencho.dev/blocks/palette — Color swatches as 14px-radius segments inside a 24px-radius slab with 10px padding, which keeps the radii concentric. Useful for the ball color picker.

### Sliders and scrubbing

- "Wake slider": https://bencho.dev/blocks/wake-slider — A row of 3px tick bars as the slider, with a tabular 14px medium value next to it. Good reference for the Size and Speed sliders.
- "Time scrubber": https://bencho.dev/blocks/time-scrubber — Horizontal ruler with 2px ticks, a red 3px now-marker, a 30px tabular display with -0.03em tracking, and 11px hour labels.
- "Image compare": https://bencho.dev/blocks/image-compare — Drag handle: 36px knob with a soft shadow that springs to 1.08 scale while held, plus "Before/After" tags on a 36% ink scrim.
- "Rolling counter": https://bencho.dev/blocks/rolling-counter — Stepper: 16px-radius slab with 5px padding and 40×46 buttons with 11px radius (concentric). Digits roll, and buttons press to 0.9.

### Data and status

- "Stacked bars": https://bencho.dev/blocks/stacked-bars — Day/Week segmented control: 34px track at 6% ink, 2px padding, a 30px thumb that slides with translate over 0.22s, and 13px medium tabs. Also a 30px stat with a 13px muted unit.
- "Context meter": https://bencho.dev/blocks/context-meter — Segmented meter with 6px/2px corner radii and 32px chips with 8px swatches. The flex-grow morph takes 0.82s.
- "Toast stack": https://bencho.dev/blocks/toast-stack — 64px toasts with 20px radius, an 18px status icon, a 14/18 medium title, a 13/17 muted description, and a 28px pill action. Stacked layers use a 1px hairline ring.
- "Pull to refresh": https://bencho.dev/blocks/pull — Balance card with a 1H/1D range segmented control (12.4px radius thumb, springy translate), a sparkline, and a green delta in 12px tabular digits.
- "Asset swap": https://bencho.dev/blocks/asset-swap — Two stacked 20px-radius cards with a 40px flip button between them. Shows label, amount, and secondary-value type levels.
- "Heat map": https://bencho.dev/blocks/heat-word — Canvas text heat effect (decorative).

### Cards, media, and layout

- "Action node": https://bencho.dev/blocks/action-node — 272px card with 20px padding, a 30px icon tile (9.4px radius, 18px icon), a 16px medium name, a 13/1.5 muted description, and avatar chips with a 2px surface ring.
- "Now playing" (sound): https://bencho.dev/blocks/sound — Media row: 48px art with 10.67px radius, a 15px title over a 13px muted byline, a 3px progress rail, and a 36px white play button.
- "Card swap": https://bencho.dev/blocks/card-swap — Stacked cards that swap with transform over 0.6s ease-out, with a label pill on the image.
- "Image accordion": https://bencho.dev/blocks/image-accordion — Panels that expand on hover with a width morph.
- "Carousel": https://bencho.dev/blocks/carousel — Snapping horizontal media.
- "Tilt card": https://bencho.dev/blocks/tilt — Pointer-driven 3D tilt with a large soft shadow, 0 20px 44px -8px.
- "Folding bill": https://bencho.dev/blocks/folding-bill — 3D folding paper (decorative).
- "Magnifying dock": https://bencho.dev/blocks/dock — 68px dock (28px radius, 12px/16px padding, 12px gap) with 20px icons, a 3px active dot, and a white pill tooltip.
- "Create menu": https://bencho.dev/blocks/liq-create — Liquid "+" button that blooms into a menu (goo filter).
- "Signature pad": https://bencho.dev/blocks/signature — Canvas drawing with a baseline, a 12px hint, and a small "Clear" button (28px, 10px radius).
- "Voice note": https://bencho.dev/blocks/voice-note — Hold-to-record pill (56px). Slide to cancel, and the width morphs with a spring over 0.42s.

### Playful and physics (motion reference)

- "Slingshot": https://bencho.dev/blocks/slingshot — Pull-and-release physics on a ball.
- "Dragging ball": https://bencho.dev/blocks/drag-ball — Drag with inertia and bounds. Good motion reference for a moving target.
- "Eye tracker": https://bencho.dev/blocks/eye-tracker — Eyes follow the pointer, with a speech bubble (6/14/14 radius). Directly relevant to the FoveaFlow theme.
- "Particles": https://bencho.dev/blocks/particles — Canvas particles.
- "ASCII wake": https://bencho.dev/blocks/ascii-wake — ASCII field that reacts to the pointer.
- "Glass bubble": https://bencho.dev/blocks/glass-bubble — Glass refraction (decorative; we skip glass).

### Site chrome worth copying (bencho.dev itself)

- Filter chips ("Hover / Press / Drag …"): 36px pills, 0 16px padding, 14px medium text, 6% ink fill rising to 10% on hover. The active chip is filled with ink. Scale is 0.97 on hover and 0.94 on press.
- Header: 36px nav links (14px medium, text at 58% ink rising to full ink, 4% ink hover fill in light and 9% in dark), 36px round icon buttons whose hover fill grows from 0.86 scale, and a tooltip under the icon after a 0.42s delay.
- Wall: 28px-radius cards with a 12px gap. The open button appears on hover as a 38px round icon button in the corner.

## designbookmark.com/motion

https://designbookmark.com/motion. Individual components have no share links; find them on the page by name. Use them for interaction ideas. The measured card chrome there (20px radius, iOS system fills) is not part of our tokens.

Most relevant to FoveaFlow:

- "Morph tooltip": An icon toolbar whose tooltip morphs between buttons and shows a shortcut key chip ("Text T"). Model for the trainer toolbar tooltips with D/G/M/P/S hints.
- "Spring dropdown": A status select ("● Done ⌄") that springs open. Model for the drill and motion path selects.
- "Command button": A 40px search pill with a kbd chip (20px, 6px radius, 11px medium). Shows how to display shortcuts.
- "Segmented control": A sliding thumb between options. Model for the Theme (Light/Dark/System) and Direction (Forward/Reverse) choices.
- "Tab pill": A pill tab indicator that moves between tabs.
- "Toggle switch": Switch motion. Model for "Show trail" and "Show target letters".
- "Range slider" and "Jelly slider": Slider thumb feel. Model for the Size, Speed, Opacity, and Scale sliders.
- "Number stepper": An alternative for whole-number settings such as Targets and Distractors.
- "Checkbox list": Check animation.
- "Expand card": A card that grows into a detail view. Model for the guide and controls panels opening from their trigger.
- "Dynamic menu" and "Morph island": A floating island that resizes to its content. Model for the trainer HUD.
- "Bottom bar" and "Sidebar collapse": Mobile and desktop navigation patterns for the trainer controls.
- "Loading to success" and "Copy button": Feedback state swaps.
- "Step progress" and "Pagination dots": Progress indicators.
- "Focus mode": A distraction-free state, which fits the drill running with hidden controls.
- "Plan switch": A two-option switch with a sliding background.
- "Stat card" and "Profile card": Content card layouts.
- "Command palette": Keyboard-first selection list.
- "Hold to publish": Hold-to-confirm. An alternative pattern for "Reset to defaults".

Full list on the page: Thinking sphere, Cookie bite, Storage meter, Mention picker, Invite people, Focus mode, Plan switch, Letter limit, Pull cord, Morph tooltip, Spring dropdown, File drop, Command button, Morph island, Goo menu, Jelly slider, Hold to publish, Swipe deck, Springy input, Rubber dock, Parallax ticket, Glass lens, Pull to refresh, Word roll, Weight wave, Goo morph, Scramble text, Read along, Roll links, Prompt box, Streaming reply, Ghost suggestion, Goo thinking, Expand card, Fan cards, Stat card, Profile card, Magnetic button, Loading to success, Copy button, Like burst, Tab pill, Bottom bar, Dynamic menu, Segmented control, Sidebar collapse, Pagination dots, Command palette, Step progress, OTP code, Toggle switch, Star rating, Tag input, Number stepper, Range slider, Password strength, Checkbox list. The page also links a few third-party components from smoothui.dev (Siri orb, Exposure slider, Unlock Face ID, Scrubber, AI task list, Music toggle).

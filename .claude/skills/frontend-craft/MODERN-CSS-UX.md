# Modern CSS for UX — quality checklist by problem

CSS-FIRST-PATTERNS.md answers "which pattern replaces JS". This file answers a
different question: **which modern CSS features quietly fix real UX problems** —
layout shift, invisible focus, jumpy modals, unreadable text, clipped mobile UI.
Run through the relevant section whenever you touch that surface. AI-generated
CSS routinely misses these; reviewing for them is part of the craft.

## Progressive enhancement vs graceful degradation (the working stance)

- PE (bottom-up): core works everywhere, layers enhance. GD (top-down): build the
  ideal, patch the rest. Context decides — a JS-heavy dashboard cannot PE its way
  to "works without JS", and that is fine.
- For CSS features the pragmatic rule is: **baseline first, enhancement gated**.
  Declare the fallback, then the modern property (cascade override), or wrap in
  `@supports` when the enhancement would otherwise BREAK the page (e.g.
  `animation-timeline` leaving content stuck at `opacity: 0`).
- Two fallback levels for structural features (container queries etc.):
  "do nothing" (stacked baseline everywhere) or media-query fallback isolated in
  `@supports not (...)` so old and new logic never fight.

## State-aware CSS

- `:has()` is the parent selector: `form:has(.error)`, `tr:has(:checked)` —
  deletes the classList-toggling JS. **Perf rule: never anchor `:has()` to
  `body`/`:root`/`*`** — every DOM mutation re-evaluates it; anchor to the
  smallest sensible component.
- **Focus**: never `outline: none` globally (`* { outline: none }` blinds keyboard
  users). Style `:focus-visible` (keyboard-only ring), keep mouse clicks clean;
  `:focus-within` highlights the group containing a focused child. Custom ring
  must be high-contrast; the "Oreo" double ring (light layer + dark layer stacked
  via outline + box-shadow) survives any background.
- `accent-color` themes native checkbox/radio/range/progress in one line, with
  automatic contrast for the internal check/dot. Use it before rebuilding controls.
- `caret-color` matches the text cursor to the brand / keeps it visible in custom
  dark themes. `transparent` only for terminal-style custom cursors — never in
  normal forms.
- `field-sizing: content` = auto-growing textarea with zero JS. Always pair with
  `max-height` (revert to scroll), `min-height`/`min-inline-size` so the empty
  state still reads as a multi-line field; test that growth does not push the
  submit button under the mobile keyboard.

## Responsive components and layout stability

- **Container queries over media queries for components**: `container-type:
  inline-size` on the wrapper, `@container (min-width: ...)` in the child. The
  component adapts to the space it is given (sidebar vs main), not the screen.
  `cqi` + `clamp()` = per-container fluid type. Media queries stay for page-level
  layout and as the gated fallback.
- **subgrid** aligns card internals across a row (`grid-template-rows: subgrid`)
  — kills fixed-height titles and `margin-top: auto` hacks; degrades to a normal
  grid.
- **Viewport units on mobile**: `100vh` ignores collapsing browser chrome. Use
  `svh` for must-fit hero/modals, `lvh` for decorative full-bleed, `dvh` when you
  want live resize. Always declare plain `vh` on the line above as fallback.
- **`env(safe-area-inset-*)`** (+ `viewport-fit=cover` meta) keeps fixed
  headers/bottom bars clear of notches and home indicators; defaults to 0 on
  desktop so it is zero-risk.
- **CLS killers**: `aspect-ratio` on every image/video/iframe slot (replaces the
  padding-top hack; `aspect-ratio: 1` + `border-radius: 50%` for avatars);
  `scrollbar-gutter: stable` so overlay-scroll/`overflow: hidden` toggles (modals)
  do not shift the page ~15px; `contain-intrinsic-size` whenever you use
  `content-visibility`.
- **`fit-content` for content-sized blocks**: block stays centered via
  `margin-inline: auto`, shrinks to its text, wraps at the container edge —
  resilient to localization; no `inline-block`/magic-width guessing.

## Typography

- Name the defects: rivers (justify gaps), rags (jagged edge), widows/orphans
  (stranded last words). Modern fixes are one-liners:
  - `text-wrap: balance` — headings/short blocks ONLY (engine caps it at ~4-6
    lines; it is expensive).
  - `text-wrap: pretty` — body/card paragraphs; prevents single-word last lines.
- Fluid type: `font-size: clamp(min, preferred-vw, max)` — no breakpoint ladder.
  The same floor/ceiling logic works for padding, gaps, widths.
- Line length: `max-width: min(65ch, 100%)` — 50-70 chars is the readable band;
  `ch` scales with the font and user zoom. Size inputs by expected content
  (zip/CVV do not need 300px).
- Truncation: `display: -webkit-box; -webkit-line-clamp: N; -webkit-box-orient:
  vertical; overflow: hidden` — the prefixed combo IS the standard (~95%);
  recalculates on resize/zoom for free.
- `text-box-trim: trim-both` + `text-box-edge: cap alphabetic` removes the
  invisible leading above/below text so padding measures true — buttons, badges,
  icon+text baselines. ~72% support: gate with `@supports`.

## Light, dark, and adaptive colors

- Always declare supported schemes twice: `<meta name="color-scheme"
  content="light dark">` (parsed before CSS — first value is the fallback
  preference) AND `color-scheme` on `:root`. The CSS property can also scope one
  subtree to a fixed scheme.
- `light-dark(lightVal, darkVal)` inlines both theme values in one declaration
  (requires `color-scheme`); newer engines accept images/gradients too — gate the
  image form behind `@supports`, keep `prefers-color-scheme` blocks as baseline.
- `color-mix(in oklab, base, white 20%)` generates hover/active/disabled shades
  and whole ramps from one token — mix in `oklab` (perceptually uniform), not
  srgb (muddy). Provide a static fallback color the line above.

## Overlays, scrolling, contextual UI

- **`inert`** freezes a subtree completely: no focus, no clicks, invisible to
  screen readers. Use for open-drawer backgrounds, submitting forms
  (double-submit guard), off-screen carousel slides. This replaces hand-rolled
  focus traps (`<dialog>.showModal()` applies it automatically).
- **Dialog vs popover**: dialog = blocking (confirmations, forms; focus trap +
  Esc + `::backdrop`); popover = non-blocking (menus, tooltips; top-layer +
  light-dismiss). Both live in the top layer — z-index wars are over; do not
  hand-position popovers, pair with anchor positioning.
- **Anchor positioning** replaces Popper/Floating UI: `anchor-name` /
  `position-anchor` / `anchor()` insets, `position-try-fallbacks: flip-block
  flip-inline` for native collision flipping, `anchor-size(width)` to match the
  trigger. ~75-80%: keep the JS library only if old-browser support is
  contractual; polyfill exists.
- **`overscroll-behavior: contain`** on every isolated scroll area (modal body,
  drawer, dropdown list, chat) — stops scroll chaining to the page and disables
  accidental pull-to-refresh.
- **`scroll-margin-top: var(--header-height)`** on anchor targets so sticky
  headers never cover the heading navigated to (tie it to the header var, not a
  magic number).

## Motion and interaction feedback

- `@property` registers typed custom properties -> animatable gradients, count-up
  numbers, typo-safe tokens (garbage value falls back to `initial-value`).
- `@starting-style` = entry transitions for elements just added to the DOM or
  becoming displayable (dialog/popover) — no requestAnimationFrame class hacks;
  check support via `@supports (transition-behavior: allow-discrete)`.
- `interpolate-size: allow-keywords` (on `:root`) lets `height: 0 -> auto`
  animate natively — accordions/expanders without scrollHeight JS. ~70%,
  perfect PE: unsupported = instant open.
- View Transitions (`@view-transition { navigation: auto }`) give MPA pages
  app-like continuity; same `view-transition-name` on both pages morphs an
  element (thumbnail -> hero). Spatial continuity lowers cognitive load — the
  point is orientation, not decoration.
- Scroll-driven animations (`animation-timeline: scroll() / view()` +
  `animation-range`) run on the compositor — smooth even when the main thread is
  busy. MUST be `@supports`-gated: an ungated `view()` fade-in leaves content at
  `opacity: 0` in non-supporting browsers.

## Respecting OS-level user preferences

A user who flips an OS toggle is stating a need — honor it:

- `prefers-reduced-motion: reduce` — remove SPATIAL movement (slides, zooms,
  parallax); opacity fades are generally safe. Reduced != zero.
- `prefers-contrast: more` — darken text tokens, thicken borders; usually just a
  few variable overrides.
- `prefers-reduced-transparency: reduce` — swap glassmorphism
  (`backdrop-filter`) for solid fills; bonus: cheaper rendering.
- `prefers-reduced-data: reduce` — skip decorative background images and heavy
  webfonts (support still near zero, but harmless to include).
- `prefers-color-scheme` — see colors section.

## Architecture and rendering performance

- `@layer reset, base, components, utilities;` — declared order beats
  specificity; drop third-party CSS into a low layer and stop escalating
  selectors / using `!important`.
- `content-visibility: auto` + `contain-intrinsic-size: auto <estimate>` skips
  rendering below-the-fold heavy sections (long comments, footers, media grids)
  -> faster first render/INP. NEVER on above-the-fold content (hurts LCP);
  intrinsic-size estimate prevents scrollbar jumps.
- `object-view-box: inset(...)` / `xywh(...)` crops a real `<img>` like an SVG
  viewBox (keep `object-fit` to avoid stretch); it interpolates, so hover-zoom
  crops animate without wrapper divs.
- `corner-shape: squircle | scoop | bevel | notch` (with `border-radius` for
  depth) goes beyond rounded corners; falls back to plain radius.

## Review checklist (what AI output usually misses)

- [ ] Focus rings preserved (`:focus-visible`), never globally removed
- [ ] Images/video/iframe have `aspect-ratio` (or width+height) — no CLS
- [ ] `scrollbar-gutter: stable` in base styles; `overscroll-behavior: contain` on inner scrollers
- [ ] Mobile heights use `svh/dvh` with `vh` fallback; safe-area insets on fixed bars
- [ ] Headings `text-wrap: balance`, body `text-wrap: pretty`, text blocks `max-width: min(65ch, 100%)`
- [ ] Anchor targets have `scroll-margin-top` matching the sticky header
- [ ] Every animation has a `prefers-reduced-motion` story; scroll-driven ones are `@supports`-gated
- [ ] Components respond to their container, not only the viewport, where reuse is expected
- [ ] Theme: `color-scheme` declared in meta + CSS; shades derived via `color-mix(in oklab, ...)`

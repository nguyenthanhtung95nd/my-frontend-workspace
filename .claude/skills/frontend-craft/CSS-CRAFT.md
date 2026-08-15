# CSS Craft

Layout, responsiveness, and theming that survive real content and real devices. Principles
are the same whether you write vanilla CSS, CSS Modules, or Tailwind utilities — only the
syntax differs.

## Layout systems — pick by intent

- **Flexbox** — one-dimensional: a row/column of items (nav bar, toolbar, card footer).
- **Grid** — two-dimensional: page/section layouts, card grids, dashboards.
- Don't force everything into one. A card grid is `display: grid` with
  `grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr))`; the card's internals are
  often Flex.

## Responsive — mobile-first

- Design the smallest screen first, then add breakpoints upward (`min-width`).
- Prefer intrinsic responsiveness (`minmax`, `clamp`, `auto-fit/auto-fill`, container
  queries) over hardcoded breakpoints where you can — the layout adapts to content, not to
  a device list.
- Fluid type: `font-size: clamp(1rem, 2.5vw, 1.5rem)` instead of a ladder of breakpoints.
- Never fix a height that content can exceed; let it grow. Constrain width with `max-width`,
  not the panel next to it.

## Design tokens — parameterize, don't hardcode

- Name your values once and reuse: color, spacing, radius, typography, shadow.
  Vanilla: CSS custom properties (`--color-accent`, `--space-4`). Tailwind: the theme
  config. Never scatter raw `#00bfa5` / `13px` through the code.
- Tokens keep theming (dark/light) and rebrands a one-place change, and they let the AI
  generate on-brand output when you feed the token names into the prompt.

```css
:root { --accent:#00bfa5; --bg:#121212; --space-4:1rem; --radius:.75rem; }
.card { background:var(--bg); padding:var(--space-4); border-radius:var(--radius); }
```

## Interaction & motion

- `:focus-visible { outline: 2px solid; outline-offset: 2px }` on every interactive element
  — never remove focus outlines without replacing them.
- Respect user preference: wrap non-essential animation in
  `@media (prefers-reduced-motion: no-preference) { … }` (or disable it under
  `prefers-reduced-motion: reduce`).
- Hover effects are enhancements — the UI must work without hover (touch/keyboard).

## Visual hygiene

- One owner for a corner radius / shadow — don't round both a card and its inner image
  (they misalign). Clamp overflow so hover-zoom doesn't bleed.
- WCAG AA contrast for text; don't convey state by color alone.
- Tap targets ≥ 44×44px.

## Money & locale (a quiet correctness bug)

Format currency with `Intl.NumberFormat`, not `toFixed(2)` — it respects locale and keeps
server/client rendering identical.

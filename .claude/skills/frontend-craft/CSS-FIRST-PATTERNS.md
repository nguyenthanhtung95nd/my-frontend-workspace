# CSS-First Patterns — interaction without JavaScript

Modern HTML/CSS now covers most UI patterns that historically required JS. Reach for
the platform first; reach for JS deliberately. This file is the pattern catalog and
the decision discipline behind that mindset.

## The Rule of Least Power

Use the least powerful tool that gets the job done:

1. **Semantic HTML** structures the content and ships behavior for free
   (`<dialog>`, `<details>`, `<select>`, `popover`, `<input type="range">`).
2. **CSS** handles presentation AND most interaction (state, motion, reveal, theming).
3. **JavaScript** only where it adds real value: data fetching, business logic,
   persistence, complex state. Not because it is familiar.

HTML/CSS are declarative — you state intent and the browser optimizes execution.
JS is imperative — every step is your complexity, your performance cost, your bug
surface. A CSS-first solution is usually smaller (a JS slider library is 50-100KB;
the CSS equivalent is ~30 lines), more accessible by default, and cheaper on
CPU/battery.

**The pre-JS checklist** (run it before writing any script):

1. Can semantics + CSS handle it? If yes, do that.
2. If not, can a native element or attribute get you 80% there?
3. If you add JS, is it necessary, small, and resilient?
4. Do you have graceful fallbacks and accessibility covered?
5. Did you measure the impact (bundle size, CLS/LCP, battery/CPU)?

## Engineering principles that apply to every pattern below

- **Fallback-first, enhance with `@supports`.** Declare the safe baseline, then layer
  the modern feature inside `@supports (prop: value)` or
  `@supports selector(:has(*))`. Unsupported browsers keep a working (if plainer) UI.
  Never let the enhancement be the only path.
- **`prefers-reduced-motion` on every animation.** Disable non-essential motion under
  `reduce`; if the moving element is purely decorative, hide it entirely; for value
  animations (count-ups), jump straight to the final value.
- **Custom properties are the component API.** Configure components with inline vars
  (`style="--quantity:10; --duration:10s"`), drive shared state through one var
  (`--pos`, `--state-color`) so CSS reads one source of truth and any JS touches only
  that var — never classes or inline styles.
- **`@property` makes vars animatable.** Register a typed custom property
  (`syntax: "<angle>" | "<integer>"`) and keyframes can interpolate it — spinning
  gradients, count-up numbers, anything numeric.
- **Pseudo-elements are free markup.** Borders, glows, progress fills, tracks,
  markers, backdrops (`::before/::after`, `::backdrop`, `::scroll-marker`) — chrome
  belongs in CSS, not in extra divs.
- **Animate compositor-friendly properties.** `transform`/`opacity`/`mask`, e.g.
  `scaleX(0 -> 1)` for a progress fill instead of `width` — no layout, no jank.
- **Native elements carry the a11y.** `<dialog>` gives focus trap + Escape + inert
  background; `<details>` gives keyboard toggling; `<input type="range">` gives
  keyboard/touch/AT support; popover gives top-layer + light-dismiss + focus return.
  Rebuilding these in divs+JS means re-implementing all of it, usually worse.
- **Generated content needs an a11y bridge.** Pseudo-element text is invisible to
  assistive tech — mirror the real value in the DOM (`aria-label="10"`), wire
  relationships with `aria-labelledby`/`aria-describedby`.
- **CSS is UX, never security.** Client-side validation states are guidance;
  the server re-validates everything.
- **Vendor-prefixed selectors get their own rule.** One unknown selector drops the
  whole rule — write `::-webkit-slider-thumb` and `::-moz-range-thumb` separately;
  duplicate `mask` as `-webkit-mask` for older WebKit.

## Decision table — before writing JS for X

| UI need | Platform-first answer | Key technique |
| --- | --- | --- |
| Style a parent by child state | `:has()` | `fieldset:has(input:checked)`; keep conditions shallow for perf |
| Dark mode | `prefers-color-scheme` + tokens | vars on `:root` per scheme; `light-dark()` when support allows; JS only to persist the choice |
| Manual theme toggle | `:root:has(option[value=dark]:checked)` | native `<select>` drives `color-scheme`; ~5 lines JS for localStorage |
| Smooth in-page nav | `scroll-behavior: smooth` | `scroll-padding-top` (global offset) or `scroll-margin-top` (per element) for fixed headers |
| Modal | `<dialog>` + `showModal()` | `form method="dialog"` closes free; `::backdrop`; `@starting-style` for entry animation; 3 lines JS to open |
| Accordion | `<details>/<summary>` | animate via sibling `.content` grid `0fr -> 1fr`; `::details-content` emerging |
| Infinite logo marquee | `@keyframes` + staggered `animation-delay` | `delay = (duration/quantity) * (position-1) - duration`; `mask-image` edge fade; pause on `:hover`/`:focus` (`tabindex="0"`) |
| Numbered headings / counts | CSS counters | `counter-reset`/`counter-increment`/`counter()`; nested via per-section reset |
| Animated count-up | `@property <integer>` + keyframes | print via `counter-reset: n var(--c)` + `content: counter(n)`; `aria-label` the final value |
| Animated/glowing border | pseudo-element + conic-gradient | negative `inset`, `@property --angle`, duplicate blurred layer = glow |
| Page transitions (MPA) | View Transitions | `@view-transition { navigation: auto }`; `view-transition-name`; style `::view-transition-old/new()` |
| Move element along a curve | Motion Path | `offset-path: path('...')` + animate `offset-distance`; container size must equal SVG viewBox |
| Before/after slider, ratings fill, image cutouts | CSS masks | two complementary `linear-gradient` masks meeting at `var(--pos)`; native range as the control; stack via `grid-area: 1/1` |
| Form validation UX | `:user-valid` / `:user-invalid` | fire only after interaction (no red on untouched fields); one `--state-color` var; server still validates |
| Scroll progress / reveal-on-scroll | scroll-driven animations | `animation-timeline: scroll()` or `view()` + `animation-range`; runs off-thread |
| Tooltip/menu overlay | Popover API | `popover` + `popovertarget(+action)`: top-layer, light-dismiss, focus for free; animate with `:popover-open` + `@starting-style` + `transition-behavior: allow-discrete` |
| Styled select | `appearance: base-select` | `<button><selectedcontent/></button>` inside a real `<select>`; `::picker(select)`, `::picker-icon`, `option:checked`, `::checkmark` |
| Tethered positioning | Anchor positioning | `anchor-name`/`position-anchor` + `anchor()` in insets; `position-try: flip-block flip-inline`; `anchor-size(width)` to match trigger |
| Carousel | scroll-snap (+ generated controls) | `scroll-snap-type: x mandatory` baseline everywhere; `::scroll-marker`, `::scroll-button()`, `:target-current` as enhancement |

## Technique notes worth remembering verbatim

- **Height animation without JS**: `<details>` content in a sibling div with
  `display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s`
  -> `details[open] + .content { grid-template-rows: 1fr }` (inner el needs
  `overflow: hidden`). Works for any expand/collapse, not just accordions.
- **Perfect overlap without absolute positioning**: give every child
  `grid-area: 1 / 1` in a grid container — resilient stacking for compare sliders,
  star ratings, layered art.
- **Entry/exit animation for display-toggled elements** (dialog, popover):
  transition `opacity`/`translate`, add `@starting-style` for the entry frame, and
  `transition-behavior: allow-discrete` so the exit can play before removal.
- **`:has()` inverted hover**: `.list:has(.card:hover) .card:not(:hover) { filter: blur(4px) }`.
- **Scroll offset for sticky headers** is CSS, not a JS scroll listener:
  `scroll-padding-top: 80px` on `html`.
- **Emerging (progressive enhancement only)**: `@function` custom functions, `if()`
  inline conditionals, `item-flow` masonry, `random()`, `sibling-index()/count()`
  for pure-CSS staggers, typed `attr()` on any property, `field-sizing: content`
  for auto-growing inputs.

## How this composes with the rest of frontend-craft

- SEMANTIC-HTML.md tells you which element to start from; this file tells you how far
  that element + CSS can go before JS enters.
- CSS-CRAFT.md holds layout/tokens/responsive fundamentals; the patterns here build
  on those tokens (theme vars ARE the dark-mode mechanism).
- In React/Next (nextjs-patterns): a CSS-first pattern often removes a `"use client"`
  boundary entirely — `<details>`, `<dialog>`, popover, scroll-snap and `:has()`
  state styling need no event handlers, so the component can stay a Server Component.
  Prefer that over `useState`-driven show/hide whenever the table above has a row.

# Accessibility

Accessibility is how a UI communicates to everyone — not an afterthought or a checklist you
bolt on at the end. "Looks polished" is not "usable by a screen-reader or keyboard user".
AI cuts these corners silently unless you demand otherwise.

## The discipline

- **Semantic first** (see SEMANTIC-HTML): real elements give you role, keyboard, and focus
  for free. Most a11y wins are just correct markup.
- **Keyboard**: everything interactive is reachable and operable by keyboard, in a logical
  order, with a visible focus state. Test by unplugging the mouse.
- **Screen readers**: label regions and controls; describe images with meaningful `alt`
  (empty `alt=""` for decorative); mark decorative icons `aria-hidden="true"`.
- **Contrast & color**: WCAG AA contrast; never rely on color alone to convey meaning.
- **Motion**: respect `prefers-reduced-motion`.
- **Targets**: interactive elements ≥ 44×44px.

## ARIA rules

- **No ARIA is better than bad ARIA.** A native `<button>`/`<nav>`/`<label>` beats a `<div>`
  with `role=`.
- Use ARIA to fill gaps native HTML can't: `aria-label`/`aria-labelledby` for unlabelled
  regions, `aria-describedby` for hints/errors, `aria-live` for async updates,
  `aria-expanded`/`aria-controls` for disclosure widgets.
- Never put interactive roles on non-interactive elements without also wiring keyboard
  handling — use the real element instead.

## Tooling (make a11y verifiable, not a vibe)

- **axe-core** (or `@axe-core/playwright`, `jest-axe`) — automated WCAG violation scans in
  CI. Catches the mechanical failures (missing labels, contrast, ARIA misuse).
- **Lighthouse CI** — a11y + performance budgets on every PR; block merges below threshold.
- **Playwright** — keyboard-flow and visual-regression tests for the interactive paths.
- Automated tools catch ~40% of issues — still do a manual keyboard + screen-reader pass on
  key flows.

## Verify before "done"

- Tab through the whole flow: reachable, ordered, visible focus, no traps.
- Every form field: labelled, errors announced, error-summary focusable.
- Images: meaningful `alt` or `aria-hidden`.
- Run axe; fix violations. Confirm contrast on text and interactive states.

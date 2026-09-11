# 06 - Components and the DOM

## Give Vitest a DOM
Node has no DOM, so any render/query/`localStorage` access throws without a DOM environment.
```ts
// vitest.config.ts
test: { environment: 'jsdom' }        // or 'happy-dom' (faster, lower memory)
```
Per-file override: `// @vitest-environment happy-dom` at the top. Neither is a real browser --
green here does not guarantee cross-browser behavior (that is the E2E layer's job).

## Query like a user (Testing Library)
Query by role, label, and text -- not by `id`/class. This decouples tests from implementation,
survives refactors, and doubles as an accessibility check.
```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
render(<SecretForm />);
await user.type(screen.getByLabelText('Secret'), 'my secret');
await user.click(screen.getByRole('button', { name: 'Store Secret' }));
expect(localStorage.getItem('secret')).toBe('my secret');
```
Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (last resort). If a
component needs a testid because it has no accessible name, that is a real bug.

## jest-dom matchers
Import once (in the setup file) for expressive DOM assertions with good failure messages.
```ts
import '@testing-library/jest-dom/vitest';
expect(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled();
expect(screen.getByTestId('count')).toHaveTextContent('0');
```
Key matchers: `toBeInTheDocument`, `toBeVisible`, `toBeDisabled/Enabled`, `toHaveValue`,
`toBeChecked`, `toHaveAttribute`, `toHaveClass`, `toHaveAccessibleName`, `toBeRequired/Invalid`.
The same matchers work regardless of the rendering library.

## Prefer `user-event` over `fireEvent`
One real user action is many DOM events (focus -> keydown -> keyup -> change). `userEvent` replays
the whole sequence; `fireEvent` dispatches a single low-level event and misses real behavior.
```ts
const user = userEvent.setup();      // once, before render
await user.click(button);            // async -- await every call, or you get a false pass
```
`userEvent` methods are async. Reserve `fireEvent` for events `userEvent` does not model (scroll,
drop, media, `online`/`offline`):
```ts
import { fireEvent } from '@testing-library/react';
fireEvent.scroll(container, { target: { scrollY: 200 } });   // synchronous, low-level
```
Reaching for `fireEvent` on a plain click/type is a smell -- it bypasses realistic sequencing and
disabled/accessibility checks.

## Async UI and shared DOM state
Await appearing elements with `findBy*` (they retry): `expect(await screen.findByText(/loaded/i)).toBeInTheDocument()`.
Reset DOM/storage between tests so state does not leak:
```ts
beforeEach(() => localStorage.clear());
```
With a DOM environment active, use the real `localStorage` API rather than a brittle mock. Avoid
asserting via `querySelector` + manual `.value` -- that tests internals, not user behavior.

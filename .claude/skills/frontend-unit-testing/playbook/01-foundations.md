# 01 - Foundations

## What "passing" means
A test passes only because nothing threw -- `expect().toBe()` throws on mismatch, and any thrown
Error fails the test. So a test that can never fail gives false confidence during a refactor.
Author the assertion to fail first, watch red, then make it pass.

Guard against silent no-op tests (especially async):
```ts
import { it, expect } from 'vitest';
it('runs its assertion', () => {
  expect.assertions(1);   // fail if the assertion never ran
  expect(add(2, 2)).toBe(4);
});
```

## Import the real unit
Test the actual exported function/component -- never redefine the logic inside the test file, or
you test a duplicate that will not catch regressions.
```ts
// arithmetic.ts
export const add = (a: number, b: number) => a + b;
// arithmetic.test.ts
import { describe, it, expect } from 'vitest';
import { add } from './arithmetic';
describe('add', () => {
  it('adds two positives', () => expect(add(1, 2)).toBe(3));
  it('adds negatives', () => expect(add(-2, -3)).toBe(-5));
});
```
`it` and `test` are aliases -- pick one. `describe.todo('subtract')` stubs a planned suite.

## Arrange-Act-Assert
Split every test into Arrange (setup), Act (invoke), Assert (verify); one scenario per test. A
uniform shape makes a failure pinpoint fast and doubles as documentation.
```ts
it('throws on divide by zero', () => {
  const a = 10, b = 0;                       // Arrange
  expect(() => divide(a, b))                 // Act + Assert
    .toThrow('Cannot divide by zero');
});
```
Multiple unrelated assertions per test blur which behavior broke.

## The test spectrum (pick the cheapest)
| Type | Scope | Cost | Tool |
|------|-------|------|------|
| Unit | one function/hook/pure component | ms | Vitest (+ Testing Library) |
| Integration | units together, mocked network | slower; one ~= many units of confidence | Vitest + MSW |
| E2E | full browser flow | slowest, brittle | Playwright (see `automate-e2e-self-testing`) |

Keep the pyramid wide at the base; do not over-invest in E2E early. The labels are fuzzy -- do not
argue them; choose the cheapest test that yields the confidence you need.

## Runner vs assertion library
Vitest is both the runner and ships a Chai-based `expect` -- no separate assertion install on a
Vite/TS project. Prefer chainable `expect` matchers over raw `assert` (better intent + diffs).
```ts
expect(sum).toBe(2);            // Object.is / reference identity
expect(obj).toEqual({ a: 1 });  // deep structural
expect(list).toHaveLength(3);
expect(list).toContain('x');
```

## Running the suite
```json
{ "scripts": { "test": "vitest", "test:run": "vitest run" } }
```
`vitest` watches (never exits); use `vitest run` in CI/hooks or it hangs. Flags after `npm test`
need the `--` separator. Filter to one unit while iterating (`vitest <file>` or `-t "name"`)
instead of running everything.

# Audit scorecard

For an existing project, score each item **present / partial / missing**, note a one-line gap and a
concrete fix, then rank fixes: foundations first, then the layer the change touches. Details per
layer live in [playbook/](playbook/).

## Foundations ([01](playbook/01-foundations.md))
- [ ] Runner + a `test` (watch) and `test:run` (CI) script; `vitest run` used in CI/hooks
- [ ] Tests import the real unit (no logic redefined inside the test)
- [ ] Arrange-Act-Assert, one scenario per test
- [ ] Test type matches the goal (unit vs integration vs E2E) -- cheapest sufficient test

## TDD + assertions ([02](playbook/02-tdd-and-assertions.md))
- [ ] Tests written to fail first (red) before implementation
- [ ] Correct equality matcher (`toBe` vs `toEqual` vs `toStrictEqual`)
- [ ] Asymmetric matchers for volatile fields; not over-loosened
- [ ] Errors asserted via a wrapped callback + message; descriptive error text

## Test doubles ([03](playbook/03-test-doubles.md))
- [ ] Double chosen by intent (mock/spy/stub); real thing preferred where cheap
- [ ] Only boundaries mocked (API/DB/fs/globals), not own pure logic
- [ ] Dependencies injected (props/params/context) for testability
- [ ] Mocks reset between tests (`clearAllMocks`/`restoreAllMocks`); no leakage

## Mocking recipes ([04](playbook/04-mocking-recipes.md))
- [ ] Fake timers paired with `useRealTimers()`; system time pinned where needed
- [ ] Network mocked (MSW at the network level for >1 call); `onUnhandledRequest: 'error'`
- [ ] Env / globals stubbed and restored

## Async + edge ([05](playbook/05-async-and-edge.md))
- [ ] Async tests `await`ed; `expect.hasAssertions()` where a no-op is possible
- [ ] Both `resolves` and `rejects` paths tested; async errors via `.rejects.toThrow`
- [ ] Unhappy path + every branch/boundary (`test.each` table)

## Components + DOM ([06](playbook/06-components-and-dom.md))
- [ ] DOM environment configured (jsdom/happy-dom)
- [ ] Testing Library queries by role/label/text (testid last resort)
- [ ] jest-dom matchers imported once in setup
- [ ] `user-event` (awaited) over `fireEvent`; DOM/storage reset between tests

## Snapshot + coverage ([07](playbook/07-snapshot-and-coverage.md))
- [ ] Snapshots used sparingly, small, with a paired explicit assertion
- [ ] Snapshot updates reviewed intentionally, not rubber-stamped
- [ ] Coverage treated as a diagnostic; thresholds low; critical paths prioritized
- [ ] `.only`/`.skip` removed; tests independent of order

## Config + CI ([08](playbook/08-config-and-ci.md))
- [ ] Central `vitest.config.ts` (aliases, setup file, isolate, coverage)
- [ ] Reporters keep `default` + a machine format for CI
- [ ] Hooks reset shared state; typed fixtures over module-level `let`
- [ ] `vitest related` for fast local runs; full suite in CI
- [ ] CI runs `vitest run` on PRs as a required check (GATED: org policy)

> Cross-browser E2E and the browser-level self-testing loop live in **automate-e2e-self-testing** --
> this scorecard stops at the unit/component layer.

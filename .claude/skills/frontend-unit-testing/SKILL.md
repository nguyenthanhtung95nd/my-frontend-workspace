---
name: frontend-unit-testing
description: Writes and audits fast, deterministic unit and component tests (Vitest + Testing Library) for frontend/TypeScript code so the agent verifies its own logic in milliseconds before human review. Use when adding or reviewing unit/component tests, setting up Vitest, choosing test doubles, mocking dependencies, testing async/errors, or deciding coverage strategy.
---

# Frontend Unit Testing

The base of the testing pyramid: many fast unit/component tests that run in milliseconds, so the
agent can self-verify logic on every edit. A test passes only because **nothing threw** -- never
because code is "correct." Prove a test can fail before trusting it green.

## Step 0 -- Detect, then pick a mode
Inspect first: framework (Vite / Next / other), runner (Vitest / Jest), `test` scripts, existing
`vitest.config`, a DOM environment (jsdom/happy-dom), a setup file, and coverage config.

- **Bootstrap** (no unit tests) -> install the discipline end to end (runner + config + first test + script).
- **Audit** (tests exist) -> score each layer with [CHECKLIST.md](CHECKLIST.md), report gaps, apply what is missing.

Always show the plan and get confirmation before writing files or installing anything.

## The discipline, in order
1. **Foundations** -- import the real unit (never inline it); Arrange-Act-Assert, one scenario per test; pick the cheapest test that gives the confidence. See [playbook/01-foundations.md](playbook/01-foundations.md).
2. **TDD + assertions** -- red-green-refactor; the right equality matcher (`toBe` vs `toEqual` vs `toStrictEqual`); assert the right thing. See [playbook/02-tdd-and-assertions.md](playbook/02-tdd-and-assertions.md).
3. **Test doubles** -- mock/spy/stub by intent; mock only boundaries you do not own; inject dependencies; reset between tests. See [playbook/03-test-doubles.md](playbook/03-test-doubles.md).
4. **Mocking recipes** -- time, env, fetch, file system, DOM/globals, MSW (mock at the network level). See [playbook/04-mocking-recipes.md](playbook/04-mocking-recipes.md).
5. **Async + edge** -- `await` everything; `resolves`/`rejects`; the unhappy path; every branch and boundary. See [playbook/05-async-and-edge.md](playbook/05-async-and-edge.md).
6. **Components + DOM** -- jsdom; Testing Library `getByRole`; `user-event`; jest-dom matchers. See [playbook/06-components-and-dom.md](playbook/06-components-and-dom.md).
7. **Snapshot + coverage** -- snapshots sparingly; coverage is a diagnostic, not a target. See [playbook/07-snapshot-and-coverage.md](playbook/07-snapshot-and-coverage.md).
8. **Config + CI** -- Vitest config, hooks, test context, parameterize, filter, related-files, CI. See [playbook/08-config-and-ci.md](playbook/08-config-and-ci.md).

## Tooling policy (enterprise-safe)
- **Local-first (recommend freely):** Vitest, Testing Library, `@testing-library/user-event`,
  jest-dom, jsdom/happy-dom, MSW, coverage (v8) -- all run on the machine.
- **GATED -- needs org/IT approval:** CI runners / branch-protection policy, and any real-browser
  or cloud infra. Flag, prefer a local-first path, do not stand up shadow IT.

## Where this sits in the pyramid
This skill is the **unit/component** base. For browser-level **E2E** self-testing (Playwright,
real browser, deterministic mock target, evidence/guardrails), use **automate-e2e-self-testing**.
Together they cover the pyramid: fast units here, a few E2E flows there. Keep the two runners on
separate globs -- Vitest owns `*.test.*`, Playwright owns `*.spec.ts`.

## Output
Either config + setup + at least one **passing** test + a `test` script; or an audit report with
prioritized gaps. Finish by stating what changed and the exact command to run.

Templates: [templates/vitest.config.ts](templates/vitest.config.ts), [templates/setup.ts](templates/setup.ts), [templates/example.test.tsx](templates/example.test.tsx).

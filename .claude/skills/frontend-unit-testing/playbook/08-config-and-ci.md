# 08 - Config and CI

## Centralize config
Keep test behavior in `vitest.config.ts`, not scattered per-test flags.
```ts
import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },   // align with tsconfig paths
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup.ts',
    isolate: true,          // fresh context per file (safer, slower)
    testTimeout: 5000,
    coverage: { reporter: ['text', 'json', 'html'] },
  },
});
```
A `retry` option exists but masks real flakiness -- investigate a test that needs it rather than
leaning on it.

## Reporters
```ts
test: { reporters: ['default', 'json'], outputFile: './test-results.json' }
```
Built-ins: `default`, `dot`, `verbose`, `json`, `tap`, `junit`. Keep `'default'` in the array or
you lose terminal feedback; `json`/`junit` need `outputFile` to persist for CI dashboards.

## Hooks and test context
Reset shared state in `beforeEach` (state bleed is the top cause of order-dependent flakes); do
costly one-time work in `beforeAll`/`afterAll`. Always `await` async hooks.
```ts
beforeAll(async () => { await db.connect(); });
afterAll(async () => { await db.disconnect(); });
beforeEach(async () => { await db.clear(); });
```
For per-test data, prefer the isolated context / typed fixtures over module-level `let`:
```ts
const it = test.extend({ user: async ({}, use) => { await use({ id: 1 }); } });
it('reads fixture', ({ user, expect }) => { expect(user.id).toBe(1); });
```
Verify isolation with `describe.shuffle`.

## Parameterize, parallelize, filter
```ts
it.each([[3, 'triangle'], [4, 'quad']])('%i sides -> %s', (n, t) => { /* ... */ });
```
`describe.concurrent`/`test.concurrent` for long async, non-blocking tests only -- and use the
`expect` from the test's context argument, not the imported one, or you get wrong-test assertions.
Filter while iterating: `vitest <file>`, `vitest -t "name"`, `vitest --dir <path>`; watch keys
`p`/`t`/`f`/`a`. Guard stray `.only` in CI (`--allowOnly=false`).

## Run only what changed (dev speed)
```bash
vitest related src/utils/mathUtils.ts   # runs tests affected via the import graph
```
Great for a pre-commit hook; it can miss dynamic imports and non-code deps, so keep a full-suite
run in CI as the safety net.

## Debug from evidence
Read the expected/received diff first; isolate with `.only`; escalate to `vitest --inspect` /
`--inspect-brk` (+ `chrome://inspect`, single-thread) only when needed. Fix the implementation, not
the assertion. Remove `.only` and debug logs before committing.

## Migrating from Jest
Near drop-in on a Vite/TS project (native ESM + TS, no Babel/ts-jest). Replace `jest.*` with
`vi.*`; config lives in `vitest.config.ts`; set `globals: true` if the Jest code relied on implicit
globals. Jest snapshots are not directly portable; auto-mocking is less mature.

## CI
Run the suite on every PR and make it a required check.
```yaml
# .github/workflows/ci.yml
name: CI
on: { pull_request: { branches: [main] } }
jobs:
  test:
    runs-on: ubuntu-latest
    strategy: { matrix: { node-version: [20.x, 22.x] } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ matrix.node-version }}', cache: 'npm' }
      - run: npm ci                    # reproducible; not npm install
      - run: npm run test:run          # vitest run, not watch
```
Add `--coverage` + `actions/upload-artifact`, enable branch protection. Use active LTS Node (16 is
EOL). "Passes local, fails CI" is env/config drift -- pin env vars. CI/branch-protection is the one
**gated** piece here (org policy); everything else is local-first.

> Cross-browser E2E (Playwright `projects`) is a separate runner and belongs to
> **automate-e2e-self-testing** -- keep Vitest (`*.test.*`) and Playwright (`*.spec.ts`) on
> separate globs and configs; do not run Playwright specs through `vitest run`.

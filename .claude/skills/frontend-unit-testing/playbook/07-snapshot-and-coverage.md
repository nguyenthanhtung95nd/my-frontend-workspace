# 07 - Snapshot and coverage

## Snapshots: cheap, but sharp
`toMatchSnapshot()` captures serialized output and compares against a stored reference -- cheap
regression coverage for large, stable output (config blobs, serialized objects, mock payloads).
```ts
expect(formatUser({ name: 'Alice', age: 30 })).toMatchSnapshot();
// ignore dynamic fields so the snapshot stays stable:
expect(response).toMatchSnapshot({ id: expect.any(Number), createdAt: expect.any(String) });
```
Pair a snapshot with an explicit assertion on the value that actually matters
(`expect(user.name).toBe('Alice')`). Update intentionally with `vitest -u`.

**Every snapshot failure is a decision, not a rubber-stamp:** inspect the diff; if intentional,
update deliberately; if unexpected, fix the code -- the snapshot is the messenger. Review snapshot
diffs in code review like any change.

## Prefer targeted assertions over whole-component snapshots
A full-component snapshot grows into a thousand-line diff that tests markup shape, not user value,
and breaks on cosmetic changes.
```ts
const { getByRole } = render(<Button label="Click Me" />);
expect(getByRole('button')).toHaveTextContent('Click Me');
// or behavior:
const onClick = vi.fn();
render(<Button label="Go" onClick={onClick} />);
await userEvent.click(screen.getByRole('button'));
expect(onClick).toHaveBeenCalledOnce();
```
Reserve snapshots for genuinely large stable data; keep each one small and focused (split the test
if it runs hundreds of lines).

## Coverage is a diagnostic, not a target
Coverage measures how much code ran, not whether behavior is correct -- 100% is reachable with zero
real assertions. Use the report to spot code you forgot to think about, then decide if it deserves
a test.
```ts
// vitest.config.ts
test: {
  coverage: {
    include: ['src/**/*'],
    exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts', '**/*.config.*'],
    thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },  // keep low; guard drops
  },
}
```
Run `vitest --coverage` (v8 provider); ignore genuinely untestable lines with `/* v8 ignore next */`.
Prioritize critical paths (auth, data fetching, payments) and real-world edges (huge input,
third-party 500s). Chasing the last few percent produces trivial, fragile tests -- around 80% with
thoughtful tests is healthy. Never write `it('loads', () => expect(true).toBe(true))`.

## Organizing
Group with `describe`, name clearly, scope setup with hooks, parameterize with `test.each`. Keep
tests independent so order never matters; flatten deep nesting to `describe('Component - function')`.
Remove `.only`/`.skip` before committing (guard in CI). Annotations: `.only`, `.skip`, `.skipIf`,
`.todo`, `.concurrent`, `.shuffle`.

## In-source testing (scrappy checks only)
Co-locate a quick test inside the source file, gated so it never ships:
```ts
export function add(a: number, b: number) { return a + b; }
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('adds', () => expect(add(2, 3)).toBe(5));
}
```
Enable with `test: { includeSource: ['src/**/*.{ts,tsx}'] }`. The `import.meta.vitest` gate is
mandatory or the test code leaks into the production bundle. Graduate growing suites to real files.

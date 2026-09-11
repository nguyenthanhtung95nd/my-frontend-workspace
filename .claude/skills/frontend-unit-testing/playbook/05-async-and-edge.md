# 05 - Async and edge cases

## Async assertions can silently never run
Make the test `async` and `await` the work -- an assertion inside an un-awaited callback passes
falsely because the test ends before it runs.
```ts
// WRONG: returns a pending Promise, never awaited -> false pass
it.fails('no await', () => { expect(addAsync(2, 3)).toBe(5); });   // Received "Promise {}"
// RIGHT
it('awaits result', async () => { expect(await addAsync(2, 3)).toBe(5); });
```
The `done` callback style is not supported -- use `async/await`. Guard with `expect.hasAssertions()`
on async tests so a no-op run fails loudly.

## Promises: test both paths
```ts
await expect(fetchUser('u1')).resolves.toEqual({ id: 'u1', role: 'admin' });
await expect(fetchUser('bad')).rejects.toThrow('User not found');
// return form (no async keyword needed):
it('resolves', () => expect(fetchUser('u1')).resolves.toBeDefined());
```
`.resolves`/`.rejects` do nothing unless you `await` or `return` them. With fake timers, advance
before awaiting: `const p = delayedLoad(); vi.advanceTimersByTime(3000); await expect(p).resolves...`.

## Async errors are not sync throws
A rejected promise is not a thrown error -- `expect(() => ...).toThrow` will miss it.
```ts
await expect(fetchData()).rejects.toThrow('Network error');
```
Prefer `.rejects.toThrow` over manual `try/catch` (a `try` with no assertion on the catch side can
pass on a non-throw).

## The unhappy path
For every function, test bad inputs, boundaries, and dependency failures alongside success.
```ts
expect(() => parseAge('thirty')).toThrow('Invalid age format');
expect(() => parseAge(null)).toThrow('Invalid age format');
expect(() => parseAge(-5)).toThrow('Age must be between 0 and 120');
expect(parseAge(25)).toBe(25);
// dependency failure via spy
vi.spyOn(db, 'findUser').mockResolvedValue(null);
await expect(getUser(1)).rejects.toThrow('User not found');
```
Cover `null` / `undefined` / wrong-type, divide-by-zero, and negative/zero values. Happy-path-only
tests hide real-world breakage.

## Every branch, every boundary
Bugs hide in the untested branch and the off-by-one boundary (`>` vs `>=`). Use a table to keep
branches exhaustive and readable:
```ts
const tierDiscount = (n: number) => (n > 10 ? 0.2 : n > 5 ? 0.1 : 0);
it.each([
  [11, 0.2], [7, 0.1], [3, 0],
  [5, 0], [10, 0.1],   // exact boundaries
  [0, 0], [-1, 0],     // edges
])('items=%i -> %f', (n, expected) => {
  expect(tierDiscount(n)).toBe(expected);
});
```
After changing a threshold, re-run -- a missed `else` or wrong comparator surfaces immediately.

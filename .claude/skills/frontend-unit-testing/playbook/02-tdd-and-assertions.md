# 02 - TDD and assertions

## Red-green-refactor
Write the failing test first, make it pass minimally, then refactor while green.
```ts
// RED: test first, watch it fail
test('formats price with currency', () => {
  expect(formatPrice(1000)).toBe('$10.00');   // formatPrice not written yet
});
// GREEN: minimal implementation
export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
// REFACTOR: improve while green (e.g. Intl.NumberFormat)
```
A test that passes before you write code proves nothing -- always see red first. "Minimal" means
minimal; resist gold-plating during green. TDD alone does not cover edges -- add them deliberately.

## Pick the right equality matcher
| Matcher | Use for |
|---------|---------|
| `toBe` | primitives / same reference (`Object.is`) |
| `toEqual` | recursive structural match; ignores `undefined` props |
| `toStrictEqual` | structural AND type-strict (undefined props + class vs literal matter) |

```ts
expect(2).toBe(2);
expect({ a: 1 }).toEqual({ a: 1 });
expect({ a: 1 }).toEqual({ a: 1, b: undefined });          // passes (undefined ignored)
expect({ a: 1 }).not.toStrictEqual({ a: 1, b: undefined }); // strict cares
expect(new User('A')).not.toStrictEqual({ name: 'A' });     // class vs literal
```
`toBe` on an object/array/function compares by reference and fails on structurally-equal values.
Reach for `toStrictEqual` when a DTO's exact shape/type matters.

## Asymmetric matchers (ignore volatile fields)
Assert only what you care about; ignore ids, timestamps, and incidental extras so one unrelated
change does not break many tests.
```ts
expect(user).toEqual({ id: expect.stringMatching(/^user-/), name: 'Grace' });
expect(response).toEqual(expect.objectContaining({ status: 'ok' }));  // ignores extra keys
expect(list).toEqual(expect.arrayContaining(['a', 'b']));             // ignores order/extras
expect(id).toEqual(expect.any(String));
```
Use sparingly -- over-loosening makes a test meaningless. If every property matters, use plain
`toEqual`.

## Custom matchers (when a check genuinely repeats)
Extract repeated assertion logic into a named matcher with a clear message; register it in the
setup file.
```ts
// setup.ts
expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return { pass, message: () => `expected ${received} ${pass ? 'not ' : ''}to be within ${min}-${max}` };
  },
});
expect(10).toBeWithinRange(5, 15);
```
Provide both positive and negative messages via the `pass` flag; in TS, augment the `Assertion`
interface for types. Keep matchers single-purpose.

## Assert arguments and errors, not just "it ran"
```ts
const spy = vi.spyOn(console, 'log');
log('hi');
expect(spy).toHaveBeenCalledWith('hi');
expect(spy).toHaveBeenNthCalledWith(1, 'hi');   // pin a specific call
spy.mockRestore();
```
For errors, wrap the throwing call in a function and assert the message so you know it threw for
the right reason:
```ts
expect(() => parse('foo')).toThrow(/cannot be parsed/);   // callback, not parse('foo') directly
```
`expect(parse('foo')).toThrow()` (unwrapped) throws before asserting and fails wrongly. Write
descriptive error messages -- `'[object Object]' cannot be parsed` is useless in a large codebase.

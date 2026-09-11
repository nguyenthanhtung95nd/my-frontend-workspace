# 03 - Advanced types

Reach for these when a pattern genuinely repeats or a library-grade API needs guarantees -- not by
default (they cost compile time and readability).

## Generics
Type parameters preserve the caller's exact type instead of losing it to `any`.
```ts
function getProperty<T, K extends keyof T>(o: T, k: K): T[K] { return o[k]; }
interface ListProps<T> { items: T[]; renderItem: (i: T) => React.ReactNode; }
function List<T>({ items, renderItem }: ListProps<T>) { /* ... */ }
```
In `.tsx`, disambiguate from JSX with a trailing comma: `<T,>`. Give defaults (`<T = string>`) to
avoid `unknown`. Constrain rather than exact-shape (`T extends { id: string }`). Do not over-genericize
single-use code.

## Conditional and mapped types
Type-level if/else (`extends ? :`, with `infer`) and property transforms (`in keyof`, with key
remapping `as`).
```ts
type ElementOf<T> = T extends Array<infer I> ? I : T;
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] };  // filter
```
Conditionals **distribute** over unions -- wrap in a tuple `[T] extends [U]` to stop it. Recursion has
a depth limit; use a tail-recursive accumulator with a depth guard.

## Template literal types
Type-check string patterns (routes, class names, event names) instead of bare `string`.
```ts
type Handler = `on${Capitalize<'click' | 'focus'>}`;   // 'onClick' | 'onFocus'
type CSSValue = `${number}${'px' | 'rem' | '%'}`;
```
They express intent, not real format validation (no email regex at the type level).

## `satisfies` and `as const`
Get constraint-checking **and** literal inference at once.
```ts
const sizes = ['sm', 'md', 'lg'] as const;
type Size = (typeof sizes)[number];                    // 'sm' | 'md' | 'lg'
const theme = { primary: '#3b82f6' } as const satisfies Record<string, string>;
```
Annotating `: Record<string, string>` alone widens away the literals -- `satisfies` keeps them.

## Function overloads
Multiple call signatures over one implementation, for ergonomic APIs (string vs object, controlled vs
uncontrolled). Put the most specific signature first; the implementation signature is not visible to
callers and must satisfy every overload. Prefer a union/generic when it is clearer.

## Type-level testing
Lock generics, overloads, and public props against silent regressions -- run in CI.
```ts
import { expectTypeOf } from 'vitest';
expectTypeOf(x.value).toEqualTypeOf<number>();
// @ts-expect-error -- anchors require href
render(<Button as="a" />);   // the @ts-expect-error must actually error or the test fails
```
Snapshot exported types to guard a public API.

## Compile performance in large codebases
- Split into composite projects with `references` (`composite: true`, `incremental: true`,
  `tsBuildInfoFile`); `tsc --build` rechecks only what changed.
- Use type-only imports; prefer a `const` object over a giant literal union.
- Avoid barrel `export *`, circular deps, deep recursive types, and huge unions. Keep `skipLibCheck`
  on and `exclude` tight.

## Reading TS errors
Parse each error as what/where/why and start from the innermost mismatch: hover the types, trace the
origin, minimize, and (temporarily) `as any` only to inspect a shape -- then fix properly and remove
it. `not assignable to never` means an impossible/exhausted state. Narrow `unknown` with an `is`
predicate, never `any`.

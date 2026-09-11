# 02 - Type system

The fundamentals that make every React pattern feel natural. Think in shapes, prefer inference, model
state as unions, and make invalid states unrepresentable.

## Structural typing
Compatibility is by shape, not name -- "walks like a duck." This is what makes prop spreading and
composition work.
```ts
interface Greetable { name: string; }
greet({ name: 'Bob', age: 30 });   // extra props OK (not an object literal)
type UserId = string & { __brand: 'UserId' };   // brand when you need nominal safety
```
Object **literals** get excess-property checking (a `typo` errors); a spread, an intermediate
variable, or `as` bypasses it. `private` class members break structural compatibility.

## unknown over any
`unknown` = "don't know yet" (safe, must narrow); `any` = "don't care" (disables checking). Every
`any` is a latent crash -- default to `unknown` at boundaries and narrow with a guard.
```ts
function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null && 'id' in v && typeof (v as User).id === 'string';
}
try { /* ... */ } catch (e: unknown) { if (e instanceof Error) log(e.message); }
function assertDefined<T>(v: T | null | undefined): asserts v is T { if (v == null) throw new Error(); }
```
`JSON.parse` and untyped libraries return `any` -- contain it and re-expose `unknown`.

## Unions, intersections, guards
Union (`|`) = or (only common members accessible on the bare union); intersection (`&`) = and
(compose props). Narrow with predicates, not assertions.
```ts
type ButtonProps = BaseProps & StyledProps & A11yProps;   // intersection composes
function isBird(p: Pet): p is Bird { return 'fly' in p; } // predicate narrows
```

## Discriminated unions -- the top state pattern
A shared literal tag (`status`/`type`/`kind`) lets TS auto-narrow each variant and enforce
exhaustiveness. This makes invalid states impossible.
```ts
type FetchState<T> =
  | { status: 'idle' } | { status: 'loading' }
  | { status: 'success'; data: T } | { status: 'error'; error: Error };

switch (state.status) {
  case 'success': return state.data;       // narrowed to the success shape
  default: { const _exhaustive: never = state; throw new Error(_exhaustive); }
}
```
No discriminant means fragile `'field' in props` checks; an optional discriminant defeats the purpose.

## Narrowing along control flow
Guards refine types per branch: `typeof`, `instanceof`, `in`, equality, truthiness.
```ts
function isNotNull<T>(v: T | null): v is T { return v !== null; }
items.filter(isNotNull);   // .filter(x => x !== null) does NOT narrow -- use a guard fn
```
Optional chaining yields `T | undefined`; re-check before use.

## Inference: explicit at boundaries, implicit within
Let TS infer locals, returns, and callbacks; annotate params, props, empty collections, and
constraints.
```ts
const [items, setItems] = useState<string[]>([]);   // an empty [] infers never[]
const config = { method: 'GET' } as const;          // literal + readonly
const cfg = { port: 3000 } satisfies Record<string, number>; // constrain but keep `port: number`
```
`const items = []` infers `any[]`; `let s = 'pending'` widens to `string` (use `as const`).

## Utility types -- the type-level standard library
Derive from one source-of-truth model instead of hand-writing parallel shapes (kills drift, zero
runtime cost).
```ts
type UserUpdate  = Partial<Pick<User, 'name' | 'email'>>;
type UserCreate  = Omit<User, 'id' | 'createdAt'>;
type PublicUser  = Omit<User, 'password'>;
type Perms       = Record<Role, string[]>;
type Data        = Awaited<ReturnType<typeof fetchUser>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;   // custom
```
`Record<string, any>` throws away safety -- be specific about the value type. Name intermediate
aliases instead of long inline chains, and cap depth on deep recursive utilities (they slow compile).
